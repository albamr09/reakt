import { ROOT_TYPE } from "@reakt/constants";
import { isTextHTMLNode } from "@reakt/node";
import type { Fiber } from "@reakt/types";

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
): fiber is Fiber & { parent: Fiber & { dom: HTMLElement } } => {
	// The root element does not have a parent
	if (fiber.element.type === ROOT_TYPE) {
		return true;
	}

	return fiber.parent?.dom !== undefined && !isTextHTMLNode(fiber.parent.dom);
};

/**
 * Type guard that checks if a fiber exists and has a DOM node.
 *
 * @param fiber - The fiber to check. Can be `undefined`.
 */
export const checksIfFiberHasDom = (
	fiber?: Fiber,
): fiber is Fiber & { dom: NonNullable<Fiber["dom"]> } => {
	return fiber !== undefined && fiber.dom !== undefined && fiber.dom !== null;
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
export const canAppendToParent = (
	fiber: Fiber,
): fiber is Fiber & {
	parent: NonNullable<Fiber["parent"]> & { dom: NonNullable<Fiber["dom"]> };
} => {
	return fiber.parent?.dom !== undefined && fiber.element.type !== ROOT_TYPE;
};
