import type { Fiber } from "@reakt/types";

// TODO: is there not a better way of doing this?
export let lastCommitedFiberTree: Fiber | undefined;

export const updateLastCommitFiberTree = (fiber: Fiber) => {
	lastCommitedFiberTree = fiber;
};
