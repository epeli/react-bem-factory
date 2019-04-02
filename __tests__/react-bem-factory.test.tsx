import {act, render, fireEvent, cleanup} from "react-testing-library";
import {createBEMNamespace} from "../src/react-bem-factory";
import React from "react";

afterEach(cleanup);

test("single class name", () => {
    const createBlock = createBEMNamespace();

    const Block = createBlock({
        name: "test-block",
    });

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("test-block");
});

test("has class property", () => {
    const createBlock = createBEMNamespace();

    const Block = createBlock({
        name: "test-block",
    });

    expect(Block.className).toBe("test-block");
});

test("single class name with prefix", () => {
    const createBlock = createBEMNamespace("prefix-");

    const Block = createBlock({
        name: "test-block",
    });

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block");
});

test("can use block mods", () => {
    const createBlock = createBEMNamespace("prefix-");

    const Block = createBlock({
        name: "test-block",
        mods: {
            ding: true,
        },
    });

    const rtl = render(<Block ding>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block prefix-test-block--ding");
});

test("mods are optional", () => {
    const createBlock = createBEMNamespace("prefix-");

    const Block = createBlock({
        name: "test-block",
        mods: {
            ding: true,
        },
    });

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block");
});

test("can create block elements", () => {
    const createBlock = createBEMNamespace("prefix-");

    const Block = createBlock({
        name: "test-block",
        mods: {
            ding: true,
        },
    });

    const BlockElement = Block.createBEMElement({
        name: "test-element",
    });

    const rtl = render(<BlockElement>test</BlockElement>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block__test-element");
});

test("block elements can have mods too", () => {
    const createBlock = createBEMNamespace("prefix-");

    const Block = createBlock({
        name: "test-block",
        mods: {
            ding: true,
        },
    });

    const BlockElement = Block.createBEMElement({
        name: "test-element",
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
    const createBlock = createBEMNamespace();

    const Block = createBlock({
        name: "test-block",
    });

    const rtl = render(<Block title="a title">test</Block>);
    const el = rtl.getByText("test");

    expect(el.title).toBe("a title");
});

test("passes other props through when using mods", () => {
    const createBlock = createBEMNamespace();

    const Block = createBlock({
        name: "test-block",
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
    const createBlock = createBEMNamespace();

    const Block = createBlock({
        name: "test-block",
        el: "input",
    });

    const rtl = render(<Block type="submit" role="test" />);
    const el = rtl.getByRole("test");

    expect(el.tagName).toBe("INPUT");
    expect((el as any).type).toBe("submit");
});

test("can pass custom class names", () => {
    const createBlock = createBEMNamespace();

    const Block = createBlock({
        name: "test-block",
    });

    const rtl = render(<Block className="my-class">test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("my-class test-block");
});

test("forwards refs", () => {
    expect.assertions(1);
    const createBlock = createBEMNamespace();

    const Block = createBlock({
        name: "test-block",
    });

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