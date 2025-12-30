/**
 * Base type for element props that may include children.
 */
export type ElementProps = { children?: ReaktElement[] };

/**
 * Represents a virtual DOM element in the Reakt library.
 *
 * @template T - The type of the props object
 */
export interface Element<T extends ElementProps = ElementProps> {
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
 * Represents an element created by createElement, where children is always present.
 * This is the return type of createElement and the expected input type for render.
 *
 * @template T - The type of the props object (excluding children)
 */
export type ReaktElement<T extends ElementProps = ElementProps> = Element<
	T & { children: ReaktElement[] }
>;
