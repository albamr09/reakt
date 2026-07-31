// This is necessary here so the transpiler can use it
import ReaKt from "reakt";

const Element = (
    <div id="foo">
        <a>bar</a>
        <b />
    </div>
)

// This logs out the result of calling ReaKt.createElement
console.log(Element)
