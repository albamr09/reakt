import { PRIMITIVE_ELEMENT_TYPE } from "@reakt/constants";
import type {
	PrimitiveReaktElement,
	ReaktElement,
	ReaktElementProps,
} from "@reakt/types";

/**
 * Creates a virtual DOM element with the specified type, props, and children.
 *
 * @template T - The type of the props object
 * @param type - The element type (e.g., "div", "span", or a component)
 * @param props - The properties/attributes to apply to the element
 * @param children - Variable number of child elements (strings are automatically converted to text elements, arrays are flattened)
 * @returns An element object with the specified type, props, and children
 *
 * @example
 * ```ts
 * createElement("div", { id: "container" }, "Hello", "World")
 * createElement("span", { className: "text" }, createElement("strong", {}, "Bold"))
 * createElement("div", {}, [elem1, elem2]) // Arrays are automatically flattened
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
			children: flattenChildren(children),
		},
	};
};

/**
 * Flattens an array of children, handling nested arrays and converting strings to primitive elements.
 *
 * @param children - Array of children that may contain nested arrays
 * @returns Flattened array of ReaktElement
 */
const flattenChildren = (children: Array<ReaktElement>): ReaktElement[] => {
	const result: ReaktElement[] = [];

	for (const child of children) {
		if (Array.isArray(child)) {
			// Recursively flatten nested arrays
			result.push(...flattenChildren(child));
		} else if (typeof child === "string") {
			// Convert strings to primitive elements
			result.push(createPrimitiveElement(child));
		} else if (child != null && typeof child === "object") {
			// Keep ReaktElement objects as is
			result.push(child);
		}
		// Skip null, undefined, false, true (React-like behavior)
	}

	return result;
};

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
 * Type guard to check if an element is a primitive element.
 *
 * @param element - The element to check
 * @returns True if the element is a primitive element
 */
export const isPrimitiveElement = (
	element: ReaktElement,
): element is PrimitiveReaktElement => {
	return element.type === PRIMITIVE_ELEMENT_TYPE;
};
