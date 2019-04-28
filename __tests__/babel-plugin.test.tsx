import dedent from "dedent";
import { transform } from "@babel/core";

declare const __dirname: string;
declare const process: any;

function cleanSourceMapComment(s: string | undefined | null) {
    return (s || "").replace(
        /sourceMappingURL=[^ ]+/g,
        "sourceMappingURL=SOURCEMAP",
    );
}

function lines(...args: string[]) {
    return args.join("\n");
}

beforeEach(() => {
    process.env.NODE_ENV = "test";
});

function runPlugin(code: string) {
    const res = transform(code, {
        babelrc: false,
        filename: "test.ts",
        plugins: [__dirname + "/../src/babel-plugin.ts"],
    });

    if (!res) {
        throw new Error("plugin failed");
    }

    return res;
}

test("adds source maps", () => {
    const code = dedent`
    import { css } from "react-bemed/css";
    const foo = css\`color: red\`;
    `;

    const res = runPlugin(code);
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(["__BEMED__{color:red;}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("can handle single placeholder", () => {
    const code = lines(
        'import { css } from "react-bemed/css";',
        "const foo = css`color: ${123}; border: 1px solid black;`;",
    );

    const res = runPlugin(code);
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(["__BEMED__{color:", 123, ";border:1px solid black;}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("can handle two placeholders", () => {
    const code = lines(
        'import { css } from "react-bemed/css";',
        "const foo = css`color: ${123}; border: 1px ${321} red;`;",
    );

    const res = runPlugin(code);
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(["__BEMED__{color:", 123, ";border:1px ", 321, " red;}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("can handle three placeholders", () => {
    const code = lines(
        'import { css } from "react-bemed/css";',
        'const foo = css`color: ${123}; border: 1px ${321} red; backgroud-color: ${"orange"}`;',
    );

    const res = runPlugin(code);
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(["__BEMED__{color:", 123, ";border:1px ", 321, " red;backgroud-color:", "orange", ";}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("precompiles css", () => {
    const code = dedent`
    import { css } from "react-bemed/css";
    const foo = css\`
        a {
            color: red;
        }
    }
    \`;
    `;

    const res = runPlugin(code);
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(["__BEMED__ a{color:red;}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("precompiles autoprefixing by default", () => {
    const code = dedent`
    import { css } from "react-bemed/css";
    const foo = css\`
        transition: all 4s ease; 
    }
    \`;
    `;

    const res = runPlugin(code);
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(["__BEMED__{-webkit-transition:all 4s ease;transition:all 4s ease;}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});
