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
	nodeValue: PrimitiveValueType;
	children: [];
}> & {
	type: "PRIMITIVE_ELEMENT";
};

/**
 * Base type for element props that may include children.
 * Props follow a dictionary pattern where keys are strings and values can be primitive or complex types.
 */
export type ReaktElementProps = {
	children: ReaktElement[];
	[key: string]: PrimitiveValueType | ComplexValueType;
};

/**
 * Primitive value types allowed in element props.
 */
type PrimitiveValueType = string | number | boolean | null | undefined;

/**
 * Complex value types allowed in element props (functions or objects).
 */
type ComplexValueType = SafeFunctionType | object;

/**
 * Type-safe function signature for event handlers and callbacks.
 */
type SafeFunctionType = (...args: never) => unknown;

/**
 * Represents a fiber in the Reakt fiber tree.
 *
 * A fiber is a unit of work in the Reakt fiber tree. It represents a virtual DOM element and its associated DOM node.
 *
 */
export type Fiber = FiberBase & (FiberHTMLElement | FiberText);

/**
 * Basic fiber properties.
 *
 * @property element - The virtual DOM element associated with the fiber.
 * @property dom - The HTML DOM node associated with the fiber.
 * @property parent - The parent fiber in the tree.
 * @property child - The first child fiber in the tree.
 * @property sibling - The next sibling fiber in the tree.
 * @property alternate - The fiber state when it was last commited.
 * @property effect - The type of operation that has to be applied over the node while commiting the fiber tree.
 */
type FiberBase = {
	element: ReaktElement;
	dom?: ExtendableHTMLElement | Text;
	parent?: Fiber;
	child?: Fiber;
	sibling?: Fiber;
	alternate?: Fiber;
	effect?: "UPDATE" | "PLACEMENT" | "DELETION";
};

/**
 * Represents a fiber associated with an HTML DOM Node.
 *
 * @property dom - The HTML DOM node associated with the fiber.
 */
export type FiberHTMLElement = {
	element: FiberBase["element"];
};

/**
 * HTML element extended with props dictionary support.
 */
export type ExtendableHTMLElement = HTMLElement &
	Omit<ReaktElementProps, "children">;

/**
 * Represents a fiber associated with a Text DOM Node.
 *
 * @property dom - The Text DOM Nodee node associated with the fiber.
 */
export type FiberText = {
	element: ReaktElement & {
		props: ReaktElement["props"] & { nodeValue: PrimitiveValueType };
	};
};
