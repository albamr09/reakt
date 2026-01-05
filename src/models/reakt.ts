import { createElement } from "@reakt/lib/element";
import { FiberManager } from "@reakt/models/fiber";
import type { ReaktElement, ReaktElementProps } from "@reakt/types";

class ReaktManager {
	private fiberManager: FiberManager;

	constructor() {
		this.fiberManager = new FiberManager();
	}

	/**
	 * Renders a virtual DOM element to the actual DOM.
	 *
	 * @param container - The DOM container where the element should be rendered
	 * @param element - The virtual DOM element to render
	 */
	public render(container: HTMLElement, element: ReaktElement) {
		const rootFiber = this.fiberManager.createRootFiber({ container, element });
		this.fiberManager.startWorkLoop(rootFiber);
	}

	/**
	 * Creates a virtual DOM element with the specified type, props, and children.
	 *
	 * @template T - The type of the props object
	 * @param type - The element type (e.g., "div", "span", or a component)
	 * @param props - The properties/attributes to apply to the element
	 * @param children - Variable number of child elements (strings are automatically converted to text elements, arrays are flattened)
	 * @returns An element object with the specified type, props, and children
	 *
	 * @example
	 * ```ts
	 * createElement("div", { id: "container" }, "Hello", "World")
	 * createElement("span", { className: "text" }, createElement("strong", {}, "Bold"))
	 * createElement("div", {}, [elem1, elem2]) // Arrays are automatically flattened
	 * ```
	 */
	public createElement = <T extends ReaktElementProps>(
		...args: Parameters<typeof createElement<T>>
	): ReturnType<typeof createElement<T>> => {
		return createElement(...args);
	};
}

export default ReaktManager;
