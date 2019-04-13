import { render, cleanup, fireEvent } from "react-testing-library";
import { bemed } from "../src/react-bemed";
import React from "react";
import { css } from "../src/css";
import { injectGlobal } from "../src/inject-css";

jest.mock("../src/inject-css");

const mockInjectGlobal = injectGlobal as jest.Mock<typeof injectGlobal>;

afterEach(() => {
    cleanup();
    jest.resetAllMocks();
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
