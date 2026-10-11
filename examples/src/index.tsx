import Reakt from "reakt";

const Element = <p className="lead">Hi</p>;

// This logs out the result of calling Reakt.createElement
console.log(Element);

const root = document.getElementById("root");

// biome-ignore lint/style/noNonNullAssertion: root is always present
Reakt.render(Element, root!);
