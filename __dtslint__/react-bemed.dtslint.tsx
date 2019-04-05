import { bemed } from "../src/react-bemed";
import React from "react";

function assertNotAny(a: number) {}
function render(jsx: any) {}

test("does not allow bad types on block components", () => {
    const createBlock = bemed("prefix-");
    // $ExpectError
    assertNotAny(createBlock);

    const Block = createBlock("test-block", {
        mods: {
            ding: true,
        },
    });

    // $ExpectError
    assertNotAny(Block);

    // $ExpectError
    console.log(<Block bad>test</Block>);
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

test("can use custom els", () => {
    const createBlock = bemed("prefix-");

    const Block = createBlock("test-block", {
        el: "video",
        mods: {
            ding: true,
        },
    });

    render(<Block playsInline>test</Block>);
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
});

test("can create inline elements", () => {
    const block = bemed();

    const Block = block("test-block", {
        mods: {
            bar: true,
        },
        elements: {
            FooDiv: {
                className: "sdf",
                el: "div",
                mods: {
                    ding: "sdf",
                },
            },
            BarVideo: {
                el: "video",
                mods: {
                    ding: true,
                },
            },
        },
    });

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
    const block = bemed();

    const Block = block("test-block", {
        mods: {
            bar: true,
        },
        elements: {
            FooDiv: {
                mods: {
                    ding: true,
                },
            },
        },
    });

    render(<Block.FooDiv ding />);

    // $ExpectError
    render(<Block.FooDiv bad />);

    // $ExpectError
    render(<Block.FooDiv playsInline />);
});

test("do not allow extra props", () => {
    const block = bemed();

    const Block = block("test-block", {
        // $ExpectError
        bad: 1,
        mods: {
            bar: true,
        },
        elements: {
            FooDiv: {
                bad: 2, // XXX should fail!
                mods: {
                    ding: true,
                },
            },
        },
    });
});

test("can use other components as children", () => {
    const block = bemed();

    const Block = block("test-block", {
        elements: {
            Foo: { mods: { right: true } },
            Bar: {},
        },
    });

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
    const block = bemed();

    const Block = block("Block", {
        elements: {
            Foo: {},
        },
    });

    render(<Block style={{ color: "red" }} />);

    render(<Block.Foo style={{ color: "red" }} />);

    // $ExpectError
    render(<Block.Foo style={{ bad: "red" }} />);
});

test("some other default attributes work too", () => {
    const block = bemed();

    const Block = block("Block", {
        elements: {
            Foo: {},
        },
    });

    render(<Block.Foo role="sdaf"  />);
    render(<Block.Foo title="sdaf" />);
});
