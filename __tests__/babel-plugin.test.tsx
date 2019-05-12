import dedent from "dedent";
import { transform } from "@babel/core";
import * as vlq from "vlq";
import { BemedBabelPluginOptions } from "../src/babel-plugin";

declare const __dirname: string;
declare const process: any;

const SOUREMAP_RE = /sourceMappingURL=([^ ]+)/g;

interface SourceMap {
    version: number;
    names: string[];
    mappings: string;
    file: string;
    sources: string[];
    sourcesContent: string[];
}

function cleanSourceMapComment(s: string | undefined | null) {
    return (s || "").replace(SOUREMAP_RE, "sourceMappingURL=SOURCEMAP");
}

function decodeSourceMap(source: string | undefined | null): SourceMap {
    if (!source) {
        throw new Error("Empty source");
    }

    const match = SOUREMAP_RE.exec(source);

    if (!match) {
        throw new Error("Cannot find source map from: " + source);
    }

    return JSON.parse(new Buffer(match[1].split(",")[1], "base64").toString());
}

function lines(...args: string[]) {
    return args.join("\n");
}

beforeEach(() => {
    process.env.NODE_ENV = "test";
});

function runPlugin(code: string, options?: BemedBabelPluginOptions) {
    const res = transform(code, {
        babelrc: false,
        filename: "test.ts",
        plugins: [[__dirname + "/../src/babel-plugin.ts", options]],
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

    const res = runPlugin(code, {
        precompile: true,
        sourceMap: true,
    });
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(["__BEMED__{color:red;}"].join(""), true, "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("adds source maps without precompiling", () => {
    const code = dedent`
    import { css } from "react-bemed/css";
    const foo = css\`color: red\`;
    `;

    const res = runPlugin(code, {
        precompile: false,
        sourceMap: true,
    });
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(["color: red"].join(""), false, "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("source map points to correct line", () => {
    const code = dedent`
    // some space 
    // here
    import { css } from "react-bemed/css";
    const foo = css\`color: red\`;
    // and a footer
    `;

    const res = runPlugin(code, {
        precompile: true,
        sourceMap: true,
    });
    const map = decodeSourceMap(res.code);

    expect(map.sources).toEqual(["test.ts"]);
    const mappings = vlq.decode(map.mappings);
    expect(mappings).toEqual([0, 0, 3, 12]);
});

test("can handle single placeholder", () => {
    const code = lines(
        'import { css } from "react-bemed/css";',
        "const foo = css`color: ${123}; border: 1px solid black;`;",
    );

    const res = runPlugin(code, {
        precompile: true,
        sourceMap: true,
    });
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(["__BEMED__{color:", 123, ";border:1px solid black;}"].join(""), true, "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("can handle single placeholder without precompiling", () => {
    const code = lines(
        'import { css } from "react-bemed/css";',
        "const foo = css`color: ${123}; border: 1px solid black;`;",
    );

    const res = runPlugin(code, {
        precompile: false,
        sourceMap: true,
    });
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(["color: ", 123, "; border: 1px solid black;"].join(""), false, "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("can handle two placeholders", () => {
    const code = lines(
        'import { css } from "react-bemed/css";',
        "const foo = css`color: ${123}; border: 1px ${321} red;`;",
    );

    const res = runPlugin(code, {
        precompile: true,
        sourceMap: true,
    });
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(["__BEMED__{color:", 123, ";border:1px ", 321, " red;}"].join(""), true, "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("can handle three placeholders", () => {
    const code = lines(
        'import { css } from "react-bemed/css";',
        'const foo = css`color: ${123}; border: 1px ${321} red; backgroud-color: ${"orange"}`;',
    );

    const res = runPlugin(code, {
        precompile: true,
        sourceMap: true,
    });
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(["__BEMED__{color:", 123, ";border:1px ", 321, " red;backgroud-color:", "orange", ";}"].join(""), true, "/*# sourceMappingURL=SOURCEMAP */");',
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

    const res = runPlugin(code, {
        precompile: true,
        sourceMap: true,
    });
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(["__BEMED__ a{color:red;}"].join(""), true, "/*# sourceMappingURL=SOURCEMAP */");',
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

    const res = runPlugin(code, {
        precompile: true,
        sourceMap: true,
    });
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css";',
            'const foo = css(["__BEMED__{-webkit-transition:all 4s ease;transition:all 4s ease;}"].join(""), true, "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});
