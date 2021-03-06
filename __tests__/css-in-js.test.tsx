import { render, cleanup, fireEvent } from "react-testing-library";
import ReactDOMServer from "react-dom/server";
import Stylis from "stylis";
import { createBemed } from "../src/react-bemed";
import React from "react";
import { css } from "../src/css";
import { css as precompiledCSS } from "../src/css-precompiled";
import { injectGlobal } from "../src/inject-css";
import {
    SSRProvider,
    _resetModuleState,
    createCSSTag,
    createClassName,
} from "../src/css-core";

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
    const bemed = createBemed();
    const Block = bemed({
        name: "TestBlock",
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

test("separates rules with /*|*/", () => {
    const bemed = createBemed();
    const Block = bemed({
        name: "TestBlock",
        css: css`
            color: orange;
            .foo {
                color: red;
            }
        `,
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock");
    expect(mockInjectGlobal.mock.calls[0][1]).toEqual(
        ".TestBlock{color:orange;}/*|*/.TestBlock .foo{color:red;}",
    );
});

test("separates rules with /*|*/ 2", () => {
    const bemed = createBemed();
    const Block = bemed({
        name: "TestBlock",
        css: css`
            color: orange;
            .foo {
                color: red;
            }
        `,
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock");
    expect(mockInjectGlobal.mock.calls[0][1]).toEqual(
        ".TestBlock{color:orange;}/*|*/.TestBlock .foo{color:red;}",
    );
});

test("can use variables in template literals", () => {
    const bemed = createBemed();
    const color = "orange";

    const Block = bemed({
        name: "TestBlock",
        css: css`
            color: ${color};
        `,
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("orange");
});

test("Autoprefixes during injection", () => {
    const bemed = createBemed();

    const css = createCSSTag(
        new Stylis({
            prefix: true,
        }),
    );

    const Block = bemed({
        name: "TestBlock",
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
    const bemed = createBemed();

    const Block = bemed({
        name: "TestBlock",
        elements: {
            Foo: bemed({
                css: css`
                    color: red;
                `,
            }),
        },
    });

    render(<Block.Foo>test</Block.Foo>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock__Foo");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("red");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain(".TestBlock__Foo");
});

test("injects style tag for block mods", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "TestBlock",
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

test("injects style tag for block submods", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "TestBlock",
        mods: {
            sub: {
                ding: css`
                    color: orange;
                `,
            },
        },
    });

    render(<Block sub="ding">test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock--sub--ding");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("orange");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain(
        ".TestBlock--sub--ding",
    );
});

test("also adds the BEM class for css block mods", () => {
    const bemed = createBemed({ prefix: "prefix-" });

    const Block = bemed({
        name: "TestBlock",
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
    const bemed = createBemed({ prefix: "prefix-" });

    const Block = bemed({
        name: "TestBlock",
        elements: {
            Foo: bemed({
                mods: {
                    ding: css`
                        color: orange;
                    `,
                },
            }),
        },
    });

    const rtl = render(<Block.Foo ding>test</Block.Foo>);
    const el = rtl.getByText("test");

    expect(el.className).toBe(
        "prefix-TestBlock__Foo prefix-TestBlock__Foo--ding",
    );
});

test("injects style tag for element mods", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "TestBlock",
        elements: {
            Foo: bemed({
                mods: {
                    ding: css`
                        color: orange;
                    `,
                },
            }),
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

    const bemed = createBemed();
    const Block = bemed({
        name: "TestBlock",
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

    const bemed = createBemed();
    const Block = bemed({
        name: "TestBlock",
        elements: {
            Foo: bemed({
                css: css`
                    color: orange;
                `,
            }),
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

    const bemed = createBemed();
    const Block = bemed({
        name: "TestBlock",
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

    const bemed = createBemed();
    const Block = bemed({
        name: "TestBlock",
        css: css`
            color: orange;
        `,
    });

    const rtl = render(
        <SSRProvider>
            {[1, 2, 3].map((num) => (
                <Block key={num}>test</Block>
            ))}
        </SSRProvider>,
    );

    const styleTags = rtl.getAllByTestId("bemed-style");

    expect(styleTags.length).toBe(1);
});

test("server renders block mods", () => {
    process.env.TEST_ENV = "node";

    const bemed = createBemed();

    const Block = bemed({
        name: "TestBlock",
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

test("server renders block submods", () => {
    process.env.TEST_ENV = "node";

    const bemed = createBemed();

    const Block = bemed({
        name: "TestBlock",
        css: css`
            color: blue;
        `,
        mods: {
            things: {
                ding: css`
                    color: orange;
                `,
            },
        },
    });

    const rtl = render(
        <SSRProvider>
            <Block things="ding">test</Block>
        </SSRProvider>,
    );

    const styleTags = rtl.getAllByTestId("bemed-style");

    expect(styleTags.length).toBe(1);
    expect(styleTags[0].innerHTML).toContain("orange");
    expect(styleTags[0].innerHTML).toContain(".TestBlock--things--ding");
});

test("server renders element mods", () => {
    process.env.TEST_ENV = "node";

    const bemed = createBemed();

    const Block = bemed({
        name: "TestBlock",
        elements: {
            Foo: bemed({
                css: css`
                    color: blue;
                `,
                mods: {
                    ding: css`
                        color: orange;
                    `,
                },
            }),
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

    const bemed = createBemed();

    const FOO = createClassName(
        "foo",
        css`
            color: pink;
        `,
    );

    const Block = bemed({
        name: "TestBlock",
        className: FOO,
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
    const css = createCSSTag(
        new Stylis({
            prefix: true,
        }),
    );

    const bemed = createBemed();
    const Block = bemed({
        name: "TestBlock",
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
    const css = createCSSTag(
        new Stylis({
            prefix: true,
        }),
    );

    const bemed = createBemed();
    const Block = bemed({
        name: "TestBlock",
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
    const bemed = createBemed();

    css.compiler = new Stylis({
        prefix: false,
    });

    const Block = bemed({
        name: "TestBlock",
        css: css`
            flex: 1;
        `,
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][1]).not.toContain("-webkit-");
});

test("can use custom css compiler for injection", () => {
    const bemed = createBemed();

    css.compiler = () => "custom";

    const Block = bemed({
        name: "TestBlock",
        css: css`
            flex: 1;
        `,
        mods: {
            blockMod: css`
                flex: 1;
            `,
        },
        elements: {
            Foo: bemed({
                css: css`
                    flex: 1;
                `,
                mods: {
                    elementMod: css`
                        flex: 1;
                    `,
                },
            }),
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
    const bemed = createBemed();

    css.compiler = () => "custom";

    const Block = bemed({
        name: "TestBlock",
        css: css`
            flex: 1;
        `,
        mods: {
            blockMod: css`
                flex: 1;
            `,
        },
        elements: {
            Foo: bemed({
                css: css`
                    flex: 1;
                `,
                mods: {
                    elementMod: css`
                        flex: 1;
                    `,
                },
            }),
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
    expect(styleTags.map((tag) => tag.innerHTML)).toEqual([
        "custom",
        "custom",
        "custom",
        "custom",
    ]);
});

test("css can work as normal function call", () => {
    const bemed = createBemed();
    const Block = bemed({
        name: "TestBlock",
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
    const bemed = createBemed();
    const Block = bemed({
        name: "TestBlock",
        css: precompiledCSS("__BEMED__{color: orange;}", ""),
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock");
    expect(mockInjectGlobal.mock.calls[0][1]).toEqual(
        ".TestBlock{color: orange;}",
    );
});

test("server render renders own props when no mods are defined", () => {
    process.env.TEST_ENV = "node";

    const bemed = createBemed();
    const Block = bemed({ name: "TestBlock" });

    const html = ReactDOMServer.renderToString(
        <SSRProvider>
            <Block title="hello" />
        </SSRProvider>,
    );

    expect(html).toEqual('<div title="hello" class="TestBlock"></div>');
});

test("server render does not escape quotes", () => {
    process.env.TEST_ENV = "node";

    const bemed = createBemed();
    const Block = bemed({
        name: "TestBlock",
        css: css`
            background-image: url("static/showell_logo_white.svg");
        `,
    });

    const html = ReactDOMServer.renderToString(
        <SSRProvider>
            <Block>test</Block>
        </SSRProvider>,
    );

    expect(html).toEqual(
        '<style data-testid="bemed-style">.TestBlock{background-image:url("static/showell_logo_white.svg");}</style><div class="TestBlock">test</div>',
    );
});

test("can inject class names from createClassName()", () => {
    const bemed = createBemed();

    const FOO = createClassName(
        "foo",
        css`
            color: orange;
        `,
    );

    const Block = bemed({
        name: "TestBlock",
        className: FOO,
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("foo");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("orange");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain(".foo");
});

test("class names from createClassName() are injected before css and css mods", () => {
    const bemed = createBemed();

    const FOO = createClassName(
        "foo",
        css`
            color: orange;
        `,
    );

    const Block = bemed({
        name: "TestBlock",
        className: FOO,
        css: css`
            color: red;
        `,
        mods: {
            mod: css`
                color: darkred;
            `,
        },
    });

    render(<Block mod>test</Block>);

    expect(injectGlobal).toBeCalledTimes(3);

    // The createClassNameInjection();
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("foo");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("orange");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain(".foo");

    // The main block styles
    expect(mockInjectGlobal.mock.calls[1][0]).toEqual("TestBlock");
    // Mod styles
    expect(mockInjectGlobal.mock.calls[2][0]).toEqual("TestBlock--mod");
});

test("css can apply selector manually", () => {
    const cssString = css`
        color: orange;
    `.asCSS(".foo");

    expect(cssString).toEqual(".foo{color:orange;}");
});

test("css can apply selector manually in the precompiled form", () => {
    const cssString = (css as any)("color: orange;", "").asCSS(".foo");

    expect(cssString).toEqual(".foo{color:orange;}");
});

test("precompiled css can be applied too", () => {
    const cssString = precompiledCSS("__BEMED__{color: orange;}", "").asCSS(
        ".foo",
    );
    expect(cssString).toEqual(".foo{color: orange;}");
});

test("css can apply selector manually and get style tag", () => {
    const Tag = css`
        color: orange;
    `.asStyleTag(".foo");

    const rtl = render(<Tag data-testid="style" />);
    const el = rtl.getByTestId("style");
    expect(el.innerHTML).toEqual(".foo{color:orange;}");
});

test("can extend other bemed components", () => {
    const bemed = createBemed();

    const Base1 = bemed({
        name: "Base1",
        css: css`
            color: red;
        `,
    });

    const Base2 = bemed({
        name: "Base2",
        as: Base1,
        css: css`
            color: green;
        `,
    });

    const Block = bemed({
        name: "TestBlock",
        as: Base2,
        css: css`
            color: blue;
        `,
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(3);
    // Base component css must injected first so the extending component can
    // override it's css
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("Base1");
    expect(mockInjectGlobal.mock.calls[1][0]).toEqual("Base2");
    expect(mockInjectGlobal.mock.calls[2][0]).toEqual("TestBlock");
});

test("server rendering render base components in correct order", () => {
    process.env.TEST_ENV = "node";

    const bemed = createBemed();

    const Base1 = bemed({
        name: "Base1",
        css: css`
            color: red;
        `,
    });

    const Base2 = bemed({
        name: "Base2",
        as: Base1,
        css: css`
            color: green;
        `,
    });

    const Block = bemed({
        name: "TestBlock",
        as: Base2,
        css: css`
            color: blue;
        `,
    });

    const rtl = render(
        <SSRProvider>
            <Block>test</Block>
        </SSRProvider>,
    );

    const styleTags = rtl.getAllByTestId("bemed-style");

    expect(styleTags.length).toBe(1);
    expect(styleTags[0].innerHTML).toEqual(
        `
.Base1{color:red;}
.Base2{color:green;}
.TestBlock{color:blue;}
`.trim(),
    );
});

test("can extend other bemed components with mods", () => {
    const bemed = createBemed();
    const Base = bemed({
        name: "Base",
        css: css`
            color: red;
        `,
        mods: {
            foo: css`
                background-color: blue;
            `,
        },
    });

    const Block = bemed({
        name: "TestBlock",
        as: Base,
        css: css`
            color: orange;
        `,
        mods: {
            bar: css`
                border: 1px solid black;
            `,
        },
    });

    render(
        <Block foo bar>
            test
        </Block>,
    );

    expect(injectGlobal).toBeCalledTimes(4);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("Base");
    expect(mockInjectGlobal.mock.calls[1][0]).toEqual("Base--foo");
    expect(mockInjectGlobal.mock.calls[2][0]).toEqual("TestBlock");
    expect(mockInjectGlobal.mock.calls[3][0]).toEqual("TestBlock--bar");
});

test("createClassName() works with precompiledCSS()", () => {
    const bemed = createBemed();

    const FOO = createClassName(
        "foo",
        precompiledCSS("__BEMED__{color: orange;}", ""),
    );

    const Block = bemed({
        name: "TestBlock",
        className: FOO,
    });

    render(<Block>test</Block>);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("foo");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("orange");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain(".foo");
});

test("can use enum mods with css", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "Block",
        mods: {
            things: {
                foo: css`
                    color: red;
                `,
                bar: css`
                    color: blue;
                `,
            },
        },
    });

    const rtl = render(
        <div>
            <Block things="foo">test</Block>
        </div>,
    );

    const el = rtl.getByText("test");
    expect(el.className).toBe("Block Block--things--foo");
    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("Block--things--foo");
});

test("can generate class name from the css if no name was provided", () => {
    const bemed = createBemed();
    const Block = bemed({
        css: css`
            color: orange;
        `,
    });

    const generatedClassName = expect.stringMatching(/^bm-.+/);

    const rtl = render(<Block>test</Block>);

    const el = rtl.getByText("test");
    expect(el.className).toEqual(generatedClassName);

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual(generatedClassName);
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("orange");
    expect(mockInjectGlobal.mock.calls[0][1]).toEqual(
        expect.stringMatching(/^\.bm-/),
    );
});

test("can generate class name from the css for elements too", () => {
    const bemed = createBemed();
    const Block = bemed({
        css: css`
            color: orange;
        `,
        elements: {
            Elem: bemed(),
        },
    });

    const rtl = render(<Block.Elem>test</Block.Elem>);

    const el = rtl.getByText("test");
    expect(el.className).toEqual(expect.stringMatching(/^bm-.+__Elem$/));
});
