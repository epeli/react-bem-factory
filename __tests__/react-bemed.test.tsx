import { render, cleanup, fireEvent } from "react-testing-library";
import { createBemed } from "../src/react-bemed";
import React, { Children } from "react";

afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    process.env.TEST_ENV = "browser";
    process.env.NODE_ENV = "test";
});

test("single class name", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "test-block",
    });

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("test-block");
});

test("has class property", () => {
    const bemed = createBemed({ prefix: "ns-" });

    const Block = bemed({
        name: "TestBlock",
        elements: {
            Foo: bemed(),
        },
    });

    expect(Block.className).toBe("ns-TestBlock");
    expect(Block.Foo.className).toBe("ns-TestBlock__Foo");
});

test("single class name with prefix", () => {
    const bemed = createBemed({ prefix: "prefix-" });

    const Block = bemed({
        name: "test-block",
    });

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block");
});

test("can use boolean mods", () => {
    const bemed = createBemed({ prefix: "prefix-" });

    const Block = bemed({
        name: "test-block",
        mods: {
            ding: true,
        },
    });

    const rtl = render(<Block ding>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block prefix-test-block--ding");
});

test("can use enum mods with booleans", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "Block",
        mods: {
            things: {
                foo: true,
                bar: true,
            },
        },
    });

    const rtl = render(
        <div>
            <Block things="foo">test</Block>
        </div>,
    );

    const el = rtl.getByText("test");
    expect(el.className).toBe("Block Block--things--foo");
});

test("can set defaults to enum mods", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "Block",
        mods: {
            things: {
                foo: true,
                bar: true,
            },
        },
        modDefaults: {
            things: "bar",
        },
    });

    const rtl = render(
        <div>
            <Block>test</Block>
        </div>,
    );

    const el = rtl.getByText("test");
    expect(el.className).toBe("Block Block--things--bar");
});

test("enum mod defaults can be overridden", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "Block",
        mods: {
            things: {
                foo: true,
                bar: true,
            },
        },
        modDefaults: {
            things: "bar",
        },
    });

    const rtl = render(
        <div>
            <Block things="foo">test</Block>
        </div>,
    );

    const el = rtl.getByText("test");
    expect(el.className).toBe("Block Block--things--foo");
});

test("can use union block mods with strings", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "Block",
        mods: {
            things: {
                foo: "my-foo",
                bar: "my-bar",
            },
        },
    });

    const rtl = render(
        <div>
            <Block things="foo">test</Block>
        </div>,
    );

    const el = rtl.getByText("test");
    expect(el.className).toBe("Block my-foo");
});

test("can use array mods", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "Test",
        mods: {
            ding: ["foo", "bar"],
        },
    });

    const rtl = render(<Block ding>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("Test bar foo");
});

test("can use arrays in enum mods", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "Test",
        mods: {
            ding: {
                foo: ["ding", "dong"],
                bar: ["lol", "haha"],
            },
        },
    });

    const rtl = render(<Block ding="bar">test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("Test haha lol");
});

test("can use multiple submods at once", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "Block",
        mods: {
            things1: {
                foo: true,
                bar: true,
            },
            things2: {
                foo: "my-foo",
                bar: "my-bar",
            },
        },
    });

    const rtl = render(
        <div>
            <Block things1="foo" things2="bar">
                test
            </Block>
        </div>,
    );

    const el = rtl.getByText("test");
    expect(el.className).toBe("Block Block--things1--foo my-bar");
});

test("block mods can change", () => {
    const bemed = createBemed({ prefix: "prefix-" });

    const Block = bemed({
        name: "test-block",
        mods: {
            ding: true,
        },
    });

    function App() {
        const [tog, setToggle] = React.useState(false);
        return (
            <div>
                <button
                    onClick={() => {
                        setToggle((t) => !t);
                    }}
                >
                    button
                </button>

                <Block ding={tog}>test</Block>
            </div>
        );
    }

    const rtl = render(<App />);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block");
    fireEvent.click(rtl.getByText("button"));
    expect(el.className).toBe("prefix-test-block prefix-test-block--ding");
    fireEvent.click(rtl.getByText("button"));
    expect(el.className).toBe("prefix-test-block");
});

