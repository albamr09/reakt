import { PRIMITIVE_ELEMENT_TYPE } from "@reakt/constants";
import type {
	PrimitiveReaktElement,
	ReaktElement,
	ReaktElementProps,
} from "@reakt/types";

/**
 * Creates a text element from a string value.
 *
 * @param value - The text content to convert into an element
 * @returns An element object with type "PRIMITIVE_ELEMENT_TYPE" and the value as nodeValue
 */
const createPrimitiveElement = (value: string): PrimitiveReaktElement => {
	return {
		type: PRIMITIVE_ELEMENT_TYPE,
		props: {
			nodeValue: value,
			children: [],
		},
	};
};

/**
 * Creates a virtual DOM element with the specified type, props, and children.
 *
 * @template T - The type of the props object
 * @param type - The element type (e.g., "div", "span", or a component)
 * @param props - The properties/attributes to apply to the element
 * @param children - Variable number of child elements (strings are automatically converted to text elements)
 * @returns An element object with the specified type, props, and children
 *
 * @example
 * ```ts
 * createElement("div", { id: "container" }, "Hello", "World")
 * createElement("span", { className: "text" }, createElement("strong", {}, "Bold"))
 * ```
 */
export const createElement = <T extends ReaktElementProps>(
	type: ReaktElement<T>["type"],
	props: ReaktElement<T>["props"],
	// Children is always an array
	...children: ReaktElement[]
): ReaktElement<T> => {
	return {
		type,
		props: {
			...props,
			children: children.map((child) =>
				typeof child === "object" ? child : createPrimitiveElement(child),
			),
		},
	};
};
