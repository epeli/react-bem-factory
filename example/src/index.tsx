import ReactDOM from "react-dom";
import React from "react";
import { createBemed } from "../../src/react-bemed";
import { css } from "../../src/css";

const bemed = createBemed("ex");

const Block = bemed({
    css: css`
        color: green;
    `,
})("Hellolol");

function App() {
    return <Block>hello</Block>;
}

ReactDOM.render(<App />, document.getElementById("app"));
