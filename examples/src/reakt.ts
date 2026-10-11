interface ReaktElement {
  type: string;
  props: Omit<Record<string, string | ReaktElement[]>, "children"> & {
    children?: ReaktElement[];
  };
}

export const createElement = (
  type: string,
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
  if (typeof element === "string") {
    return document.createTextNode(element);
  } else {
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
