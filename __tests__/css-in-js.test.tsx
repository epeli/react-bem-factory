import { render, cleanup, fireEvent } from "react-testing-library";
import { bemed } from "../src/react-bemed";
import React from "react";
import { css, SSRProvider } from "../src/css";
import { injectGlobal } from "../src/inject-css";

jest.mock("../src/inject-css");

declare const process: any;

const mockInjectGlobal = injectGlobal as jest.Mock<typeof injectGlobal>;

afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    process.env.TEST_ENV = "browser";
});

test("injects style tag for blocks", () => {
    const block = bemed();
    const Block = block("TestBlock", {
        css: css`
            color: orange;
        `,
    });

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("orange");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain(".TestBlock");
});

test("injects style tag for elements", () => {
    const block = bemed();

    const Block = block("TestBlock", {
        elements: {
            Foo: {
                css: css`
                    color: red;
                `,
            },
        },
    });

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock__Foo");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("red");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain(".TestBlock__Foo");
});

test("injects style tag for block mods", () => {
    const block = bemed();

    const Block = block("TestBlock", {
        mods: {
            ding: css`
                color: orange;
            `,
        },
    });

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock--ding");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("orange");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain(".TestBlock--ding");
});

test("also adds the BEM class for css block mods", () => {
    const block = bemed("prefix");

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
    const block = bemed("prefix");

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
    const block = bemed();

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

    expect(injectGlobal).toBeCalledTimes(1);
    expect(mockInjectGlobal.mock.calls[0][0]).toEqual("TestBlock__Foo--ding");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain("orange");
    expect(mockInjectGlobal.mock.calls[0][1]).toContain(
        ".TestBlock__Foo--ding",
    );
});

test("server renders style tags for blocks", () => {
    process.env.TEST_ENV = "node";

    const block = bemed();
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

    const block = bemed();
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

    const block = bemed();
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

    const block = bemed();
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

    const block = bemed();

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

    const block = bemed();

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

    const block = bemed();

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
