import { createRootFiber, startWorkLoop } from "@reakt/fiber";
import type { ReaktElement } from "@reakt/types";

/**
 * Renders a virtual DOM element to the actual DOM.
 *
 * @param container - The DOM container where the element should be rendered
 * @param element - The virtual DOM element to render
 */
export const render = (container: HTMLElement, element: ReaktElement): void => {
	const rootFiber = createRootFiber({ container, element });
	startWorkLoop(rootFiber);
};
