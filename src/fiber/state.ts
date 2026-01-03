import type { Fiber } from "@reakt/types";

// TODO: is there not a better way of doing this?
export let lastCommitedFiberTree: Fiber | undefined;
export let oldFibersToDelete: Fiber[] = [];

export const getLastCommitFiberTree = () => {
	return lastCommitedFiberTree;
};

export const updateLastCommitFiberTree = (fiber: Fiber) => {
	lastCommitedFiberTree = fiber;
};

export const getOldFibersToDelete = () => {
	return oldFibersToDelete;
};

export const addOldFibersToDelete = (fiber: Fiber[]) => {
	oldFibersToDelete.push(...fiber);
};

export const clearOldFibersToDelete = () => {
	oldFibersToDelete = [];
};
