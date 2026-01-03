import type { Fiber, ReaktElement } from "@reakt/types";

/**
 * Creates child fibers from the element's children and links them in a sibling chain.
 *
 *  Iterates through the element's children, creating a fiber for each child and linking
 *  the siblings together as a linked list.
 *
 *  fiber (parent)
 *    child --> sibling --> sibling --> ... --> sibling
 *
 * @param fiber - The parent fiber whose children will be converted into child fibers.
 * @returns The parent fiber with its `child` property set to the first child fiber, and all
 *          children linked via the `sibling` property.
 */

// TODO: update JSdoc
export const reconcileChildFibers = (fiber: Fiber) => {
	const { children } = fiber.element.props;
	let previousSibling: Fiber | undefined;

	// Build a map of old fibers for easy lookup
	const oldFiberMap = createOldFibersMap(fiber);
	const matchedOldFibers = new Set<Fiber>();

	// TODO: move to function
	// Create children from current fiber tree
	children.forEach((child) => {
		// Find old fiber not yet matched
		const oldFibersCandidates = oldFiberMap.get(child.type) || [];
		const oldFiber = oldFibersCandidates.find(
			(candidate) => !matchedOldFibers.has(candidate),
		);

		// Update set of matches
		if (oldFiber) {
			matchedOldFibers.add(oldFiber);
		}

		// Create child
		const childFiber = createChildFiber({
			element: child,
			parent: fiber,
			oldFiber,
		});

		// Chain children + siblings
		if (previousSibling === undefined) {
			fiber.child = childFiber;
		} else {
			previousSibling.sibling = childFiber;
		}

		previousSibling = childFiber;
	});

	// TODO: move to function
	// Mark for deletion all old fibers not matched
	let currentOldFiber = fiber?.alternate?.child;
	while (currentOldFiber) {
		if (!matchedOldFibers.has(currentOldFiber)) {
			const deletionFiber = createChildFiber({
				parent: fiber,
				oldFiber: currentOldFiber,
			});

			// Chain children + siblings
			if (previousSibling === undefined) {
				fiber.child = deletionFiber;
			} else {
				previousSibling.sibling = deletionFiber;
			}

			previousSibling = deletionFiber;
		}

		// Move to next sibling on linked list
		currentOldFiber = currentOldFiber.sibling;
	}

	return fiber;
};

// TODO: Add JSDoc
const createOldFibersMap = (fiber: Fiber) => {
	// Map that stores one entry per type.
	// The values will be the array of elements of that same type
	const oldFiberMap = new Map<string, Fiber[]>();
	let currentOldFiber = fiber.alternate?.child;

	// Iterate over child + linked list of siblings creating an
	// entry per type of element
	while (currentOldFiber) {
		const type = currentOldFiber.element.type;

		// Initialize list if needed
		if (!oldFiberMap.has(type)) {
			oldFiberMap.set(type, []);
		}

		// Update entry with fiber
		oldFiberMap.get(type)?.push(currentOldFiber);

		// Move to next sibling on linked list
		currentOldFiber = currentOldFiber.sibling;
	}
	return oldFiberMap;
};

// TODO: Add jsdoc
const createChildFiber = ({
	element,
	oldFiber,
	parent,
}: {
	element?: ReaktElement;
	oldFiber?: Fiber;
	parent: Fiber;
}): Fiber => {
	const hasNewElement = element !== undefined;
	const hasOldFiber = oldFiber !== undefined;
	const typesMatch =
		hasNewElement && hasOldFiber && element.type === oldFiber.element.type;

	// DELETION: Element was removed
	if (!hasNewElement) {
		if (!hasOldFiber) {
			throw new Error("Invalid fiber creation: no element and no oldFiber");
		}
		return {
			element: oldFiber.element,
			parent,
			dom: oldFiber.dom,
			alternate: oldFiber,
			effect: "DELETION",
		};
	}

	// UPDATE: Same element type, reuse DOM and update props
	if (typesMatch) {
		return {
			element,
			parent,
			dom: oldFiber.dom,
			alternate: oldFiber,
			effect: "UPDATE",
		};
	}

	// PLACEMENT: New element or type changed
	return {
		element,
		parent,
		alternate: oldFiber,
		effect: "PLACEMENT",
	};
};
