import * as Reakt from "reakt";
import LargeTree from "./components/LargeTree";
import RenderButton from "./components/RenderButton";
import Spinner from "./components/Spinner";

const App = (
	<div>
		{Spinner}
		<br />
		{RenderButton}
		<br />
		{/* Generate a very large list of elements */}
		{LargeTree({ depth: 10, breadth: 2 })}
	</div>
);

const root = document.getElementById("root");

// biome-ignore lint/style/noNonNullAssertion: Root will always be present on index.html and thus non-null
Reakt.render(root!, App);
