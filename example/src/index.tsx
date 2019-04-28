import ReactDOM from "react-dom";
import React from "react";
import { bemed } from "../../src/react-bemed";
import { css } from "../../src/css";
// import { css } from "emotion";

const defineBlock = bemed("ex");

const Block = defineBlock("Hellolol", {
    css: css`
        color: green;
    `,
});

function App() {
    return <Block>hello</Block>;
}

ReactDOM.render(<App />, document.getElementById("app"));
