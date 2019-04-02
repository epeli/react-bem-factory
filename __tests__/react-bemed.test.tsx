import {render, cleanup} from "react-testing-library";
import {bemed} from "../src/react-bemed";
import React from "react";

afterEach(cleanup);

test("single class name", () => {
    const createBlock = bemed();

    const Block = createBlock("test-block");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("test-block");
});

test("has class property", () => {
    const createBlock = bemed();

    const Block = createBlock("test-block");

    expect(Block.className).toBe("test-block");
});

test("single class name with prefix", () => {
    const createBlock = bemed("prefix-");

    const Block = createBlock("test-block");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block");
});

test("can use block mods", () => {
    const createBlock = bemed("prefix-");

    const Block = createBlock("test-block", {
        mods: {
            ding: true,
        },
    });

    const rtl = render(<Block ding>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block prefix-test-block--ding");
});

test("mods are optional", () => {
    const createBlock = bemed("prefix-");

    const Block = createBlock("test-block", {
        mods: {
            ding: true,
        },
    });

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block");
});

test("can create block elements", () => {
    const createBlock = bemed("prefix-");

    const Block = createBlock("test-block", {
        mods: {
            ding: true,
        },
    });

    const BlockElement = Block.createBEMElement("test-element");

    const rtl = render(<BlockElement>test</BlockElement>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block__test-element");
});

test("block elements can have mods too", () => {
    const createBlock = bemed("prefix-");

    const Block = createBlock("test-block", {
        mods: {
            ding: true,
        },
    });

    const BlockElement = Block.createBEMElement("test-element", {
        mods: {
            dong: true,
        },
    });

    const rtl = render(<BlockElement dong>test</BlockElement>);
    const el = rtl.getByText("test");

    expect(el.className).toBe(
        "prefix-test-block__test-element prefix-test-block__test-element--dong",
    );
});

test("passes other props through", () => {
    const createBlock = bemed();

    const Block = createBlock("test-block");

    const rtl = render(<Block title="a title">test</Block>);
    const el = rtl.getByText("test");

    expect(el.title).toBe("a title");
});

test("passes other props through when using mods", () => {
    const createBlock = bemed();

    const Block = createBlock("test-block", {
        mods: {
            ding: true,
        },
    });

    const rtl = render(
        <Block ding title="a title">
            test
        </Block>,
    );

    const el = rtl.getByText("test");

    expect(el.title).toBe("a title");
    expect(el.className).toBe("test-block test-block--ding");
});

test("can use custom elements", () => {
    const createBlock = bemed();

    const Block = createBlock("test-block", {
        el: "input",
    });

    const rtl = render(<Block type="submit" role="test" />);
    const el = rtl.getByRole("test");

    expect(el.tagName).toBe("INPUT");
    expect((el as any).type).toBe("submit");
});

test("can pass custom class names", () => {
    const createBlock = bemed();

    const Block = createBlock("test-block");

    const rtl = render(<Block className="my-class">test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("my-class test-block");
});

test("forwards refs", () => {
    expect.assertions(1);
    const createBlock = bemed();

    const Block = createBlock("test-block");

    render(
        <Block
            ref={el => {
                if (el) {
                    expect(el.tagName).toBe("DIV");
                }
            }}
        >
            test
        </Block>,
    );
});
