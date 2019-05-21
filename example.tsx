import { createBemed } from "./src/react-bemed";
import React from "react";
import { css } from "./src/css";

const bemed = createBemed("app");

// Create a "BEMed Block Component"
const Button = bemed({
    as: "button",
    css: css`
        color: red;
    `,
    mods: {
        add: true,
        delete: true,
    },
    elements: {
        Icon: bemed({
            as: "span",
            mods: {
                danger: true,
            },
        }),
    },
})("Button");

// Usage of BEMed Components is idiomatic React
// without BEM classes mutilating the readability
function App() {
    return (
        <div>
            <Button>Normal Button</Button>
            <Button add>
                <Button.Icon>+</Button.Icon> Add Button
            </Button>
            <Button delete>
                <Button.Icon danger>X</Button.Icon> Delete Button
            </Button>
        </div>
    );
}
