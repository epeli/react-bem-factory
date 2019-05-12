import ReactDOM from "react-dom";
import React from "react";
import { createBemed } from "../../src/react-bemed";
import { css } from "../../src/css";
// import { css } from "emotion";

const defineBlock = createBemed("ex");

const Block = defineBlock("Hellolol", {
    css: css`
        color: green;
    `,
});

function App() {
    return <Block>hello</Block>;
}

ReactDOM.render(<App />, document.getElementById("app"));
