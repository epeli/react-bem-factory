import { createBemed } from "../src/react-bemed";
import React from "react";
import { css } from "../src/css";
import { createClassName } from "../src/css-core";

function assertNotAny(a: number) {}
function render(jsx: any) {}

test("does not allow bad types on block components", () => {
    const createBlock = createBemed();
    // $ExpectError
    assertNotAny(createBlock);

    const Block = createBlock({
        name: "test-block",
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
    const createBlock = createBemed();

    const Block = createBlock({
        name: "test-block",
        as: "div",
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
    const createBlock = createBemed();

    const Block = createBlock({
        name: "test-block",
        as: "video",
        mods: {
            ding: true,
        },
    });

    render(<Block playsInline>test</Block>);
});

test("defaults to div", () => {
    const createBlock = createBemed();

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
    const createBlock = createBemed();

    const Block = createBlock({
        name: "test-block",
        mods: {
            // $ExpectError
            foo: false,
        },
    });
});

test("can create inline elements", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "test-block",
        mods: {
            bar: true,
        },
        elements: {
            FooDiv: bemed({
                className: "sdf",
                as: "div",
                mods: {
                    ding: "sdf",
                },
            }),
            BarVideo: bemed({
                as: "video",
                mods: {
                    ding: true,
                },
            }),
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
    const bemed = createBemed();

    const Block = bemed({
        name: "test-block",
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
    });

    render(<Block.FooDiv ding />);

    // $ExpectError
    render(<Block.FooDiv bad />);

    // $ExpectError
    render(<Block.FooDiv playsInline />);
});

test("do not allow extra props", () => {
    const bemed = createBemed();

    bemed({
        name: "test-block",
        // $ExpectError
        bad: 1,
        mods: {
            bar: true,
        },
    });

    bemed({
        name: "test-block",
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
    });
});

test("can use other components as children", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "test-block",
        elements: {
            Foo: bemed({ mods: { right: true } }),
            Bar: bemed(),
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
    const bemed = createBemed();

    const Block = bemed({
        name: "Block",
        elements: {
            Foo: bemed(),
        },
    });

    render(<Block style={{ color: "red" }} />);

    render(<Block.Foo style={{ color: "red" }} />);

    // $ExpectError
    render(<Block.Foo style={{ bad: "red" }} />);
});

test("some other default attributes work too", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "Block",
        elements: {
            Foo: bemed(),
        },
    });

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

test("can use function components as the elements", () => {
    const bemed = createBemed();

    function MyComp(props: { foo: string }) {
        return <div>{props.foo}</div>;
    }

    const Block = bemed({
        name: "Block",
        as: MyComp,
        mods: {
            bar: true,
        },
    });

    render(<Block foo="sdf" bar />);

    // $ExpectError
    render(<Block />);

    // $ExpectError
    render(<Block foo={324} />);
});

test("union mods", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "Block",
        mods: {
            top: true,
            things: {
                foo: true,
                bar: "string",
                baz: css`
                    color: red;
                `,
            },
        },
    });

    render(<Block />);

    render(<Block top things="foo" />);
    render(<Block things="foo" />);
    render(<Block things="bar" />);
    render(<Block things="baz" />);

    // $ExpectError
    render(<Block things="bad" />);
});

test("createClassName() as the class name", () => {
    const bemed = createBemed();
    const FOO_CLASS = createClassName(
        ".foo",
        css`
            color: red;
        `,
    );

    bemed({
        name: "Block",
        className: FOO_CLASS,
    });

    bemed({
        name: "Block",
        className: [FOO_CLASS, "bar"],
    });
});

test("default prop types", () => {
    const bemed = createBemed();

    bemed({
        name: "Block",
        defaultProps: {
            title: "sdaf",
        },
    });

    bemed({
        name: "Block",
        as: "video",
        defaultProps: {
            playsInline: true,
        },
    });

    bemed({
        name: "Block",
        defaultProps: {
            // $ExpectError
            playsInline: true,
        },
    });

    function MyComp(props: { foo: string }) {
        return <div>{props.foo}</div>;
    }

    bemed({
        name: "Block",
        as: MyComp,
        defaultProps: {
            foo: "sdf",
        },
    });

    bemed({
        name: "Block",
        as: MyComp,
        defaultProps: {
            // $ExpectError
            foo: 1,
        },
    });

    bemed({
        name: "Block",
        as: MyComp,
        defaultProps: {
            // $ExpectError
            bad: 1,
        },
    });
});

test("cannot set default for unknown enum mods", () => {
    const bemed = createBemed();

    bemed({
        name: "Block",
        defaultMods: {
            // @ts-expect-error
            things: "bad enum type",
        },
        mods: {
            things: {
                foo: true,
                bar: true,
            },
        },
    });

    bemed({
        name: "Block",
        defaultMods: {
            // @ts-expect-error
            booleanMod: "bad type",
        },
        mods: {
            booleanMod: true,
        },
    });

    bemed({
        name: "Block",
        defaultMods: {
            // @ts-expect-error
            stringMod: "bad type",
        },
        mods: {
            stringMod: "dsaf",
        },
    });
});
