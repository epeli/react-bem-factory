import dedent from "dedent";
import Stylis from "stylis";
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

    return JSON.parse(Buffer.from(match[1].split(",")[1], "base64").toString());
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
            'import { css } from "react-bemed/css-precompiled";',
            'const foo = css(["__BEMED__{color:red;}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
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
            'const foo = css(["color: red"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
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
            'import { css } from "react-bemed/css-precompiled";',
            'const foo = css(["__BEMED__{color:", 123, ";border:1px solid black;}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
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
            'const foo = css(["color: ", 123, "; border: 1px solid black;"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
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
            'import { css } from "react-bemed/css-precompiled";',
            'const foo = css(["__BEMED__{color:", 123, ";border:1px ", 321, " red;}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
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
            'import { css } from "react-bemed/css-precompiled";',
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

    const res = runPlugin(code, {
        precompile: true,
        sourceMap: true,
    });
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css-precompiled";',
            'const foo = css(["__BEMED__ a{color:red;}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("can force prefixing with custom Stylis instance", () => {
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
        stylis: new Stylis({
            prefix: true,
        }),
    });
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css-precompiled";',
            'const foo = css(["__BEMED__{-webkit-transition:all 4s ease;transition:all 4s ease;}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("separates rules with /*|*/", () => {
    const code = dedent`
    import { css } from "react-bemed/css";
    const foo = css\`
        .foo {
            color: red;
        }
        .bar {
            border-radius: 10px;
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
            'import { css } from "react-bemed/css-precompiled";',
            'const foo = css(["__BEMED__ .foo{color:red;}/*|*/__BEMED__ .bar{border-radius:10px;}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("separates rules with /*|*/ with media queries", () => {
    const code = dedent`
    import { css } from "react-bemed/css";
    const foo = css\`
        .foo {
            color: red;
        }
        @media (max-width: 600px) {
            border-radius: 10px;
        }
    }
    \`;
    `;

    // Make sure stylis internal state does not mess things up
    runPlugin(code, {
        precompile: true,
        sourceMap: true,
    });

    const res = runPlugin(code, {
        precompile: true,
        sourceMap: true,
    });

    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css-precompiled";',
            'const foo = css(["__BEMED__ .foo{color:red;}/*|*/@media (max-width:600px){__BEMED__{border-radius:10px;}}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});
