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

	let domNode = createExtendableHTMLElement(element);
	domNode = addProps({ node: domNode, props });
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
 * @param node - The DOM node to add properties to
 * @param props - The properties to add to the node
 */
const addProps = ({
	node,
	props,
}: {
	node: NonNullable<ExtendableHTMLElement>;
	props: Omit<ReaktElement["props"], "children">;
}) => {
	Object.entries(props).forEach(([key, value]) => {
		setProp(node, key, value);
	});
	return node;
};

/**
 * Updates DOM node properties by adding new props, updating changed props, and removing old props.
 *
 * @param node - The DOM node to update
 * @param newProps - The new properties to apply
 * @param oldProps - The old properties to compare against
 * @returns The updated DOM node
 */
export const updateProps = ({
	node,
	newProps,
	oldProps,
}: {
	node: NonNullable<ExtendableHTMLElement>;
	newProps: Omit<ReaktElementProps, "children">;
	oldProps: Omit<ReaktElementProps, "children">;
}) => {
	// Filter out children prop
	const { children: _newChildren, ...newPropsFiltered } = newProps;
	const { children: _oldChildren, ...oldPropsFiltered } = oldProps;

	// Collect all unique keys from both old and new props
	const allKeys = new Set([
		...Object.keys(newPropsFiltered),
		...(oldPropsFiltered ? Object.keys(oldPropsFiltered) : []),
	]);

	// Single pass: process all keys once
	allKeys.forEach((key) => {
		const newValue = newPropsFiltered[key];
		const oldValue = oldPropsFiltered[key];

		// Remove
		if (newValue === undefined && oldValue !== undefined) {
			removeProp(node, key, oldValue);
			return;
		}

		// Add
		if (oldValue === undefined && newValue !== undefined && newValue != null) {
			setProp(node, key, newValue);
			return;
		}

		// Prop is being updated (only if value actually changed)
		// TODO: this is shallow check
		if (newValue !== undefined && newValue != null && oldValue !== newValue) {
			// If old value was a listener, remove it first
			if (oldValue !== undefined && checkIfPropIsListener(key, oldValue)) {
				removeProp(node, key, oldValue);
			}
			setProp(node, key, newValue);
		}
	});

	return node;
};

/**
 * Sets a property on a DOM node, handling both event listeners and regular properties.
 *
 * @param node - The DOM node to set the property on
 * @param key - The property key
 * @param value - The property value to set
 */
const setProp = (
	node: ExtendableHTMLElement,
	key: string,
	value: Omit<ReaktElementProps, "children">[string],
) => {
	if (checkIfPropIsListener(key, value)) {
		node.addEventListener(mapPropKeyToListenerName(key), value);
	} else {
		node[key] = value;
	}
};

/**
 * Removes a property from a DOM node, handling both event listeners and regular properties.
 *
 * @param node - The DOM node to remove the property from
 * @param key - The property key
 * @param value - The property value to remove (needed for event listeners to identify which listener to remove)
 */
const removeProp = (
	node: ExtendableHTMLElement,
	key: string,
	value: Omit<ReaktElementProps, "children">[string],
) => {
	if (checkIfPropIsListener(key, value)) {
		node.removeEventListener(mapPropKeyToListenerName(key), value);
	} else {
		delete node[key];
	}
};
