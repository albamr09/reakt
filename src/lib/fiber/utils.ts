import { ROOT_TYPE } from "@reakt/constants";
import type { ExtendableHTMLElement, Fiber, FiberText } from "@reakt/types";

/**
 * Type guard that checks if a fiber has a valid parent for processing.
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
 * Type guard that checks if a fiber can be committed.
 * @param fiber - The fiber to check. Can be `undefined`.
 * @returns `true` if the fiber exists and has a parent or is the root element.
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
 * @param fiber - The fiber to check.
 * @returns `true` if the fiber has a valid parent with a DOM node and is not the root element.
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

/**
 * Type guard that checks if a fiber has a valid DOM node.
 * @param fiber - The fiber to check. Can be `undefined`.
 * @returns `true` if the fiber has a DOM node.
 */
export const hasFiberValidDOM = (
	fiber?: Fiber,
): fiber is Fiber & { dom: NonNullable<Fiber["dom"]> } => {
	return fiber?.dom !== undefined;
};

/**
 * Type guard to check if the dom node of a fiber is a text node.
 * @param fiber - The fiber to check.
 * @returns `true` if the dom node of the fiber is a text node.
 */
export const isTextFiber = (fiber: Fiber): fiber is FiberText => {
	return fiber.dom instanceof Text;
};

/**
 * Type guard to check if a fiber is associated with an HTML element.
 * @param fiber - The fiber to check.
 * @returns `true` if the fiber's DOM node is an HTML element.
 */
export const isHTMLElementFiber = (
	fiber: Fiber,
): fiber is Fiber & { dom: ExtendableHTMLElement } => {
	return !isTextFiber(fiber) && fiber.dom instanceof HTMLElement;
};
