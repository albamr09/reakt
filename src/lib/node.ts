import type {
	ExtendableHTMLElement,
	PrimitiveReaktElement,
	ReaktElement,
	ReaktElementProps,
} from "@reakt/types";
import { checkIfPropIsListener, mapPropKeyToListenerName } from "./element";

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
		if (checkIfPropIsListener(key, value)) {
			// TODO: does this create multiple listeners?
			const eventName = mapPropKeyToListenerName(key);
			node.addEventListener(eventName, value);
		} else {
			node[key] = value;
		}
	});
};

/**
 * Updates DOM node properties by adding new props, updating changed props, and removing old props.
 *
 * @template T - The type of the new props object
 * @template P - The type of the old props object
 * @param node - The DOM node to update
 * @param newProps - The new properties to apply
 * @param oldProps - The old properties to compare against (optional)
 * @returns The updated DOM node
 */
export const updateProps = <
	T extends ReaktElementProps,
	P extends ReaktElementProps,
>({
	node,
	newProps,
	oldProps,
}: {
	node: NonNullable<ExtendableHTMLElement>;
	newProps: T;
	oldProps: P;
}) => {
	// Filter out children prop
	const { children: _newChildren, ...newPropsFiltered } = newProps;
	const { children: _oldChildren, ...oldPropsFiltered } = oldProps;

	// TODO: make all this simpler
	//  - Now logic seems duplicated: we check three times if a prop is a listener
	//  - We go over props twice

	// Addition & update
	Object.entries(newPropsFiltered).forEach(([key, value]) => {
		// Addition
		if (!oldPropsFiltered?.[key] && value !== undefined && value != null) {
			// Handle event listeners
			if (checkIfPropIsListener(key, value)) {
				node.addEventListener(mapPropKeyToListenerName(key), value);
			} else {
				node[key] = value;
			}
			return;
		}

		if (!oldPropsFiltered) return;

		// TODO: this is shallow comparison :/
		if (oldPropsFiltered[key] !== value) {
			// Handle event listeners
			if (checkIfPropIsListener(key, value)) {
				const oldValue = oldPropsFiltered[key];
				if (checkIfPropIsListener(key, oldValue)) {
					node.removeEventListener(mapPropKeyToListenerName(key), oldValue);
				}
				node.addEventListener(mapPropKeyToListenerName(key), value);
			} else {
				node[key] = value;
			}
		}
	});

	if (!oldPropsFiltered) {
		return node;
	}

	// Deletion
	Object.entries(oldPropsFiltered).forEach(([key, value]) => {
		// If prop exists do nothing
		if (newProps?.[key]) return;

		// Handle event listeners
		if (checkIfPropIsListener(key, value)) {
			node.removeEventListener(mapPropKeyToListenerName(key), value);
		} else {
			delete node[key];
		}
	});

	return node;
};
