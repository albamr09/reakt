import Reakt from "reakt";

const Element = (
	<div id="foo">
		<a href="https://github.com/albamr09">bar</a>
		<b />
	</div>
);

// This outputs the result from calling Reakt.createElement!!
console.log(Element);

const App = () => {
	return (
		<div>
			<p>Check the console to see the element structure!</p>
		</div>
	);
};

const root = document.getElementById("root");
// biome-ignore lint/style/noNonNullAssertion: root element is always non-null
Reakt.render(root!, <App />);
