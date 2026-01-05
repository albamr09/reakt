import Reakt from "reakt";
import LargeTree from "./components/LargeTree";
import RenderButton from "./components/RenderButton";
import Spinner from "./components/Spinner";

const App = () => {
	const FiberApp = (
		<div>
			<Spinner />
			<br />
			<RenderButton />
			<br />
			<LargeTree depth={10} breadth={2} />
		</div>
	);

	return FiberApp;
};

const root = document.getElementById("root");
// biome-ignore lint/style/noNonNullAssertion: root element is always non-null
Reakt.render(root!, <App />);
