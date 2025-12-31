/**
 * Represents a virtual DOM element in the Reakt library.
 *
 * @template T - The type of the props object
 */
export interface ReaktElement<T extends ReaktElementProps = ReaktElementProps> {
	/**
	 * The type of the element (e.g., "div", "span", or a component name).
	 */
	type: string;
	/**
	 * The properties/attributes of the element.
	 * Can include standard HTML attributes, custom properties, and a `children` array.
	 */
	props: T;
}

/**
 * Represents a primitive (text) element with a fixed structure.
 * The type is always PRIMITIVE_ELEMENT_TYPE, and props always contain nodeValue with an empty children array.
 */
export type PrimitiveReaktElement = ReaktElement<{
	nodeValue: string;
	children: [];
}> & {
	type: "PRIMITIVE_ELEMENT";
};

/**
 * Base type for element props that may include children.
 */
export type ReaktElementProps = { children: ReaktElement[] };

export type Fiber = {
	dom?: HTMLElement | Text;
	element: ReaktElement;
	parent?: Fiber;
	child?: Fiber;
	sibling?: Fiber;
};
