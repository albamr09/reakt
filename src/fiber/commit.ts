import { ROOT_TYPE } from "@reakt/constants";
import { updateLastCommitFiberTree } from "@reakt/fiber/state";
import { isTextHTMLNode } from "@reakt/node";
import type { Fiber } from "@reakt/types";

/**
 * Commits the entire fiber tree to the DOM, starting from the root fiber.
 *
 * This function initiates the commit phase, which recursively traverses the fiber tree
 * and appends all fiber DOM nodes to their respective parent DOM nodes in the actual DOM.
 * This is called after all fibers have been processed in the work loop.
 *
 * @param rootFiber - The root fiber of the fiber tree to commit to the DOM.
 */
export const commitFiberRoot = (rootFiber: Fiber) => {
	commitWork(rootFiber);
	updateLastCommitFiberTree(rootFiber);
};

/**
 * Recursively commits a fiber and its descendants to the DOM.
 *
 * Traverses the fiber tree in a depth-first manner, appending each fiber's child DOM node
 * to the fiber's DOM node. Skips fibers that don't have a DOM node or a valid child.
 *
 * @param fiber - The fiber to commit. If undefined or if the fiber has no DOM node,
 *                the function returns early without processing.
 */
const commitWork = (fiber?: Fiber) => {
	// Early return if no fiber or no DOM
	if (!checksIfFiberHasDom(fiber)) return;

	if (fiber.effect === "DELETION") {
		commitDeletion(fiber);
		return;
	}

	if (fiber.effect === "UPDATE") {
		commitUpdate(fiber);
	}

	if (fiber.effect === "PLACEMENT") {
		commitPlacement(fiber);
	}

	commitWork(fiber.child);
	commitWork(fiber.sibling);
};

const checksIfFiberHasDom = (
	fiber?: Fiber,
): fiber is Fiber & { dom: NonNullable<Fiber["dom"]> } => {
	return fiber !== undefined && fiber.dom !== undefined && fiber.dom !== null;
};

// TODO: add JSdoc
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

// TODO: add JSDoc
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

// TODO: add JSDoc
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

// TODO: add JSdoc
const canAppendToParent = (
	fiber: Fiber,
): fiber is Fiber & {
	parent: NonNullable<Fiber["parent"]> & { dom: NonNullable<Fiber["dom"]> };
} => {
	return fiber.parent?.dom !== undefined && fiber.element.type !== ROOT_TYPE;
};
