import Reakt from "reakt";

const Element = () => {
	return (
		<div id="foo">
			<a href="https://github.com/albamr09">OMG!!</a>
			<b />
		</div>
	);
};

const App = () => {
	return <Element />;
};

const root = document.getElementById("root");
// biome-ignore lint/style/noNonNullAssertion: root element is always non-null
Reakt.render(root!, <App />);
