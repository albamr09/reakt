import {
	clearOldFibersToDelete,
	getOldFibersToDelete,
	updateLastCommitFiberTree,
} from "@reakt/fiber/state";
import { canAppendToParent, checksIfFiberHasDom } from "@reakt/fiber/utils";
import { isTextHTMLNode } from "@reakt/node";
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
export const commitFiberRoot = (rootFiber: Fiber) => {
	commitWork(rootFiber);
	handleDeletedFibers();
	updateLastCommitFiberTree(rootFiber);
};

/**
 * Recursively commits a fiber and its descendants to the DOM.
 *
 * Traverses the fiber tree in a depth-first manner, applying fiber effects to the DOM:
 * - For fibers with "UPDATE" effect: updates the DOM node's properties based on changed props.
 * - For fibers with "PLACEMENT" effect: appends the fiber's DOM node to its parent DOM node.
 *
 * After processing the current fiber's effects, recursively processes its child and sibling fibers.
 * Skips fibers that don't have a DOM node, returning early without processing.
 *
 * @param fiber - The fiber to commit. If undefined or if the fiber has no DOM node,
 *                the function returns early without processing.
 */
const commitWork = (fiber?: Fiber) => {
	// Early return if no fiber or no DOM
	if (!checksIfFiberHasDom(fiber)) return;

	if (fiber.effect === "UPDATE") {
		commitUpdate(fiber);
	}

	if (fiber.effect === "PLACEMENT") {
		commitPlacement(fiber);
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

	const oldProps = fiber.alternate.element.props;
	const newProps = fiber.element.props;

	// Handle text nodes
	if (isTextHTMLNode(fiber.dom)) {
		// TODO: fix this
		// @ts-expect-error
		const newValue = newProps.nodeValue;
		// TODO: fix this
		// @ts-expect-error
		if (newValue !== oldProps.nodeValue) {
			fiber.dom.nodeValue = newValue;
		}
		return;
	}

	// TODO: Remove old props, update changed props, add new props
};

/**
 * Places a fiber's DOM node into the DOM tree by appending it to its parent.
 *
 * This function is called during the commit phase for fibers with the "PLACEMENT" effect.
 * It appends the fiber's DOM node to its parent's DOM node, making it visible in the DOM.
 *
 * @param fiber - The fiber to place in the DOM. Must have a non-null DOM node.
 */
const commitPlacement = (fiber: Fiber & { dom: NonNullable<Fiber["dom"]> }) => {
	// Only append to parent if it is not the root element
	if (canAppendToParent(fiber)) {
		fiber.parent.dom.appendChild(fiber.dom);

		// If type changed, remove old DOM node
		if (fiber.alternate?.dom && fiber.alternate.dom !== fiber.dom) {
			fiber.parent.dom.removeChild(fiber.alternate.dom);
		}
	}
};

/**
 * Handles deletion of all fibers marked for deletion during the commit phase.
 *
 * This is called as part of the commit phase after all UPDATE and PLACEMENT effects
 * have been applied, ensuring that deleted nodes are removed from the DOM.
 */
const handleDeletedFibers = () => {
	// Delete old nodes
	getOldFibersToDelete().forEach((fiber) => {
		commitDeletion(fiber);
	});

	clearOldFibersToDelete();
};

/**
 * Recursively deletes a fiber and all its descendants from the DOM.
 *
 * The deletion order (children first, then the node itself) ensures that the DOM
 * tree is properly cleaned up from the leaves to the root.
 *
 * @param fiber - The fiber to delete. Must have a DOM node and a parent with a DOM node.
 *                Returns early if either is missing.
 */
const commitDeletion = (fiber: Fiber) => {
	if (!fiber.dom || !fiber.parent?.dom) return;

	// Recursively delete all children
	let child = fiber.child;
	while (child) {
		commitDeletion(child);
		child = child.sibling;
	}

	// Then remove this node from parent
	fiber.parent.dom.removeChild(fiber.dom);
};
