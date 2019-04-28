import dedent from "dedent";
import { transform } from "@babel/core";

declare const __dirname: string;

function cleanSourceMapComment(s: string | undefined | null) {
    return (s || "").replace(
        /sourceMappingURL=[^ ]+/g,
        "sourceMappingURL=SOURCEMAP",
    );
}

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
    expect(cleanSourceMapComment(res.code)).toEqual(dedent`
    import { css } from "react-bemed/css";
    const foo = css(\`color: red\`, "/*# sourceMappingURL=SOURCEMAP */");
    `);
});

test("adds source maps with placeholders", () => {
    const code = dedent`
    import { css } from "react-bemed/css";
    const foo = css\`color: $\{123\}\`;
    `;

    const res = runPlugin(code);
    expect(cleanSourceMapComment(res.code)).toEqual(dedent`
    import { css } from "react-bemed/css";
    const foo = css(\`color: $\{123\}\`, "/*# sourceMappingURL=SOURCEMAP */");
    `);
});
