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
    const block = bemed();

    const Block = block("test-block");

    expect(Block.className).toBe("test-block");
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

    const Block = block("test-block", {
        mods: {
            ding: true,
        },
    });

    const BlockElement = Block.element("test-element");

    const rtl = render(<BlockElement>test</BlockElement>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("prefix-test-block__test-element");
});

test("block elements can have mods too", () => {
    const block = bemed("prefix");

    const Block = block("test-block", {
        mods: {
            ding: true,
        },
    });

    const BlockElement = Block.element("test-element", {
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

test("block elements can have multiple mods", () => {
    const block = bemed("prefix");

    const Block = block("test-block", {
        mods: {
            ding: true,
        },
    });

    const BlockElement = Block.element("test-element", {
        mods: {
            dong: true,
            dong2: true,
        },
    });

    const rtl = render(
        <BlockElement dong dong2>
            test
        </BlockElement>,
    );
    const el = rtl.getByText("test");

    expect(el.className).toBe(
        "prefix-test-block__test-element prefix-test-block__test-element--dong prefix-test-block__test-element--dong2",
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

    const Block = block("test-block");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("bar foo-test-block");
});

test("can use multiple extra class names from the factory", () => {
    const block = bemed("foo", {
        className: "ding dong",
    });

    const Block = block("test-block");

    const rtl = render(<Block>test</Block>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("ding dong foo-test-block");
});

test("can use custom mod class names with block", () => {
    const block = bemed("prefix");

    const Block = block("test-block", {
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
        "custommod prefix-test-block prefix-test-block--normal",
    );
});

test("can use custom mod class names with block", () => {
    const block = bemed("prefix");

    const Block = block("test-block");

    const El = Block.element("myel", {
        mods: {
            dong: "customel",
        },
    });

    const rtl = render(<El dong>test</El>);
    const el = rtl.getByText("test");

    expect(el.className).toBe("customel prefix-test-block__myel");
});
