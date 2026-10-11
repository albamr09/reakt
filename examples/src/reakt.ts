interface ReaktElement {
  type: keyof HTMLElementTagNameMap;
  props: Omit<Record<string, string | ReaktElement[]>, "children"> & {
    children?: ReaktElement[];
  };
}

export const createElement = (
  type: keyof HTMLElementTagNameMap,
  props: Record<string, string>,
  ...children: ReaktElement[]
): ReaktElement => {
  return {
    type,
    props: {
      ...props,
      children,
    },
  };
};

const createNode = (element: ReaktElement | string): Element | Text => {
  // 1. If the element is a string, we simply create a text node
  if (typeof element === "string") {
    return document.createTextNode(element);
  } else {
    // 2. If the element is an object, we create a node of the given type
    const node = document.createElement(element.type);
    const { children, ...props } = element.props;

    Object.entries(props).forEach(([key, value]) => {
      node.setAttribute(key, value as string);
    });

    children?.forEach((child) => {
      const childNode = createNode(child);
      node.appendChild(childNode);
    });

    return node;
  }
};

export const render = (element: ReaktElement, container: HTMLElement) => {
  const node = createNode(element);
  container.appendChild(node);
};

const Reakt = {
  createElement,
  render,
};

export default Reakt;
