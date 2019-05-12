import { createBemed } from "../src/react-bemed";
import React from "react";
import { css } from "../src/css";

function assertNotAny(a: number) {}
function render(jsx: any) {}

test("does not allow bad types on block components", () => {
    const createBlock = createBemed("prefix-");
    // $ExpectError
    assertNotAny(createBlock);

    const Block = createBlock({
        mods: {
            ding: true,
        },
    })("test-block");

    // $ExpectError
    assertNotAny(Block);

    // $ExpectError
    console.log(<Block bad>test</Block>);
});

test("does not allow bad types on block components", () => {
    const createBlock = createBemed("prefix-");

    const Block = createBlock({
        el: "div",
        mods: {
            ding: true,
        },
    })("test-block");

    console.log(
        // $ExpectError
        <Block playsInline>test</Block>,
    );
});

test("can use custom els", () => {
    const createBlock = createBemed("prefix-");

    const Block = createBlock({
        el: "video",
        mods: {
            ding: true,
        },
    })("test-block");

    render(<Block playsInline>test</Block>);
});

test("defaults to div", () => {
    const createBlock = createBemed("prefix-");

    const Block = createBlock({
        mods: {
            ding: true,
        },
    })("test-block");

    console.log(
        // $ExpectError
        <Block playsInline>test</Block>,
    );
});

test("mods are true", () => {
    const createBlock = createBemed("prefix-");

    const Block = createBlock(
        // $ExpectError
        {
            mods: {
                foo: false,
            },
        },
    )("test-block");
});

test("can create inline elements", () => {
    const bemed = createBemed();

    const Block = bemed({
        mods: {
            bar: true,
        },
        elements: {
            FooDiv: bemed({
                className: "sdf",
                el: "div",
                mods: {
                    ding: "sdf",
                },
            }),
            BarVideo: bemed({
                el: "video",
                mods: {
                    ding: true,
                },
            }),
        },
    })("test-block");

    // $ExpectError
    render(<Block bar playsInline />);

    render(<Block.FooDiv ding />);

    // $ExpectError
    render(<Block.FooDiv ding bad />);

    // $ExpectError
    render(<Block.FooDiv bad />);

    render(<Block.FooDiv />);

    render(<Block.BarVideo playsInline title="video" />);

    // $ExpectError
    render(<Block.FooDiv playsInline />);

    // $ExpectError
    render(<Block.Bad />);
});

test("inline elements default to divs", () => {
    const bemed = createBemed();

    const Block = bemed({
        mods: {
            bar: true,
        },
        elements: {
            FooDiv: bemed({
                mods: {
                    ding: true,
                },
            }),
        },
    })("test-block");

    render(<Block.FooDiv ding />);

    // $ExpectError
    render(<Block.FooDiv bad />);

    // $ExpectError
    render(<Block.FooDiv playsInline />);
});

test("do not allow extra props", () => {
    const bemed = createBemed();

    bemed({
        // $ExpectError
        bad: 1,
        mods: {
            bar: true,
        },
    })("test-block");

    bemed({
        mods: {
            bar: true,
        },
        elements: {
            FooDiv: {
                // $ExpectError
                bad: 2,
                mods: {
                    ding: true,
                },
            },
        },
    })("test-block");
});

test("can use other components as children", () => {
    const bemed = createBemed();

    const Block = bemed({
        elements: {
            Foo: bemed({ mods: { right: true } }),
            Bar: bemed(),
        },
    })("test-block");

    render(
        <Block>
            <div>hello</div> text
        </Block>,
    );

    render(
        <Block.Bar>
            <div>hello</div>
        </Block.Bar>,
    );

    render(
        <Block.Foo>
            <div>hello</div>
        </Block.Foo>,
    );

    render(<Block.Foo>{"string"}</Block.Foo>);
});

test("can use style attribute", () => {
    const bemed = createBemed();

    const Block = bemed({
        elements: {
            Foo: bemed(),
        },
    })("Block");

    render(<Block style={{ color: "red" }} />);

    render(<Block.Foo style={{ color: "red" }} />);

    // $ExpectError
    render(<Block.Foo style={{ bad: "red" }} />);
});

test("some other default attributes work too", () => {
    const bemed = createBemed();

    const Block = bemed({
        elements: {
            Foo: bemed(),
        },
    })("Block");

    render(<Block.Foo role="sdaf" />);
    render(<Block.Foo title="sdaf" />);
});

test("template tag types", () => {
    const stringOK = css`
        color: ${"string"};
    `;

    const numberOK = css`
        color: ${1234};
    `;

    // prettier-ignore
    const functionError = css`color: ${props => "bad"};`; // $ExpectError
});
