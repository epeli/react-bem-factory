import { render, cleanup, fireEvent } from "react-testing-library";
import { bemed } from "../src/react-bemed";
import React from "react";

afterEach(cleanup);

test("single class name", () => {
    const block = bemed();

    const Block = block("test-block");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("test-block");
});

test("has class property", () => {
    const block = bemed("ns");

    const Block = block("TestBlock", {
        elements: {
            Foo: {},
        },
    });

    expect(Block.className).toBe("ns-TestBlock");
    expect(Block.Foo.className).toBe("ns-TestBlock__Foo");
});

test("single class name with prefix", () => {
    const block = bemed("prefix");

    const Block = block("test-block");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block");
});

test("can use block mods", () => {
    const block = bemed("prefix");

    const Block = block("test-block", {
        mods: {
            ding: true,
        },
    });

    const rtl = render(<Block ding>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block prefix-test-block--ding");
});

test("block mods can change", () => {
    const block = bemed("prefix");

    const Block = block("test-block", {
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
    const block = bemed("prefix");

    const Block = block("test-block", {
        mods: {
            ding: true,
        },
    });

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block");
});

test("can create block elements", () => {
    const block = bemed("prefix");

    const Block = block("TestBlock", {
        mods: {
            ding: true,
        },
        elements: {
            TestElement: {
                el: "div",
            },
        },
    });

    const rtl = render(<Block.TestElement>test</Block.TestElement>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-TestBlock__TestElement");
});

test("block elements can have mods too", () => {
    const block = bemed("prefix");

    const Block = block("TestBlock", {
        mods: {
            ding: true,
        },
        elements: {
            TestElement: {
                el: "div",
                mods: {
                    dong: true,
                },
            },
        },
    });

    const rtl = render(<Block.TestElement dong>test</Block.TestElement>);
    const el = rtl.getByText("test");

    expect(el.className).toBe(
        "prefix-TestBlock__TestElement prefix-TestBlock__TestElement--dong",
    );
});

test("block elements can have multiple mods", () => {
    const block = bemed("prefix");

    const Block = block("TestBlock", {
        mods: {
            ding: true,
        },
        elements: {
            TestElement: {
                el: "div",
                mods: {
                    dong: true,
                    dong2: true,
                },
            },
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
    const block = bemed();

    const Block = block("test-block");

    const rtl = render(<Block title="a title">test</Block>);
    const el = rtl.getByText("test");

    expect(el.title).toBe("a title");
});

test("passes other props through when using mods", () => {
    const block = bemed();

    const Block = block("test-block", {
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
    const block = bemed();

    const Block = block("test-block", {
        el: "input",
    });

    const rtl = render(<Block type="submit" role="test" />);
    const el = rtl.getByRole("test");

    expect(el.tagName).toBe("INPUT");
    expect((el as any).type).toBe("submit");
});

test("can pass custom class names", () => {
    const block = bemed();

    const Block = block("test-block");

    const rtl = render(<Block className="my-class">test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("my-class test-block");
});

test("forwards refs", () => {
    expect.assertions(1);
    const block = bemed();

    const Block = block("test-block");

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
    const block = bemed("foo", {
        className: "bar",
    });

    const Block = block("TestBlock");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("foo-TestBlock bar");
});

test("can use multiple extra class names from the factory", () => {
    const block = bemed("foo", {
        className: "ding dong",
    });

    const Block = block("TestBlock");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("foo-TestBlock ding dong");
});

test("can use custom mod class names with block", () => {
    const block = bemed("prefix");

    const Block = block("TestBlock", {
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
    const block = bemed("prefix");

    const Block = block("TestBlock", {
        elements: {
            TestElement: {
                el: "div",
                mods: {
                    dong: "customel",
                },
            },
        },
    });

    const rtl = render(<Block.TestElement dong>test</Block.TestElement>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-TestBlock__TestElement customel");
});

test("blocks can add custom class names", () => {
    const block = bemed("ns");

    const Block = block("TestBlock", {
        className: " custom",
    });

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("ns-TestBlock custom");
});

test("custom class name in a block don't leak to elements", () => {
    const block = bemed("ns");

    const Block = block("test-block", {
        className: "custom",
        elements: {
            Elm: {
                el: "div",
            },
        },
    });

    const rtl = render(<Block.Elm>test</Block.Elm>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("ns-test-block__Elm");
});

test("elements can add custom class names too", () => {
    const block = bemed("ns");

    const Block = block("TestBlock", {
        className: "block-custom",
        elements: {
            Elm: {
                el: "div",
                className: "el-custom",
            },
        },
    });

    const rtl = render(<Block.Elm>test</Block.Elm>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("ns-TestBlock__Elm el-custom");
});

test("can use custom separators", () => {
    const block = bemed("ns", {
        separators: {
            namespace: "__NS__",
            modifier: "__M__",
            element: "__E__",
        },
    });

    const Block = block("TestBlock", {
        mods: {
            blockmod: true,
        },
        elements: {
            Elm: {
                el: "div",
                className: "el-custom",
                mods: {
                    elmmod: true,
                },
            },
        },
    });

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
