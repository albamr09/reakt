const setup = () => {
  // Create an h1 element using only the DOMs API
  const element = {
    type: "h1",
    props: {
      title: "foo",
      children: "Hello",
    },
  };
  const root = document.getElementById("root");

  // We follow the same pattern
  // 1. Create the h1 element
  const h1Node = document.createElement(element.type);

  // 2. Add the props to the node
  h1Node["title"] = element.props.title;

  // 3. Add the children to the node, in this case a simple text element
  const textNode = document.createTextNode("");
  textNode["nodeValue"] = element.props.children;

  // 4. Update the DOM by adding each element to the DOM
  h1Node.appendChild(textNode);
  root?.appendChild(h1Node);
};
window.onload = setup;
