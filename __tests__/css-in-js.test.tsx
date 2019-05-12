import { render, cleanup, fireEvent } from "react-testing-library";
import Stylis from "stylis";
import { createBemed } from "../src/react-bemed";
import React from "react";
import { css } from "../src/css";
import { css as precompiledCSS } from "../src/css-precompiled";
import { injectGlobal } from "../src/inject-css";
import { SSRProvider, _resetModuleState } from "../src/css-core";

jest.mock("../src/inject-css");

declare const process: any;

const mockInjectGlobal = injectGlobal as jest.Mock<typeof injectGlobal>;

const origCSSCompiler = css.compiler;
const origCSSPreCompiler = precompiledCSS.compiler;

afterEach(() => {
    cleanup();
    _resetModuleState();
    jest.resetAllMocks();
    process.env.TEST_ENV = "browser";
    process.env.NODE_ENV = "test";
    css.compiler = origCSSCompiler;
    precompiledCSS.compiler = origCSSPreCompiler;
});

test("injects style tag for blocks", () => {
    const block = createBemed();
    const Block = block("TestBlock", {
        css: css`
            color: orange;
        `,
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("orange");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain(".TestBlock");
});

test("can use variables in template literals", () => {
    const block = createBemed();
    const color = "orange";

    const Block = block("TestBlock", {
        css: css`
            color: ${color};
        `,
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("orange");
});

test("Autoprefixes during injection", () => {
    const block = createBemed();
    const Block = block("TestBlock", {
        css: css`
            @keyframes slide {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
        `,
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("@-webkit-");
});

test("injects style tag for elements", () => {
    const block = createBemed();

    const Block = block("TestBlock", {
        elements: {
            Foo: {
                css: css`
                    color: red;
                `,
            },
        },
    });

    render(<Block.Foo>test</Block.Foo>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock__Foo");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("red");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain(".TestBlock__Foo");
});

test("injects style tag for block mods", () => {
    const block = createBemed();

    const Block = block("TestBlock", {
        mods: {
            ding: css`
                color: orange;
            `,
        },
    });

    render(<Block ding>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock--ding");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("orange");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain(".TestBlock--ding");
});

test("also adds the BEM class for css block mods", () => {
    const block = createBemed("prefix");

    const Block = block("TestBlock", {
        mods: {
            ding: css`
                color: orange;
            `,
        },
    });

    const rtl = render(<Block ding>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-TestBlock prefix-TestBlock--ding");
});

test("also adds the BEM class for css element mods", () => {
    const block = createBemed("prefix");

    const Block = block("TestBlock", {
        elements: {
            Foo: {
                mods: {
                    ding: css`
                        color: orange;
                    `,
                },
            },
        },
    });

    const rtl = render(<Block.Foo ding>test</Block.Foo>);
    const el = rtl.getByText("test");

    expect(el.className).toBe(
        "prefix-TestBlock__Foo prefix-TestBlock__Foo--ding",
    );
});

test("injects style tag for element mods", () => {
    const block = createBemed();

    const Block = block("TestBlock", {
        elements: {
            Foo: {
                mods: {
                    ding: css`
                        color: orange;
                    `,
                },
            },
        },
    });

    render(<Block.Foo ding>test</Block.Foo>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock__Foo--ding");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("orange");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain(
        ".TestBlock__Foo--ding",
    );
});

test("server renders style tags for blocks", () => {
    process.env.TEST_ENV = "node";

    const block = createBemed();
    const Block = block("TestBlock", {
        css: css`
            color: orange;
        `,
    });

    const rtl = render(
        <SSRProvider>
            <Block>test</Block>
        </SSRProvider>,
    );

    const styleTags = rtl.getAllByTestId("bemed-style");

    expect(styleTags.length).toBe(1);
    expect(styleTags[0].innerHTML).toContain("orange");
    expect(styleTags[0].innerHTML).toContain(".TestBlock");
});

test("server renders style tags for elements", () => {
    process.env.TEST_ENV = "node";

    const block = createBemed();
    const Block = block("TestBlock", {
        elements: {
            Foo: {
                css: css`
                    color: orange;
                `,
            },
        },
    });

    const rtl = render(
        <SSRProvider>
            <Block.Foo>test</Block.Foo>
        </SSRProvider>,
    );

    const styleTags = rtl.getAllByTestId("bemed-style");

    expect(styleTags.length).toBe(1);
    expect(styleTags[0].innerHTML).toContain("orange");
    expect(styleTags[0].innerHTML).toContain(".TestBlock__Foo");
});

test("does not duplicate server-rendered styles", () => {
    process.env.TEST_ENV = "node";

    const block = createBemed();
    const Block = block("TestBlock", {
        css: css`
            color: orange;
        `,
    });

    const rtl = render(
        <SSRProvider>
            <Block>test</Block>
            <Block>test</Block>
        </SSRProvider>,
    );

    const styleTags = rtl.getAllByTestId("bemed-style");

    expect(styleTags.length).toBe(1);
});

test("does not duplicate server-rendered styles within loop", () => {
    process.env.TEST_ENV = "node";

    const block = createBemed();
    const Block = block("TestBlock", {
        css: css`
            color: orange;
        `,
    });

    const rtl = render(
        <SSRProvider>
            {[1, 2, 3].map(num => (
                <Block key={num}>test</Block>
            ))}
        </SSRProvider>,
    );

    const styleTags = rtl.getAllByTestId("bemed-style");

    expect(styleTags.length).toBe(1);
});

test("server renders block mods", () => {
    process.env.TEST_ENV = "node";

    const block = createBemed();

    const Block = block("TestBlock", {
        css: css`
            color: blue;
        `,
        mods: {
            ding: css`
                color: orange;
            `,
        },
    });

    const rtl = render(
        <SSRProvider>
            <Block ding>test</Block>
        </SSRProvider>,
    );

    const styleTags = rtl.getAllByTestId("bemed-style");

    expect(styleTags.length).toBe(1);
    expect(styleTags[0].innerHTML).toContain("orange");
    expect(styleTags[0].innerHTML).toContain(".TestBlock--ding");
});

test("server renders element mods", () => {
    process.env.TEST_ENV = "node";

    const block = createBemed();

    const Block = block("TestBlock", {
        elements: {
            Foo: {
                css: css`
                    color: blue;
                `,
                mods: {
                    ding: css`
                        color: orange;
                    `,
                },
            },
        },
    });

    const rtl = render(
        <SSRProvider>
            <Block.Foo ding>test</Block.Foo>
        </SSRProvider>,
    );

    const styleTags = rtl.getAllByTestId("bemed-style");

    expect(styleTags.length).toBe(1);
    expect(styleTags[0].innerHTML).toContain("orange");
    expect(styleTags[0].innerHTML).toContain(".TestBlock__Foo--ding");
});

test("incrementally renders used css", () => {
    process.env.TEST_ENV = "node";

    const block = createBemed();

    const Block = block("TestBlock", {
        css: css`
            color: blue;
        `,
        mods: {
            ding: css`
                color: orange;
            `,
        },
    });

    const rtl = render(
        <SSRProvider>
            <div data-testid="container">
                <Block>normal</Block>
                <Block>normal dup</Block>
                <Block ding>ding</Block>
                <Block ding>ding dup</Block>
            </div>
        </SSRProvider>,
    );

    const container = rtl.getByTestId("container");

    expect(container).toMatchSnapshot();
});

test("Autoprefixes during injection", () => {
    const block = createBemed();
    const Block = block("TestBlock", {
        css: css`
            flex: 1;
        `,
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("-webkit-");
});

test("server renders autoprefixed", () => {
    process.env.TEST_ENV = "node";

    const block = createBemed();
    const Block = block("TestBlock", {
        css: css`
            flex: 1;
        `,
    });

    const rtl = render(
        <SSRProvider>
            <Block>test</Block>
        </SSRProvider>,
    );

    const styleTags = rtl.getAllByTestId("bemed-style");

    expect(styleTags.length).toBe(1);
    expect(styleTags[0].innerHTML).toContain("-webkit-");
});

test("can use custom stylis", () => {
    const block = createBemed("");

    css.compiler = new Stylis({
        prefix: false,
    });

    const Block = block("TestBlock", {
        css: css`
            flex: 1;
        `,
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][1]).not.toContain("-webkit-");
});

test("can use custom css compiler for injection", () => {
    const block = createBemed("");

    css.compiler = () => "custom";

    const Block = block("TestBlock", {
        css: css`
            flex: 1;
        `,
        mods: {
            blockMod: css`
                flex: 1;
            `,
        },
        elements: {
            Foo: {
                css: css`
                    flex: 1;
                `,
                mods: {
                    elementMod: css`
                        flex: 1;
                    `,
                },
            },
        },
    });

    render(
        <div>
            <Block>test</Block>
            <Block blockMod>test</Block>
            <Block.Foo>test</Block.Foo>
            <Block.Foo elementMod>test</Block.Foo>
        </div>,
    );

    expect(injectGlobal).toBeCalledTimes(4);
    expect(mockInjectGlobal.mock.calls[0][1]).toBe("custom");
    expect(mockInjectGlobal.mock.calls[1][1]).toBe("custom");
    expect(mockInjectGlobal.mock.calls[2][1]).toBe("custom");
    expect(mockInjectGlobal.mock.calls[3][1]).toBe("custom");
});

test("can use custom css compiler in server render", () => {
    process.env.TEST_ENV = "node";
    const block = createBemed("");

    css.compiler = () => "custom";

    const Block = block("TestBlock", {
        css: css`
            flex: 1;
        `,
        mods: {
            blockMod: css`
                flex: 1;
            `,
        },
        elements: {
            Foo: {
                css: css`
                    flex: 1;
                `,
                mods: {
                    elementMod: css`
                        flex: 1;
                    `,
                },
            },
        },
    });

    const rtl = render(
        <SSRProvider>
            <Block>test</Block>
            <Block blockMod>test</Block>
            <Block.Foo>test</Block.Foo>
            <Block.Foo elementMod>test</Block.Foo>
        </SSRProvider>,
    );

    const styleTags = rtl.getAllByTestId("bemed-style");

    expect(styleTags.length).toBe(4);
    expect(styleTags.map(tag => tag.innerHTML)).toEqual([
        "custom",
        "custom",
        "custom",
        "custom",
    ]);
});

test("css can work as normal function call", () => {
    const block = createBemed();
    const Block = block("TestBlock", {
        css: css("color: orange;", ""),
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock");
    expect(mockInjectGlobal.mock.calls[0][1]).toEqual(
        ".TestBlock{color:orange;}",
    );
});

test("css can work as normal function call with precompiled css", () => {
    const block = createBemed();
    const Block = block("TestBlock", {
        css: precompiledCSS("__BEMED__{color: orange;}", ""),
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock");
    expect(mockInjectGlobal.mock.calls[0][1]).toEqual(
        ".TestBlock{color: orange;}",
    );
});
