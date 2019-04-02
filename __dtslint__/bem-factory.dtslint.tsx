import {createBEMNamespace} from "../src/bem-factory";
import React from "react";

test("does not allow bad types on block components", () => {
    const createBlock = createBEMNamespace("prefix-");

    const Block = createBlock({
        name: "test-block",
        mods: {
            ding: true,
        },
    });

    // $ExpectError
    console.log(<Block bad>test</Block>);
});

test("does not allow bad types on block element components", () => {
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

    // $ExpectError
    console.log(<BlockElement bad>test</BlockElement>);
});
