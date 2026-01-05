import { PRIMITIVE_ELEMENT_TYPE } from "@reakt/constants";
import type {
	FunctionReaktElement,
	PrimitiveReaktElement,
	ReaktElement,
	ReaktElementProps,
} from "@reakt/types";
import equal from "fast-deep-equal";

/**
 * Creates a virtual DOM element with the specified type, props, and children.
 *
 * @template T - The type of the props object
 * @param type - The element type (e.g., "div", "span", or a component)
 * @param props - The properties/attributes to apply to the element
 * @param children - Variable number of child elements (strings are automatically converted to text elements, arrays are flattened)
 * @returns An element object with the specified type, props, and children
 *
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
	return children.reduce(
		(acc, child) => {
			if (Array.isArray(child)) {
				// Recursively flatten nested arrays
				acc.push(...flattenChildren(child));
			} else if (typeof child === "string") {
				// Convert strings to primitive elements
				acc.push(createPrimitiveElement(child));
			} else if (child != null && typeof child === "object") {
				// Keep ReaktElement objects as is
				acc.push(child);
			}

			// Skip null, undefined, false, true
			return acc;
		},
		[] as Array<ReaktElement>,
	);
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

/**
 * Type guard that checks if a prop is a valid event listener.
 * Validates both the key (must be an event listener prop name) and value (must be a function).
 *
 * @param key - The prop key to check
 * @param value - The prop value to check
 * @returns True if both key and value are valid for an event listener, and narrows value to EventListener
 */
export const checkIfPropIsListener = (
	key: string,
	value: Omit<ReaktElementProps, "children">[string],
): value is EventListener => {
	if (!key.startsWith("on") || key.length <= 2) {
		return false;
	}

	if (typeof value !== "function") {
		return false;
	}

	const nativeListenerName = key.toLowerCase();
	return nativeListenerName in HTMLElement.prototype;
};

/**
 * Maps a prop key (e.g., "onClick") to its native event listener name (e.g., "click").
 *
 * @param propKey - The prop key to map (must start with "on")
 * @returns The native event listener name from HTMLElementEventMap
 */
export const mapPropKeyToListenerName = (
	propKey: string,
): keyof HTMLElementEventMap => {
	return propKey.slice(2).toLowerCase() as keyof HTMLElementEventMap;
};

/**
 * Checks if a prop value has changed between renders.
 * @param newValue - The new prop value.
 * @param oldValue - The old prop value.
 * @returns `true` if the values differ (uses deep equality for objects/arrays).
 */
export const hasChanged = (
	newValue: Omit<ReaktElementProps, "children">[string],
	oldValue: Omit<ReaktElementProps, "children">[string],
): boolean => {
	// For primitives use direct comparison
	if (typeof oldValue !== "object" || oldValue === null) {
		return oldValue !== newValue;
	}

	// For arrays/objects use deep equality
	return !equal(oldValue, newValue);
};

/**
 * Type guard to check if an element is a function element.
 * @param element - The element to check.
 * @returns `true` if the element type is a function.
 */
export const isFunctionElement = (
	element: ReaktElement,
): element is FunctionReaktElement => {
	return typeof element.type === "function";
};

/**
 * Creates children for a function element by calling the function with its props.
 * @param element - The function element to create children for.
 * @returns The element with its children populated.
 */
export const createFuncionElementChildren = (
	element: FunctionReaktElement,
): ReaktElement => {
	const child = element.type(element.props);
	// If function component returns null, render nothing (empty children array)
	// This matches React's behavior where null means "render nothing"
	element.props.children = child === null || child === undefined ? [] : [child];
	return element;
};
