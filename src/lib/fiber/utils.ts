import { ROOT_TYPE } from "@reakt/constants";
import type { ExtendableHTMLElement, Fiber, FiberText } from "@reakt/types";

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
export const doesFiberHaveValidParent = (
	fiber: Fiber,
): fiber is Fiber & {
	parent: Fiber;
} => {
	// The root element does not have a parent
	if (fiber.element.type === ROOT_TYPE) {
		return true;
	}

	return fiber.parent !== undefined && !isTextFiber(fiber.parent);
};

/**
 * Type guard that checks if a fiber exists.
 *
 * @param fiber - The fiber to check. Can be `undefined`.
 */
export const canFiberBeCommited = (
	fiber?: Fiber,
): fiber is Fiber & { parent: NonNullable<Fiber["parent"]> } => {
	return (
		(fiber && fiber.parent !== undefined && fiber.parent != null) ||
		fiber?.element.type === ROOT_TYPE
	);
};

/**
 * Type guard that checks if a fiber can be appended to its parent DOM node.
 *
 * A fiber can be appended to its parent if:
 * - It has a parent fiber with a DOM node
 * - It is not the root element (root elements are containers and should not be appended)
 *
 * This is used during the commit phase to determine if a fiber's DOM node should
 * be appended to its parent's DOM node.
 *
 * @param fiber - The fiber to check.
 * @returns `true` if the fiber has a valid parent with a DOM node and is not the root element,
 *          narrowing the type to include a non-null parent with a non-null DOM node.
 *          Returns `false` if the fiber is the root element or lacks a parent with a DOM node.
 */
export const canAddFiberDOMToParent = (
	fiber: Fiber,
): fiber is Fiber & {
	dom: NonNullable<Fiber["dom"]>;
	parent: NonNullable<Fiber["parent"]>;
} => {
	return (
		fiber.element.type !== ROOT_TYPE &&
		fiber.dom !== undefined &&
		fiber.dom != null &&
		fiber?.parent !== undefined &&
		fiber.parent != null
	);
};

export const hasFiberValidDOM = (
	fiber?: Fiber,
): fiber is Fiber & { dom: NonNullable<Fiber["dom"]> } => {
	return fiber?.dom !== undefined;
};

/**
 * Type guard to check if the dom node of a fiber is a text node.
 *
 * @param fiber - The fiber to check
 * @returns True if the dom node of the fiber is a text node
 */
export const isTextFiber = (fiber: Fiber): fiber is FiberText => {
	return fiber.dom instanceof Text;
};

/**
 * Type guard to check if a fiber is associated with an HTML element.
 *
 * @param fiber - The fiber to check
 * @returns True if the fiber's DOM node is an HTML element
 */
export const isHTMLElementFiber = (
	fiber: Fiber,
): fiber is Fiber & { dom: ExtendableHTMLElement } => {
	return !isTextFiber(fiber) && fiber.dom instanceof HTMLElement;
};
