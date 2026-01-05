// biome-ignore lint/correctness/noUnusedImports: Very much important so we can call Reakt.whatever (e.g. createElement) when this is bundled
import Reakt from "reakt";

const RenderButton = () => (
	<button type="button" onClick={() => console.log("button clicked!")}>
		Hello!
	</button>
);

export default RenderButton;
