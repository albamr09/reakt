import { ROOT_TYPE } from "@reakt/constants";
import { isPrimitiveElement } from "@reakt/element";
import { commitFiberRoot } from "@reakt/fiber/commit";
import { reconcileChildFibers } from "@reakt/fiber/reconciliation";
import { lastCommitedFiberTree } from "@reakt/fiber/state";
import { createNode, createPrimitiveNode, isTextHTMLNode } from "@reakt/node";
import type { Fiber, ReaktElement } from "@reakt/types";

/**
 * Starts the work loop to process fibers and render them to the DOM.
 *
 * Begins processing the fiber tree using requestIdleCallback for incremental rendering.
 * The work loop will continue until all fibers have been processed or the browser
 * needs to yield control for other tasks.
 *
 * @param rootFiber - The root fiber to start processing from. Should be created using
 *                    `createRootFiber` before calling this function.
 */
export const startWorkLoop = (rootFiber: Fiber): void => {
	let currentFiber: Fiber | undefined = rootFiber;

	const workLoop: IdleRequestCallback = (deadline) => {
		let shouldYield = false;
		while (currentFiber !== undefined && !shouldYield) {
			currentFiber = performUnitOfWork(currentFiber);
			shouldYield = deadline.timeRemaining() < 1;
		}

		// When work loop finishes (all elements have been processed)
		// commit to DOM
		if (currentFiber === undefined && rootFiber) {
			commitFiberRoot(rootFiber);
			return;
		}

		// If there are still fibers to process, schedule the next work loop
		requestIdleCallback(workLoop);
	};

	requestIdleCallback(workLoop);
};

/**
 * Performs a unit of work on a fiber: creates its DOM node, creates child fibers, and returns the next fiber to process.
 *
 * This function processes a single fiber in the work loop by:
 * 1. Validating that the fiber has a valid parent with a DOM node
 * 2. Creating the fiber's DOM node (but not appending it - that happens in the commit phase)
 * 3. Creating child fibers from the element's children
 * 4. Returning the next fiber to process in the depth-first traversal
 *
 * @param fiber - The fiber to process. Must have a valid parent with a DOM node (HTMLElement, not Text).
 * @returns The next fiber to process in the traversal, or `undefined` if the fiber has an invalid parent
 *          (which stops processing of that branch). This can occur if:
 *          - The fiber's parent is undefined (should not happen in normal operation)
 *          - The fiber's parent has no DOM node
 *          - The fiber's parent is a Text node (text nodes cannot have children)
 * @throws {Error} If the fiber structure is invalid and cannot be recovered from.
 */
const performUnitOfWork = (fiber: Fiber): Fiber | undefined => {
	if (!doesFiberHaveValidParent(fiber)) {
		if (!fiber.parent) {
			throw new Error(
				`Fiber with element type "${fiber.element.type}" has no parent. ` +
					`This should not occur in normal operation and indicates a malformed fiber tree.`,
			);
		}

		if (!fiber.parent.dom) {
			throw new Error(
				`Fiber with element type "${fiber.element.type}" has a parent without a DOM node. ` +
					`Parent element type: "${fiber.parent.element.type}". ` +
					`This indicates the parent fiber was not properly committed to the DOM.`,
			);
		}

		// Text node parent is a recoverable edge case - log warning and skip
		console.warn(
			`Fiber with element type "${fiber.element.type}" has a Text node parent, which cannot have children. ` +
				`Skipping processing of this fiber branch.`,
		);
		return undefined;
	}

	fiber = createNodeFromFiber(fiber);
	fiber = reconcileChildFibers(fiber);
	return findNextFiberInTraversal(fiber);
};

/**
 * Creates the initial root fiber for rendering, setting up the host root fiber structure.
 *
 * Creates a root fiber that represents the container DOM element, and then creates
 * the root fiber child from the element to be rendered.
 *
 * @param container - The DOM container where the element will be rendered.
 * @param element - The root virtual DOM element to render.
 * @returns The root fiber ready to be processed in the work loop.
 */
export const createRootFiber = ({
	container,
	element,
}: {
	container: HTMLElement;
	element: ReaktElement;
}): Fiber => {
	return {
		// Create a root element to represent the container
		element: {
			type: ROOT_TYPE,
			// Add the element as the children
			props: { children: [element] },
		},
		dom: container,
		// Set old fiber as the one last saved
		alternate: lastCommitedFiberTree,
	};
};

/**
 * Type guard that checks if a fiber has a valid parent for processing.
 *
 * A fiber has a valid parent if:
 * - It is a root element (root elements don't require a parent), OR
 * - It has a parent fiber with a DOM node that is an HTMLElement (not a Text node).
 *   Text nodes cannot have children in the DOM.
 *
 * @param fiber - The fiber to check for a valid parent.
 * @returns `true` if the fiber is a root element or has a valid parent with an HTMLElement DOM node.
 */
const doesFiberHaveValidParent = (
	fiber: Fiber,
): fiber is Fiber & { parent: Fiber & { dom: HTMLElement } } => {
	// The root element does not have a parent
	if (fiber.element.type === ROOT_TYPE) {
		return true;
	}

	return fiber.parent?.dom !== undefined && !isTextHTMLNode(fiber.parent.dom);
};

/**
 * Creates a DOM node for a fiber based on its element type.
 *
 * Creates either a primitive DOM node (Text) or a regular DOM node (HTMLElement)
 * depending on the fiber's element type, and assigns it to the fiber's `dom` property.
 * The DOM node is not appended to the document at this stage - that happens during
 * the commit phase via `commitWork`.
 *
 * @param fiber - The fiber for which to create a DOM node.
 * @returns The fiber with its `dom` property set to the created DOM node.
 */
const createNodeFromFiber = (fiber: Fiber) => {
	// Create dom node only if it does not exist already
	if (fiber.dom) return fiber;

	let domNode: HTMLElement | Text;
	if (isPrimitiveElement(fiber.element)) {
		domNode = createPrimitiveNode({ element: fiber.element });
	} else {
		domNode = createNode({ element: fiber.element });
	}

	fiber.dom = domNode;

	return fiber;
};

/**
 * Finds the next fiber in a depth-first traversal of the fiber tree.
 *
 * Tries to find the next fiber in the depth-first traversal by checking the child first,
 * then the siblings, and finally the parent.
 *
 *  parent -> sibling
 *  ^
 *  |
 *  ...
 *  parent -> sibling
 *  ^
 *  |
 *  parent -> sibling
 *  ^
 *  |
 *  sibling
 *
 * @param fiber - The starting fiber from which to find the next fiber.
 * @returns The next fiber in the depth-first traversal, or undefined if the root fiber is reached.
 */
const findNextFiberInTraversal = (fiber: Fiber) => {
	// Try child first (depth-first traversal)
	if (fiber.child) {
		return fiber.child;
	}

	// Then try sibling, or traverse up to the parent until we find a non-null sibling
	let nextFiber: Fiber | undefined = fiber;
	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling;
		}
		nextFiber = nextFiber.parent;
	}

	// If we reach the root, return undefined
	return undefined;
};
