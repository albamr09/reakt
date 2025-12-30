// biome-ignore lint/correctness/noUnusedImports: Very much important so we can call Reakt.whatever (e.g. createElement) when this is bundled
import * as Reakt from "reakt";

const Element = (
	<div id="foo">
		<a href="https://github.com/albamr09">bar</a>
		<b />
	</div>
);

const root = document.getElementById("root");
Reakt.render(root, Element);
