import type { Fiber, ReaktElement } from "@reakt/types";
import { addOldFibersToDelete } from "./state";

/**
 * Reconciles child fibers by comparing the current element's children with the previous render's fibers.
 *
 * The reconciliation process attempts to match new elements with old fibers by type,
 * reusing DOM nodes when the type matches (UPDATE effect), creating new ones when
 * types differ or are new (PLACEMENT effect), and saving old fibers for removal
 * when they no longer exist in the new tree (DELETION effect).
 *
 * fiber (parent)
 *   child --> sibling --> sibling --> ... --> sibling
 *
 * @param fiber - The parent fiber whose children will be reconciled and converted into child fibers.
 * @returns The parent fiber with its `child` property set to the first child fiber, and all
 *          children linked via the `sibling` property. Each child fiber has an `effect` property
 *          indicating whether it should be updated or placed.
 */
export const reconcileChildFibers = (fiber: Fiber) => {
	// Build a map of old fibers for easy lookup
	const oldFiberMap = createOldFibersMap(fiber);
	const matchedOldFibers = new Set<Fiber>();

	// Create children from current fiber tree
	createChildrenFibers({
		parent: fiber,
		oldFiberMap,
		matchedOldFibers,
	});

	// Mark for deletion all old fibers not matched
	const fibersToDelete = createOldFibersToDelete({
		parent: fiber,
		matchedOldFibers,
	});

	addOldFibersToDelete(fibersToDelete);

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
 */
const createChildrenFibers = ({
	parent,
	oldFiberMap,
	matchedOldFibers,
}: {
	parent: Fiber;
	oldFiberMap: Map<string, Fiber[]>;
	matchedOldFibers: Set<Fiber>;
}) => {
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
};

/**
 * Creates a child fiber from an element and/or old fiber, determining the appropriate effect.
 *
 * This function determines what operation needs to be performed on the fiber:
 * - **UPDATE**: The element type matches the old fiber, so the DOM node can be reused
 * - **PLACEMENT**: A new element or the type changed, requiring a new DOM node
 *
 * @param element - The new element to create a fiber for
 * @param oldFiber - The old fiber from the previous render (optional if new element).
 * @param parent - The parent fiber that will contain this child fiber.
 * @returns A new fiber with the appropriate `effect` property set based on the reconciliation result.
 */
const createChildFiber = ({
	element,
	oldFiber,
	parent,
}: {
	element: ReaktElement;
	oldFiber?: Fiber;
	parent: Fiber;
}): Fiber => {
	const hasNewElement = element !== undefined;
	const hasOldFiber = oldFiber !== undefined;
	const typesMatch =
		hasNewElement && hasOldFiber && element.type === oldFiber.element.type;

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

/**
 * Finds old fibers that did not match with any fiber on the current tree. This will be stored for deletion.
 *
 * @param parent - The parent fiber whose unmatched old children will be marked for deletion.
 * @param matchedOldFibers - A set of old fibers that were already matched with new elements.
 */
const createOldFibersToDelete = ({
	parent,
	matchedOldFibers,
}: {
	parent: Fiber;
	matchedOldFibers: Set<Fiber>;
}) => {
	let currentOldFiber = parent?.alternate?.child;
	const fibersToDelete: Array<Fiber> = [];

	while (currentOldFiber) {
		if (!matchedOldFibers.has(currentOldFiber)) {
			// Create deletion fiber
			const deletionFiber: Fiber = {
				element: currentOldFiber.element,
				parent,
				dom: currentOldFiber.dom,
				effect: "DELETION",
			};
			fibersToDelete.push(deletionFiber);
		}

		// Move to next sibling on linked list
		currentOldFiber = currentOldFiber.sibling;
	}

	return fibersToDelete;
};
