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
});

test("server renders style tags", () => {
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
