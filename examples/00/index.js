// const element = <h1 title="foo">Hello</h1>;
const element = {
	type: "h1",
	props: {
		title: "foo",
		children: ["Hello"],
	},
};

const container = document.getElementById("root");

// 1. Create h1 dom node
const h1Node = document.createElement(element.type);
h1Node.setAttribute("title", element.props.title);

// 2. Create text dom node for "Hello"
const textNode = document.createTextNode(element.props.children[0]);

// 3. Append text node to h1 node
h1Node.appendChild(textNode);

// 4. Append h1 node to root div
// ReactDOM.render(element, container);
container.appendChild(h1Node);
