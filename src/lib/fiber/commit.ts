import {
	canAddFiberDOMToParent,
	canFiberBeCommited,
	hasFiberValidDOM,
	isHTMLElementFiber,
	isTextFiber,
} from "@reakt/lib/fiber/utils";
import { updateProps } from "@reakt/lib/node";
import type { Fiber } from "@reakt/types";

/**
 * Commits the entire fiber tree to the DOM, starting from the root fiber.
 *
 * This function initiates the commit phase, which performs three main operations:
 * 1. Recursively traverses the fiber tree and applies all fiber effects (UPDATE, PLACEMENT)
 *    to the DOM, appending DOM nodes to their respective parent DOM nodes.
 * 2. Handles deletion of fibers marked for deletion, removing their DOM nodes from the tree.
 * 3. Updates the internal state with the last committed fiber tree for future reconciliation.
 *
 * This is called after all fibers have been processed in the work loop and is the final
 * step that makes all changes visible in the actual DOM.
 *
 * @param rootFiber - The root fiber of the fiber tree to commit to the DOM.
 */
export const commitNewFiberTree = (rootFiber: Fiber) => {
	commitWork(rootFiber);
};

/**
 * Recursively commits a fiber and its descendants to the DOM.
 *
 * Traverses the fiber tree in a depth-first manner, applying fiber effects to the DOM:
 * - For fibers with "UPDATE" effect: updates the DOM node's properties based on changed props.
 * - For fibers with "PLACEMENT" effect: appends the fiber's DOM node to its parent DOM node.
 * - For fibers with "DELETION" effect: removes the fiber's DOM node from its parent DOM node.
 *
 * After processing the current fiber's effects, recursively processes its child and sibling fibers.
 * Skips fibers that don't have a DOM node, returning early without processing.
 *
 * @param fiber - The fiber to commit. If undefined or if the fiber has no DOM node,
 *                the function returns early without processing.
 */
const commitWork = (fiber?: Fiber) => {
	// Early return if no fiber or no DOM
	if (!canFiberBeCommited(fiber)) return;

	if (fiber.effect === "UPDATE") {
		commitUpdate(fiber);
	}

	if (fiber.effect === "PLACEMENT") {
		commitPlacement(fiber);
	}

	if (fiber.effect === "DELETION") {
		commitDeletion({ fiber, parent: fiber.parent });
	}

	commitWork(fiber.child);
	commitWork(fiber.sibling);
};

/**
 * Updates a fiber's DOM node with changed properties.
 *
 * This function is called during the commit phase for fibers with the "UPDATE" effect.
 * It compares the fiber's current props with the props from its alternate (previous version)
 * and applies the necessary changes to the DOM node.
 *
 * @param fiber - The fiber to update. Must have a DOM node and an alternate fiber.
 *                Returns early if either is missing.
 */
const commitUpdate = (fiber: Fiber) => {
	if (!fiber.dom || !fiber.alternate) return;

	// Handle text nodes
	if (isTextFiber(fiber) && isTextFiber(fiber.alternate)) {
		const { nodeValue: newNodeValue } = fiber.element.props;
		const { nodeValue: oldNodeValue } = fiber.alternate.element.props;
		if (newNodeValue !== oldNodeValue) {
			fiber.dom.nodeValue = `${newNodeValue}`;
		}
		return;
	}

	// Handle html nodes
	if (isHTMLElementFiber(fiber)) {
		const modifiedDOMNode = updateProps({
			node: fiber.dom,
			newProps: fiber.element.props,
			oldProps: fiber.alternate.element.props,
		});
		fiber.dom = modifiedDOMNode;
	}
};

/**
 * Places a fiber's DOM node into the DOM tree by appending it to its parent.
 *
 * This function is called during the commit phase for fibers with the "PLACEMENT" effect.
 * It appends the fiber's DOM node to its parent's DOM node, making it visible in the DOM.
 *
 * @param fiber - The fiber to place in the DOM. Must have a non-null DOM node.
 */
const commitPlacement = (fiber: Fiber) => {
	// Only append to parent if it is not the root element
	if (canAddFiberDOMToParent(fiber)) {
		// Find the first parent with a DOM node, as with functional components, the parent
		// is the function itself, and the DOM node is the parent of the function.
		const parentWithDOM = findFirstFiberWithDOM(fiber.parent);
		if (!hasFiberValidDOM(parentWithDOM)) {
			console.warn(
				`Could not find any parent with a DOM for ${fiber.element.type}`,
			);
			return;
		}
		parentWithDOM.dom.appendChild(fiber.dom);

		// If type changed, remove old DOM node
		if (fiber.alternate?.dom && fiber.alternate.dom !== fiber.dom) {
			parentWithDOM.dom.removeChild(fiber.alternate.dom);
		}
	}
};

/**
 * Recursively finds the first ancestor fiber with a DOM node.
 * @param fiber - The fiber to start searching from.
 * @returns The first fiber with a DOM node, or undefined if none found.
 */
const findFirstFiberWithDOM = (fiber: Fiber) => {
	if (fiber.dom) {
		return fiber;
	}

	if (!fiber.parent) return;

	return findFirstFiberWithDOM(fiber.parent);
};

/**
 * Deletes a fiber from the DOM.
 * @param fiber - The fiber to delete.
 * @param parent - The parent fiber containing the fiber to delete.
 */
const commitDeletion = ({ fiber, parent }: { fiber: Fiber; parent: Fiber }) => {
	// Find the parent with a DOM node, as the parent could be a function component
	const parentWithDOM = findFirstFiberWithDOM(parent);
	if (!parentWithDOM?.dom) {
		console.warn(
			`Could not find parent with DOM for deletion of ${fiber.element.type}`,
		);
		return;
	}

	if (fiber.dom) {
		// Remove this node from parent
		parentWithDOM.dom.removeChild(fiber.dom);
	} else if (fiber.child) {
		commitDeletion({ fiber: fiber.child, parent: parentWithDOM });
	}
};
