import type { PrimitiveReaktElement, ReaktElement } from "@reakt/types";

/**
 * Type guard to check if a node is a text node.
 *
 * @param node - The node to check
 * @returns True if the node is a text node
 */
export const isTextHTMLNode = (node: HTMLElement | Text): node is Text => {
	return node instanceof Text;
};

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
	const domNode = document.createTextNode(nodeValue);
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

	const domNode = document.createElement(element.type);
	addProps({ node: domNode, props });
	return domNode;
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
	node: HTMLElement;
	props: T;
}) => {
	Object.entries(props).forEach(([key, value]) => {
		// TODO ALBA: fix this typing
		//@ts-expect-error
		node[key] = value;
	});
};
