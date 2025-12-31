import { isPrimitiveElement } from "@reakt/element";
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

		// If there are still fibers to process, schedule the next work loop
		if (currentFiber !== undefined) {
			requestIdleCallback(workLoop);
		}
	};

	requestIdleCallback(workLoop);
};

/**
 * Performs a unit of work on a fiber: commits it to the DOM, creates child fibers, and returns the next fiber to process.
 *
 * This function processes a single fiber in the work loop by:
 * 1. Validating that the fiber has a valid parent with a DOM node
 * 2. Creating and appending the fiber's DOM node to its parent
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

	fiber = commitFiberToDOM(fiber);
	fiber = createChildFibers(fiber);
	return findNextFiberInTraversal(fiber);
};

/**
 * Creates the initial root fiber for rendering, setting up the host root fiber structure.
 *
 * Creates a host root fiber that represents the container DOM element, and then creates
 * the root fiber for the element to be rendered.
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
	// Create a host root element (sentinel) to represent the container
	const hostRootElement: ReaktElement = {
		type: "HOST_ROOT",
		props: { children: [] },
	};

	const hostRootFiber: Fiber = {
		dom: container,
		element: hostRootElement,
	};

	return {
		element,
		parent: hostRootFiber,
	};
};

const doesFiberHaveValidParent = (
	fiber: Fiber,
): fiber is Fiber & { parent: Fiber & { dom: HTMLElement } } => {
	return fiber.parent?.dom !== undefined && !isTextHTMLNode(fiber.parent.dom);
};

/**
 * Commits a fiber to the DOM by creating its DOM node and appending it to the parent.
 *
 * @param fiber - The fiber to commit to the DOM. Must have a valid parent with a DOM node.
 * @returns The fiber with its `dom` property set to the created DOM node.
 */
const commitFiberToDOM = (
	fiber: Fiber & {
		parent: NonNullable<Fiber["parent"]> & { dom: NonNullable<Fiber["dom"]> };
	},
) => {
	let domNode: HTMLElement | Text;
	if (isPrimitiveElement(fiber.element)) {
		domNode = createPrimitiveNode({ element: fiber.element });
	} else {
		domNode = createNode({ element: fiber.element });
	}

	fiber.dom = domNode;
	fiber.parent.dom.appendChild(domNode);

	return fiber;
};

/**
 * Creates child fibers from the element's children and links them in a sibling chain.
 *
 *  Iterates through the element's children, creating a fiber for each child and linking
 *  the siblings together as a linked list.
 *
 *  fiber (parent)
 *    child --> sibling --> sibling --> ... --> sibling
 *
 * @param fiber - The parent fiber whose children will be converted into child fibers.
 * @returns The parent fiber with its `child` property set to the first child fiber, and all
 *          children linked via the `sibling` property.
 */
const createChildFibers = (fiber: Fiber) => {
	const { children } = fiber.element.props;

	let previousSibling: Fiber | undefined;

	children.forEach((child) => {
		const childFiber: Fiber = {
			element: child,
			parent: fiber,
		};

		if (previousSibling === undefined) {
			// First child
			fiber.child = childFiber;
		} else {
			// Subsequent children - link as sibling of previous
			previousSibling.sibling = childFiber;
		}

		previousSibling = childFiber;
	});

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
