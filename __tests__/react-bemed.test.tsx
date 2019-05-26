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

    const Block = bemed()("test-block");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("test-block");
});

test("has class property", () => {
    const bemed = createBemed("ns");

    const Block = bemed({
        elements: {
            Foo: bemed(),
        },
    })("TestBlock");

    expect(Block.className).toBe("ns-TestBlock");
    expect(Block.Foo.className).toBe("ns-TestBlock__Foo");
});

test("single class name with prefix", () => {
    const bemed = createBemed("prefix");

    const Block = bemed()("test-block");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block");
});

test("can use block mods", () => {
    const bemed = createBemed("prefix");

    const Block = bemed({
        mods: {
            ding: true,
        },
    })("test-block");

    const rtl = render(<Block ding>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block prefix-test-block--ding");
});

test("can use union block mods with booleans", () => {
    const bemed = createBemed("");

    const Block = bemed({
        mods: {
            things: {
                foo: true,
                bar: true,
            },
        },
    })("Block");

    const rtl = render(
        <div>
            <Block things="foo">test</Block>
        </div>,
    );

    const el = rtl.getByText("test");
    expect(el.className).toBe("Block Block--things--foo");
});

test("can use union block mods with strings", () => {
    const bemed = createBemed("");

    const Block = bemed({
        mods: {
            things: {
                foo: "my-foo",
                bar: "my-bar",
            },
        },
    })("Block");

    const rtl = render(
        <div>
            <Block things="foo">test</Block>
        </div>,
    );

    const el = rtl.getByText("test");
    expect(el.className).toBe("Block my-foo");
});

test("can use multiple submods at once", () => {
    const bemed = createBemed("");

    const Block = bemed({
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
    })("Block");

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
    const bemed = createBemed("prefix");

    const Block = bemed({
        mods: {
            ding: true,
        },
    })("test-block");

    function App() {
        const [tog, setToggle] = React.useState(false);
        return (
            <div>
                <button
                    onClick={() => {
                        setToggle(t => !t);
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
    const bemed = createBemed("prefix");

    const Block = bemed({
        mods: {
            ding: true,
        },
    })("test-block");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block");
});

test("can create block elements", () => {
    const bemed = createBemed("prefix");

    const Block = bemed({
        mods: {
            ding: true,
        },
        elements: {
            TestElement: bemed({
                as: "div",
            }),
        },
    })("TestBlock");

    const rtl = render(<Block.TestElement>test</Block.TestElement>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-TestBlock__TestElement");
});

test("block elements can have mods too", () => {
    const bemed = createBemed("prefix");

    const Block = bemed({
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
    })("TestBlock");

    const rtl = render(<Block.TestElement dong>test</Block.TestElement>);
    const el = rtl.getByText("test");

    expect(el.className).toBe(
        "prefix-TestBlock__TestElement prefix-TestBlock__TestElement--dong",
    );
});

test("block elements can have multiple mods", () => {
    const bemed = createBemed("prefix");

    const Block = bemed({
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
    })("TestBlock");

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

    const Block = bemed()("test-block");

    const rtl = render(<Block title="a title">test</Block>);
    const el = rtl.getByText("test");

    expect(el.title).toBe("a title");
});

test("passes other props through when using mods", () => {
    const bemed = createBemed();

    const Block = bemed({
        mods: {
            ding: true,
        },
    })("test-block");

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
        as: "input",
    })("test-block");

    const rtl = render(<Block type="submit" role="test" />);
    const el = rtl.getByRole("test");

    expect(el.tagName).toBe("INPUT");
    expect((el as any).type).toBe("submit");
});

test("can pass custom runtime class names", () => {
    const bemed = createBemed();

    const Block = bemed({
        elements: {
            Foo: bemed(),
        },
    })("TestBlock");

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

    const Block = bemed()("test-block");

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

test("can use extra class names from the factory", () => {
    const bemed = createBemed("foo", {
        className: "bar",
    });

    const Block = bemed()("TestBlock");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("foo-TestBlock bar");
});

test("can use multiple extra class names from the factory", () => {
    const bemed = createBemed("foo", {
        className: "ding dong",
    });

    const Block = bemed()("TestBlock");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("foo-TestBlock ding dong");
});

test("can use custom mod class names with block", () => {
    const bemed = createBemed("prefix");

    const Block = bemed({
        mods: {
            custom: "custommod",
            normal: true,
        },
    })("TestBlock");

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
    const bemed = createBemed("prefix");

    const Block = bemed({
        elements: {
            TestElement: bemed({
                as: "div",
                mods: {
                    dong: "customel",
                },
            }),
        },
    })("TestBlock");

    const rtl = render(<Block.TestElement dong>test</Block.TestElement>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-TestBlock__TestElement customel");
});

test("blocks can add custom class names", () => {
    const bemed = createBemed("ns");

    const Block = bemed({
        className: " custom",
    })("TestBlock");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("ns-TestBlock custom");
});

test("custom class name in a block don't leak to elements", () => {
    const bemed = createBemed("ns");

    const Block = bemed({
        className: "custom",
        elements: {
            Elm: bemed({ as: "div" }),
        },
    })("test-block");

    const rtl = render(<Block.Elm>test</Block.Elm>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("ns-test-block__Elm");
});

test("elements can add custom class names too", () => {
    const bemed = createBemed("ns");

    const Block = bemed({
        className: "block-custom",
        elements: {
            Elm: bemed({
                as: "div",
                className: "el-custom",
            }),
        },
    })("TestBlock");

    const rtl = render(<Block.Elm>test</Block.Elm>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("ns-TestBlock__Elm el-custom");
});

test("can use custom separators", () => {
    const bemed = createBemed("ns", {
        separators: {
            namespace: "__NS__",
            modifier: "__M__",
            element: "__E__",
        },
    });

    const Block = bemed({
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
    })("TestBlock");

    const rtl = render(
        <div>
            <Block blockmod>block</Block>
            <Block.Elm elmmod>element</Block.Elm>
        </div>,
    );

    expect(rtl.getByText("block").className).toBe(
        "ns__NS__TestBlock ns__NS__TestBlock__M__blockmod",
    );
    expect(rtl.getByText("element").className).toBe(
        "ns__NS__TestBlock__E__Elm ns__NS__TestBlock__E__Elm__M__elmmod el-custom",
    );
});

test("duplicate classnames are removed", () => {
    const bemed = createBemed("ns", {
        className: "dup",
    });

    const Block = bemed({
        className: "dup",
        elements: {
            Foo: bemed({
                className: "dup",
            }),
        },
    })("TestBlock");

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
        as: MyComp,
        mods: {
            bar: true,
        },
    })("Block");

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

test("does not allow duplicate class names", () => {
    const bemed = createBemed();
    bemed()("Foo");

    expect(() => {
        bemed()("Foo");
    }).toThrow("Class name collision");
});

test("server render allows duplicate class names", () => {
    process.env.TEST_ENV = "node";
    const bemed = createBemed();
    bemed()("Foo");
    bemed()("Foo");
});

test("can set default props", () => {
    const bemed = createBemed();

    const Block = bemed({
        defaultProps: {
            title: "default title",
        },
    })("TestBlock");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.title).toBe("default title");
});

test("default props can be overridden", () => {
    const bemed = createBemed();

    const Block = bemed({
        defaultProps: {
            title: "default title",
        },
    })("TestBlock");

    const rtl = render(<Block title="override">test</Block>);
    const el = rtl.getByText("test");

    expect(el.title).toBe("override");
});

test("does not pass mod props to the underlying component", () => {
    const spy = jest.fn();

    function Base(props: { bar: string }) {
        spy(props);
        return null;
    }

    const bemed = createBemed();

    const Block = bemed({
        as: Base,
        mods: {
            foo: true,
        },
    })("TestBlock");

    render(<Block foo bar="bar" />);

    expect(spy).toHaveBeenCalledWith({
        bar: "bar",
        className: "TestBlock TestBlock--foo",
    });
});