test("mods are optional", () => {
    const bemed = createBemed({ prefix: "prefix-" });

    const Block = bemed({
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
    const bemed = createBemed({ prefix: "prefix-" });

    const Block = bemed({
        name: "TestBlock",
        mods: {
            ding: true,
        },
        elements: {
            TestElement: bemed({
                as: "div",
            }),
        },
    });

    const rtl = render(<Block.TestElement>test</Block.TestElement>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-TestBlock__TestElement");
});

test("block elements can have mods too", () => {
    const bemed = createBemed({ prefix: "prefix-" });

    const Block = bemed({
        name: "TestBlock",
        mods: {
            ding: true,
        },
        elements: {
            TestElement: bemed({
                as: "div",
                mods: {
                    dong: true,
                },
            }),
        },
    });

    const rtl = render(<Block.TestElement dong>test</Block.TestElement>);
    const el = rtl.getByText("test");

    expect(el.className).toBe(
        "prefix-TestBlock__TestElement prefix-TestBlock__TestElement--dong",
    );
});

test("block elements can have multiple mods", () => {
    const bemed = createBemed({ prefix: "prefix-" });

    const Block = bemed({
        name: "TestBlock",
        mods: {
            ding: true,
        },
        elements: {
            TestElement: bemed({
                as: "div",
                mods: {
                    dong: true,
                    dong2: true,
                },
            }),
        },
    });

    const rtl = render(
        <Block.TestElement dong dong2>
            test
        </Block.TestElement>,
    );
    const el = rtl.getByText("test");

    expect(el.className).toBe(
        "prefix-TestBlock__TestElement prefix-TestBlock__TestElement--dong prefix-TestBlock__TestElement--dong2",
    );
});

test("passes other props through", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "test-block",
    });

    const rtl = render(<Block title="a title">test</Block>);
    const el = rtl.getByText("test");

    expect(el.title).toBe("a title");
});

test("passes other props through when using mods", () => {
    const bemed = createBemed();

    const Block = bemed({
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
    const bemed = createBemed();

    const Block = bemed({
        name: "test-block",
        as: "input",
    });

    const rtl = render(<Block type="submit" role="test" />);
    const el = rtl.getByRole("test");

    expect(el.tagName).toBe("INPUT");
    expect((el as any).type).toBe("submit");
});

test("can pass custom runtime class names", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "TestBlock",
        elements: {
            Foo: bemed(),
        },
    });

    const rtl = render(
        <div>
            <Block className="my-class">block</Block>
            <Block.Foo className="foo-custom other">element</Block.Foo>
        </div>,
    );

    const blockEl = rtl.getByText("block");
    expect(blockEl.className).toBe("TestBlock my-class");

    const elEl = rtl.getByText("element");
    expect(elEl.className).toBe("TestBlock__Foo foo-custom other");
});

test("forwards refs", () => {
    expect.assertions(1);
    const bemed = createBemed();

    const Block = bemed({
        name: "test-block",
    });

    render(
        <Block
            ref={(el) => {
                if (el) {
                    expect(el.tagName).toBe("DIV");
                }
            }}
        >
            test
        </Block>,
    );
});

test("can use extra class names from the factory", () => {
    const bemed = createBemed({
        prefix: "foo-",
        className: "bar",
    });

    const Block = bemed({
        name: "TestBlock",
    });

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("foo-TestBlock bar");
});

test("can use multiple extra class names from the factory", () => {
    const bemed = createBemed({
        prefix: "foo-",
        className: "ding dong",
    });

    const Block = bemed({ name: "TestBlock" });

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("foo-TestBlock ding dong");
});

test("can use custom mod class names with block", () => {
    const bemed = createBemed({ prefix: "prefix-" });

    const Block = bemed({
        name: "TestBlock",
        mods: {
            custom: "custommod",
            normal: true,
        },
    });

    const rtl = render(
        <Block custom normal>
            test
        </Block>,
    );
    const el = rtl.getByText("test");

    expect(el.className).toBe(
        "prefix-TestBlock prefix-TestBlock--normal custommod",
    );
});

