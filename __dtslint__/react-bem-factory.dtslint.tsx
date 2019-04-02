import {bemed} from "../src/react-bemed";
import React from "react";

test("does not allow bad types on block components", () => {
    const createBlock = bemed("prefix-");

    const Block = createBlock("test-block", {
        mods: {
            ding: true,
        },
    });

    // $ExpectError
    console.log(<Block bad>test</Block>);
});

test("does not allow bad types on block element components", () => {
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

    // $ExpectError
    console.log(<BlockElement bad>test</BlockElement>);
});

test("does not allow bad types on block components", () => {
    const createBlock = bemed("prefix-");

    const Block = createBlock("test-block", {
        el: "div",
        mods: {
            ding: true,
        },
    });

    console.log(
        // $ExpectError
        <Block playsInline>test</Block>,
    );
});

test("defaults to div", () => {
    const createBlock = bemed("prefix-");

    const Block = createBlock("test-block", {
        mods: {
            ding: true,
        },
    });

    console.log(
        // $ExpectError
        <Block playsInline>test</Block>,
    );
});

test("mods are true", () => {
    const createBlock = bemed("prefix-");

    const Block = createBlock(
        "test-block",
        // $ExpectError
        {
            mods: {
                foo: false,
            },
        },
    );

    // const El = Block.createBEMElement({
    //     name: "el",
    //     // $ExpectError
    //     mods: {
    //         bar: false,
    //     },
    // });
});
