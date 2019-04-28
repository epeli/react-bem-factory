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
            'const foo = css(`__BEMED__{color:red;}`, "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("adds source maps with placeholders", () => {
    const code = lines(
        'import { css } from "react-bemed/css";',
        "const foo = css`color: ${123}; border: 1px ${321} red;`;",
    );

    const res = runPlugin(code);
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(`__BEMED__{color:${123};border:1px ${321} red;}`, "/*# sourceMappingURL=SOURCEMAP */");',
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
            'const foo = css(`__BEMED__ a{color:red;}`, "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});
