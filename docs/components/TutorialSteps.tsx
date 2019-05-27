import { FaReact } from "react-icons/fa";
import { css } from "react-bemed/css";
import { bemed } from "react-bemed";
import { createClassName } from "react-bemed/lib/css-core";
import { rem } from "polished";
import { Colors } from "./core";

const FOO = createClassName(
    "TutorialButton",
    css`
        width: ${rem(100)};
        flex-direction: row;
        justify-content: center;
        justify-items: center;
        align-items: center;
        svg {
            margin-right: ${rem(10)};
        }
    `,
);

function msg(msg: string) {
    return {
        onClick() {
            alert(msg);
        },
    };
}

const RESET_BUTTON = createClassName(
    "reset-button",
    css`
        border: none;
        padding: 0px;
        width: auto;
        color: inherit;
        font: inherit;
        line-height: normal;
    `,
);

export const Example = bemed({
    css: css`
        padding: ${rem(40)};
        margin-top: ${rem(15)};
        margin-bottom: ${rem(15)};
        border: 1px dashed gray;
        align-items: center;
    `,
})("ExampleContainer");

export const Step1 = bemed({
    className: FOO,
    css: css`
        color: white;
        background-color: hotpink;
        padding: 10px;
    `,
})("MyButton1");

export const Step2 = bemed({
    defaultProps: {
        ...msg("I'm a real button!"),
    },
    className: FOO,
    as: "button",
    css: css`
        display: inline;
        color: white;
        background-color: hotpink;
        padding: 10px;
    `,
})("MyButton2");

export const Step3 = bemed({
    defaultProps: {
        ...msg("Get it?"),
    },
    className: [FOO, RESET_BUTTON],
    as: "button",
    css: css`
        display: inline;
        color: white;
        background-color: hotpink;
        padding: 10px;
    `,
})("MyButton3");

export const Step4 = bemed({
    className: [FOO, RESET_BUTTON],
    as: "button",
    defaultProps: {
        ...msg("Dang!"),
        type: "button",
    },
    css: css`
        color: white;
        background-color: hotpink;
        padding: 10px;
    `,
    mods: {
        important: css`
            box-shadow: 0px 0px 20px 10px purple;
        `,
    },
})("MyButton4");

export const Step5 = bemed({
    className: [FOO, RESET_BUTTON],
    as: "button",
    defaultProps: {
        ...msg("What's out Vue!"),
        type: "button",
    },
    css: css`
        color: white;
        background-color: hotpink;
        padding: 10px;
    `,
    mods: {
        important: css`
            box-shadow: 0px 0px 20px 10px purple;
        `,
    },
    elements: {
        Icon: bemed({
            as: FaReact,
        }),
    },
})("MyButton5");

export const Step6 = bemed({
    className: [FOO, RESET_BUTTON],
    as: "button",
    defaultProps: {
        ...msg("Hmm, what is this Svelte stuff..."),
        type: "button",
    },
    css: css`
        color: white;
        background-color: hotpink;
        padding: 10px;
    `,
    mods: {
        important: css`
            box-shadow: 0px 0px 20px 10px purple;
        `,
    },
    elements: {
        Icon: bemed({
            as: FaReact,
            css: css`
                background-color: black;
                border-radius: 20px;
                padding: 1px;
                path {
                    fill: ${Colors.reactBlue};
                }
            `,
        }),
    },
})("MyButton6");
