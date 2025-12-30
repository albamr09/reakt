import type { ReaktElement } from "@reakt/types";
import { PRIMITIVE_ELEMENT_TYPE } from "./constants";

/**
 * Renders a virtual DOM element to the actual DOM.
 *
 * @param element - The virtual DOM element to render
 * @param container - The DOM container where the element should be rendered
 */
export const render = (container: HTMLElement, element: ReaktElement): void => {
	if (element.type === PRIMITIVE_ELEMENT_TYPE) {
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
export const createPrimitiveNode = ({ element }: { element: ReaktElement }) => {
	const { children } = element.props;
	const domNode = document.createTextNode(`${children}`);
	return domNode;
};

/**
 * Creates a DOM node from a virtual element.
 *
 * @param element - The virtual element to create a DOM node from
 * @returns The created DOM node
 */
export const createNode = ({ element }: { element: ReaktElement }) => {
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
export const addProps = <T extends Omit<ReaktElement["props"], "children">>({
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
