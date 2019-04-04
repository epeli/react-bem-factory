import { bemed } from "./src/react-bemed";
import React from "react";

const createAppBlock = bemed("app");

// Create a "BEMed Block Component"
const Button = createAppBlock("Button", {
    el: "button",
    mods: {
        add: true,
        delete: true,
    },
    elements: {
        Icon: {
            el: "span",
            mods: {
                danger: true,
            },
        },
    },
});

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
