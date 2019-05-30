import { css, SSRProvider } from "../src/css";
import { createBemed } from "../src/react-bemed";
import React from "react";
import { render, cleanup } from "react-testing-library";
import { _resetModuleState } from "../src/css-core";

const bemed = createBemed();

afterEach(() => {
    cleanup();
    _resetModuleState();
    jest.resetAllMocks();
    process.env.TEST_ENV = "node";
    process.env.NODE_ENV = "test";
});

beforeEach(() => {
    process.env.TEST_ENV = "node";
});

function getCSS(Component: any) {
    const rtl = render(
        <SSRProvider>
            <Component>test</Component>
        </SSRProvider>,
    );

    const styleTag = rtl.getByTestId("bemed-style");

    return styleTag.innerHTML;
}

test("can use custom selectors to target child elements", () => {
    const Block = bemed({
        css: css`
            :--Foo {
                color: red;
                border-radius: 10px;
            }
        `,
        elements: {
            Foo: bemed({
                css: css`
                    color: orange;
                `,
            }),
        },
    })("TestBlock");

    expect(getCSS(Block)).toEqual(
        ".TestBlock .TestBlock__Foo{color:red;border-radius:10px;}",
    );
});

test("can use multiple element selectors", () => {
    const Block = bemed({
        css: css`
            :--Foo {
                border-radius: 10px;
            }
            :--Bar {
                border-radius: 20px;
            }
        `,
        elements: {
            Foo: bemed({
                css: css`
                    color: orange;
                `,
            }),
            Bar: bemed({
                css: css`
                    color: red;
                `,
            }),
        },
    })("TestBlock");

    expect(getCSS(Block)).toEqual(
        ".TestBlock .TestBlock__Foo{border-radius:10px;}/*|*/.TestBlock .TestBlock__Bar{border-radius:20px;}",
    );
});

test("can use multiple element selectors for single block", () => {
    const Block = bemed({
        css: css`
            :--Foo,
            :--Bar {
                border-radius: 10px;
            }
        `,
        elements: {
            Foo: bemed({
                css: css`
                    color: orange;
                `,
            }),
            Bar: bemed({
                css: css`
                    color: red;
                `,
            }),
        },
    })("TestBlock");

    expect(getCSS(Block)).toEqual(
        ".TestBlock .TestBlock__Foo,.TestBlock .TestBlock__Bar{border-radius:10px;}",
    );
});

test("can use custom selectors with other selectors", () => {
    const Block = bemed({
        css: css`
            .other :--Foo {
                color: red;
            }
        `,
        elements: {
            Foo: bemed({
                css: css`
                    color: orange;
                `,
            }),
        },
    })("TestBlock");

    expect(getCSS(Block)).toEqual(
        ".TestBlock .other .TestBlock__Foo{color:red;}",
    );
});

test("can use custom selectors with custom nesting", () => {
    const Block = bemed({
        css: css`
            .custom-nesting {
                :--Foo {
                    color: red;
                }
            }
        `,
        elements: {
            Foo: bemed({
                css: css`
                    color: orange;
                `,
            }),
        },
    })("TestBlock");

    expect(getCSS(Block)).toEqual(
        ".TestBlock .custom-nesting .TestBlock__Foo{color:red;}",
    );
});

test("can use pseudo classes with custom selectors", () => {
    const Block = bemed({
        css: css`
            :--Foo:hover {
                color: red;
            }
        `,
        elements: {
            Foo: bemed({
                css: css`
                    color: orange;
                `,
            }),
        },
    })("TestBlock");

    expect(getCSS(Block)).toEqual(
        ".TestBlock .TestBlock__Foo:hover{color:red;}",
    );
});

test("can use media queries with custom selectors", () => {
    const Block = bemed({
        css: css`
            :--Foo {
                @media (max-width: 600px) {
                    color: red;
                }
            }
        `,
        elements: {
            Foo: bemed({
                css: css`
                    color: orange;
                `,
            }),
        },
    })("TestBlock");

    expect(getCSS(Block)).toEqual(
        "@media (max-width:600px){.TestBlock .TestBlock__Foo{color:red;}}",
    );
});
