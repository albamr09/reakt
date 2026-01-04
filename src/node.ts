import type {
	ExtendableHTMLElement,
	PrimitiveReaktElement,
	ReaktElement,
} from "@reakt/types";

/**
 * Creates a text node from a primitive element.
 *
 * @param element - The primitive element to create a text node from
 * @returns The created text node
 */
export const createPrimitiveNode = ({
	element,
}: {
	element: PrimitiveReaktElement;
}) => {
	const { nodeValue } = element.props;
	const domNode = document.createTextNode(`${nodeValue}`);
	return domNode;
};

/**
 * Creates a DOM node from a virtual element.
 *
 * @param element - The virtual element to create a DOM node from
 * @returns The created DOM node
 */
export const createNode = ({ element }: { element: ReaktElement }) => {
	const { children: _children, ...props } = element.props;

	const domNode = createExtendableHTMLElement(element);
	addProps({ node: domNode, props });
	return domNode;
};

/**
 * Creates an extendable HTML element from a virtual element.
 *
 * @param element - The virtual element to create an HTML element from
 * @returns The created HTML element with extended type
 */
const createExtendableHTMLElement = (element: ReaktElement) => {
	return document.createElement(element.type) as ExtendableHTMLElement;
};

/**
 * Adds properties to a DOM node.
 *
 * @template T - The type of the props object (excluding children)
 * @param node - The DOM node to add properties to
 * @param props - The properties to add to the node
 */
const addProps = <T extends Omit<ReaktElement["props"], "children">>({
	node,
	props,
}: {
	node: NonNullable<ExtendableHTMLElement>;
	props: T;
}) => {
	Object.entries(props).forEach(([key, value]) => {
		node[key] = value;
	});
};