test("can use custom mod class names with element", () => {
    const bemed = createBemed({ prefix: "prefix-" });

    const Block = bemed({
        name: "TestBlock",
        elements: {
            TestElement: bemed({
                as: "div",
                mods: {
                    dong: "customel",
                },
            }),
        },
    });

    const rtl = render(<Block.TestElement dong>test</Block.TestElement>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-TestBlock__TestElement customel");
});

test("blocks can add custom class names", () => {
    const bemed = createBemed({ prefix: "ns-" });

    const Block = bemed({
        name: "TestBlock",
        className: "custom",
    });

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("ns-TestBlock custom");
});

test("custom class name in a block don't leak to elements", () => {
    const bemed = createBemed({ prefix: "ns-" });

    const Block = bemed({
        name: "test-block",
        className: "custom",
        elements: {
            Elm: bemed({ as: "div" }),
        },
    });

    const rtl = render(<Block.Elm>test</Block.Elm>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("ns-test-block__Elm");
});

test("elements can add custom class names too", () => {
    const bemed = createBemed({ prefix: "ns-" });

    const Block = bemed({
        name: "TestBlock",
        className: "block-custom",
        elements: {
            Elm: bemed({
                as: "div",
                className: "el-custom",
            }),
        },
    });

    const rtl = render(<Block.Elm>test</Block.Elm>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("ns-TestBlock__Elm el-custom");
});

test("can use custom separators", () => {
    const bemed = createBemed({
        prefix: "ns-",
        separators: {
            modifier: "__M__",
            element: "__E__",
        },
    });

    const Block = bemed({
        name: "TestBlock",
        mods: {
            blockmod: true,
        },
        elements: {
            Elm: bemed({
                as: "div",
                className: "el-custom",
                mods: {
                    elmmod: true,
                },
            }),
        },
    });

    const rtl = render(
        <div>
            <Block blockmod>block</Block>
            <Block.Elm elmmod>element</Block.Elm>
        </div>,
    );

    expect(rtl.getByText("block").className).toBe(
        "ns-TestBlock ns-TestBlock__M__blockmod",
    );
    expect(rtl.getByText("element").className).toBe(
        "ns-TestBlock__E__Elm ns-TestBlock__E__Elm__M__elmmod el-custom",
    );
});

test("duplicate classnames are removed", () => {
    const bemed = createBemed({
        prefix: "ns-",
        className: "dup",
    });

    const Block = bemed({
        name: "TestBlock",
        className: "dup",
        elements: {
            Foo: bemed({
                className: "dup",
            }),
        },
    });

    const rtl = render(
        <div>
            <Block className="dup dup">block</Block>
            <Block.Foo className="dup dup">element</Block.Foo>
        </div>,
    );

    const blockEl = rtl.getByText("block");
    expect(blockEl.className).toBe("ns-TestBlock dup");

    const elEl = rtl.getByText("element");
    expect(elEl.className).toBe("ns-TestBlock__Foo dup");
});

test("can use function components as the elements", () => {
    const bemed = createBemed();

    function MyComp(props: {
        className?: string;
        foo: string;
        children: React.ReactNode;
    }) {
        return (
            <span data-testid="test" className={props.className}>
                {props.foo}
            </span>
        );
    }

    const Block = bemed({
        name: "Block",
        as: MyComp,
        mods: {
            bar: true,
        },
    });

    const rtl = render(
        <div>
            <Block foo="FOO" bar>
                block
            </Block>
        </div>,
    );

    const el = rtl.getByTestId("test");

    expect(el.tagName).toBe("SPAN");
    expect(el.className).toBe("Block Block--bar");
    expect(el.innerHTML).toBe("FOO");
});

test("server render allows duplicate class names", () => {
    process.env.TEST_ENV = "node";
    const bemed = createBemed();
    bemed({ name: "Foo" });
    bemed({ name: "Foo" });
});

test("can set default props", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "TestBlock",
        defaultProps: {
            title: "default title",
        },
    });

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.title).toBe("default title");
});

test("default props can be overridden", () => {
    const bemed = createBemed();

    const Block = bemed({
        name: "TestBlock",
        defaultProps: {
            title: "default title",
        },
    });

    const rtl = render(<Block title="override">test</Block>);
    const el = rtl.getByText("test");

    expect(el.title).toBe("override");
});

test("does not pass mod props to the underlying component", () => {
    const spy = jest.fn();

    function Target(props: { baz: string }) {
        spy(props);
        return null;
    }

    const bemed = createBemed();

    const Base = bemed({
        name: "Base",
        as: Target,
        mods: {
            foo: true,
        },
    });

    const Block = bemed({
        name: "TestBlock",
        as: Base,
        mods: {
            bar: true,
        },
    });

    render(<Block foo bar baz="zam" />);

    expect(spy).toHaveBeenCalledWith({
        baz: "zam",
        className: "Base TestBlock Base--foo TestBlock--bar",
    });
});

test("can extend other bemed components", () => {
    const bemed = createBemed();

    const Base = bemed({
        name: "Base",
        defaultProps: {
            title: "title from base",
        },
        mods: {
            foo: true,
        },
    });

    const Block = bemed({
        name: "TestBlock",
        as: Base,
        mods: {
            bar: true,
        },
    });

    const rtl = render(
        <Block foo bar>
            test
        </Block>,
    );

    const el = rtl.getByText("test");

    expect(el.className).toBe("Base TestBlock Base--foo TestBlock--bar");
    expect(el.title).toBe("title from base");
});

test("can be used without name", () => {
    const bemed = createBemed({});

    const Block = bemed({});

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("");
});
