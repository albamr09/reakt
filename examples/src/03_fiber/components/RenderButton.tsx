// biome-ignore lint/correctness/noUnusedImports: Very much important so we can call Reakt.whatever (e.g. createElement) when this is bundled
import * as Reakt from "reakt";

const RenderButton = (
	<button type="button" onclick={() => console.log("button clicked!")}>
		Hello!
	</button>
);

export default RenderButton;
