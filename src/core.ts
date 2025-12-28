import type { Element } from "./types";

export const createElement = <T>(
	type: Element<T>["type"],
	props: Element<T>["props"],
	// Children is always an array
	...children: Element[]
) => {
  return {
    type,
    props: {
      ...props,
      children
    }
  }
};
