import type { Element } from "@reakt/types";

const createTextElement = (text: string) => {
	return {
		type: "TEXT_ELEMENT",
		props: {
			nodeValue: text,
			children: [],
		},
	};
};

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
			children: children.map((child) =>
				typeof child === "object" ? child : createTextElement(child),
			),
		},
	};
};
