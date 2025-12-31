// biome-ignore lint/correctness/noUnusedImports: Very much important so we can call Reakt.whatever (e.g. createElement) when this is bundled
import * as Reakt from "reakt";

const LargeTree = ({ depth, breadth }: { depth: number; breadth: number }) => {
	if (depth === 0) {
		return (
			<div className="leaf">Leaf {Math.random().toString(36)}</div>
		);
	}

	return (
		<div className={`node depth-${depth}`}>
			{Array.from({ length: breadth }, () =>
				LargeTree({ depth: depth - 1, breadth }),
			)}
		</div>
	);
};

export default LargeTree;
