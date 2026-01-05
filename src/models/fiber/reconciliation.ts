import type { Fiber, ReaktElement } from "@reakt/types";

export class ReconciliationMap {
	private fiberMap: Map<string, Map<string, Fiber>>;

	constructor({ fiber }: { fiber: Fiber }) {
		this.fiberMap = new Map();
		this.create(fiber);
	}

	/**
	 * Creates a map of old fibers from the previous render, grouped by element type.
	 * @param fiber - The parent fiber whose alternate children will be mapped.
	 */
	private create = (fiber: Fiber) => {
		let currentOldFiber = fiber.alternate?.child;
		let index = 0;

		// Iterate over child + linked list of siblings creating an
		// entry per type of element
		while (currentOldFiber) {
			this.update({
				oldFiber: currentOldFiber,
				index,
			});
			// Move to next sibling on linked list
			currentOldFiber = currentOldFiber.sibling;
			index++;
		}
	};

	/**
	 * Updates the fiber map with an old fiber entry.
	 * @param oldFiber - The old fiber to add to the map.
	 * @param index - The index of the fiber.
	 */
	private update = ({
		oldFiber,
		index,
	}: {
		oldFiber: Fiber;
		index: number;
	}) => {
		const firstLevelIndex = this.getFirstLevelIndex(oldFiber.element);
		const secondLevelIndex = this.getSecondLevelIndex(oldFiber.element, index);

		// Initialize if it does not exist
		if (!this.fiberMap.has(firstLevelIndex)) {
			this.fiberMap.set(firstLevelIndex, new Map());
		}

		this.fiberMap.get(firstLevelIndex)?.set(secondLevelIndex, oldFiber);
	};

	/**
	 * Generates the first-level index key from element type.
	 * @param element - The element to get the type from.
	 * @returns The element type as a string.
	 */
	private getFirstLevelIndex = (element: ReaktElement) => {
		return element.type;
	};

	/**
	 * Generates the second-level index key from element key or index.
	 * @param element - The element to get the key from.
	 * @param index - Fallback index if no valid key exists.
	 * @returns The key as a string, or the index if no valid key.
	 */
	private getSecondLevelIndex = (element: ReaktElement, index: number) => {
		const key = element.props.key;

		return key && typeof key !== "object" && typeof key !== "function"
			? `${key}`
			: `${index}`;
	};

	/**
	 * Finds a fiber from the map that matches the given element and index.
	 * @param element - The element to search for.
	 * @param index - The index of the element.
	 * @returns The matching fiber, or undefined if not found.
	 */
	public findFromeElement = ({
		element,
		index,
	}: {
		element: ReaktElement;
		index: number;
	}) => {
		const firstLevelIndex = this.getFirstLevelIndex(element);
		const secondLevelIndex = this.getSecondLevelIndex(element, index);

		const fibersOfGivenType = this.fiberMap.get(firstLevelIndex);
		return fibersOfGivenType?.get(secondLevelIndex);
	};
}
