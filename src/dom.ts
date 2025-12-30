import type { PrimitiveReaktElement, ReaktElement } from "@reakt/types";
import { PRIMITIVE_ELEMENT_TYPE } from "./constants";

/**
 * Type guard to check if an element is a primitive element.
 *
 * @param element - The element to check
 * @returns True if the element is a primitive element
 */
const isPrimitiveElement = (
	element: ReaktElement,
): element is PrimitiveReaktElement => {
	return element.type === PRIMITIVE_ELEMENT_TYPE;
};

/**
 * Renders a virtual DOM element to the actual DOM.
 *
 * @param container - The DOM container where the element should be rendered
 * @param element - The virtual DOM element to render
 */
export const render = (container: HTMLElement, element: ReaktElement): void => {
	if (isPrimitiveElement(element)) {
		const domNode = createPrimitiveNode({ element });
		container.appendChild(domNode);
		return;
	}

	const domNode = createNode({ element });
	container.appendChild(domNode);
};

/**
 * Creates a text node from a primitive element.
 *
 * @param element - The primitive element to create a text node from
 * @returns The created text node
 */
const createPrimitiveNode = ({
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
const createNode = ({ element }: { element: ReaktElement }) => {
	const { children, ...props } = element.props;

	const domNode = document.createElement(element.type);
	addProps({ node: domNode, props });
	children.forEach((child) => {
		render(domNode, child);
	});
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
