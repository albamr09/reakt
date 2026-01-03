import type { Fiber, ReaktElement } from "@reakt/types";

/**
 * Reconciles child fibers by comparing the current element's children with the previous render's fibers.
 *
 * The reconciliation process attempts to match new elements with old fibers by type,
 * reusing DOM nodes when the type matches (UPDATE effect), creating new ones when
 * types differ or are new (PLACEMENT effect), and marking old fibers for removal
 * when they no longer exist in the new tree (DELETION effect).
 *
 * fiber (parent)
 *   child --> sibling --> sibling --> ... --> sibling
 *
 * @param fiber - The parent fiber whose children will be reconciled and converted into child fibers.
 * @returns The parent fiber with its `child` property set to the first child fiber, and all
 *          children linked via the `sibling` property. Each child fiber has an `effect` property
 *          indicating whether it should be updated, placed, or deleted.
 */
export const reconcileChildFibers = (fiber: Fiber) => {
	// Build a map of old fibers for easy lookup
	const oldFiberMap = createOldFibersMap(fiber);
	const matchedOldFibers = new Set<Fiber>();

	// Create children from current fiber tree
	const lastSibling = createAllChildrenFibers({
		parent: fiber,
		oldFiberMap,
		matchedOldFibers,
	});

	// Mark for deletion all old fibers not matched
	markUnmatchedFibersForDeletion({
		parent: fiber,
		matchedOldFibers,
		lastSibling,
	});

	return fiber;
};

/**
 * Creates a map of old fibers from the previous render, grouped by element type.
 *
 * @param fiber - The parent fiber whose alternate (previous render) children will be mapped.
 * @returns A Map where keys are element types (strings) and values are arrays of fibers
 *          with that type from the previous render.
 */
const createOldFibersMap = (fiber: Fiber) => {
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

/**
 * Creates child fibers from the current element's children and links them in a sibling chain.
 *
 * Iterates through the children array, matches each child with an old fiber of the same type
 * (if available), creates a new child fiber, and links them together as siblings.
 *
 * @param parent - The parent fiber whose children will be created.
 * @param oldFiberMap - A map of old fibers grouped by type for efficient matching.
 * @param matchedOldFibers - A set to track which old fibers have been matched to avoid duplicates.
 * @returns The last sibling fiber created, or undefined if no children were processed.
 */
const createAllChildrenFibers = ({
	parent,
	oldFiberMap,
	matchedOldFibers,
}: {
	parent: Fiber;
	oldFiberMap: Map<string, Fiber[]>;
	matchedOldFibers: Set<Fiber>;
}): Fiber | undefined => {
	let previousSibling: Fiber | undefined;
	const { children } = parent.element.props;

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
			parent,
			oldFiber,
		});

		// Chain children + siblings
		if (previousSibling === undefined) {
			parent.child = childFiber;
		} else {
			previousSibling.sibling = childFiber;
		}

		previousSibling = childFiber;
	});

	return previousSibling;
};

/**
 * Marks unmatched old fibers for deletion and links them to the fiber tree.
 *
 * Iterates through all old fibers from the previous render and marks those that weren't
 * matched with new elements for deletion.
 *
 * @param parentFiber - The parent fiber whose unmatched old children will be marked for deletion.
 * @param matchedOldFibers - A set of old fibers that were already matched with new elements.
 * @param previousSibling - The last sibling fiber from the new children, used to continue the chain.
 */
const markUnmatchedFibersForDeletion = ({
	parent,
	matchedOldFibers,
	lastSibling,
}: {
	parent: Fiber;
	matchedOldFibers: Set<Fiber>;
	lastSibling?: Fiber;
}) => {
	let currentOldFiber = parent?.alternate?.child;
	let previousSibling = lastSibling;

	while (currentOldFiber) {
		if (!matchedOldFibers.has(currentOldFiber)) {
			const deletionFiber = createChildFiber({
				parent,
				oldFiber: currentOldFiber,
			});

			// Chain children + siblings
			if (previousSibling === undefined) {
				parent.child = deletionFiber;
			} else {
				previousSibling.sibling = deletionFiber;
			}

			previousSibling = deletionFiber;
		}

		// Move to next sibling on linked list
		currentOldFiber = currentOldFiber.sibling;
	}
};

/**
 * Creates a child fiber from an element and/or old fiber, determining the appropriate effect.
 *
 * This function determines what operation needs to be performed on the fiber:
 * - **DELETION**: The element was removed (no new element, but old fiber exists)
 * - **UPDATE**: The element type matches the old fiber, so the DOM node can be reused
 * - **PLACEMENT**: A new element or the type changed, requiring a new DOM node
 *
 * @param element - The new element to create a fiber for (optional if deletion).
 * @param oldFiber - The old fiber from the previous render (optional if new element).
 * @param parent - The parent fiber that will contain this child fiber.
 * @returns A new fiber with the appropriate `effect` property set based on the reconciliation result.
 * @throws {Error} If neither element nor oldFiber is provided (invalid state).
 */
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
