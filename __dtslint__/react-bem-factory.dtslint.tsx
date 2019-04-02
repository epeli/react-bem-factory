import {createBEMNamespace} from "../src/react-bem-factory";
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

test("does not allow bad types on block components", () => {
    const createBlock = createBEMNamespace("prefix-");

    const Block = createBlock({
        name: "test-block",
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
    const createBlock = createBEMNamespace("prefix-");

    const Block = createBlock({
        name: "test-block",
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
    const createBlock = createBEMNamespace("prefix-");

    const Block = createBlock({
        name: "test-block",
        // $ExpectError
        mods: {
            foo: false,
        },
    });

    // const El = Block.createBEMElement({
    //     name: "el",
    //     // $ExpectError
    //     mods: {
    //         bar: false,
    //     },
    // });
});
