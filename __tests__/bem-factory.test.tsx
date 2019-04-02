import {act, render, fireEvent, cleanup} from "react-testing-library";
import {createBEMNamespace} from "../src/bem-factory";
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
