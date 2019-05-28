import Stylis from "stylis";
import { replaceCompiler } from "../src/css-precompiled";

const stylis = new Stylis({
    prefix: false,
});

function css(strings: TemplateStringsArray) {
    return strings.join("");
}

test("can add selector", () => {
    const cssString = stylis(
        "__BEMED__",
        css`
            color: red;
        `,
    );

    expect(replaceCompiler(".foo", cssString)).toEqual(".foo{color:red;}");
});

test("can handle animations", () => {
    const cssString = stylis(
        "__BEMED__",
        css`
            @keyframes example {
                from {
                    background-color: red;
                }
                to {
                    background-color: yellow;
                }
            }
            animation-name: example;
        `,
    );

    expect(replaceCompiler(".foo", cssString)).toEqual(
        ".foo{animation-name:example-foo;}@keyframes example-foo{from{background-color:red;}to{background-color:yellow;}}",
    );
});
