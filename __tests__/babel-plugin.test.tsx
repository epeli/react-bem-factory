import dedent from "dedent";
import Stylis from "stylis";
import { transform } from "@babel/core";
import * as vlq from "vlq";
import {
    BemedBabelPluginOptions,
    SEEN_FILES,
    SEEN_NAMES,
} from "../src/babel-plugin";

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
    SEEN_FILES.clear();
    SEEN_NAMES.clear();
});

function runPlugin(
    code: string,
    options?: {
        filename?: string;
        pluginOptions: BemedBabelPluginOptions;
    },
) {
    const res = transform(code, {
        babelrc: false,
        filename: options?.filename ?? "test.ts",
        plugins: [
            [__dirname + "/../src/babel-plugin.ts", options?.pluginOptions],
        ],
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
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
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
        pluginOptions: {
            precompile: false,
            sourceMap: true,
        },
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
        pluginOptions: { precompile: true, sourceMap: true },
    });
    const map = decodeSourceMap(res.code);

    expect(map.sources).toEqual(["test.ts"]);
    const mappings = vlq.decode(map.mappings);
    expect(mappings).toEqual([0, 0, 3, 12]);
});

test("can handle single placeholder when precompiling", () => {
    const code = lines(
        'import { css } from "react-bemed/css";',
        "const foo = css`color: ${123}; border: 1px solid black;`;",
    );

    const res = runPlugin(code, {
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
    });
    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css-precompiled";',
            'const foo = css(["__BEMED__{color:", 123, ";border:1px solid black;}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("can precompile variables media queries", () => {
    const code = lines(
        'import { css } from "react-bemed/css";',
        "const foo = css`",
        "    @media (${variable}) {",
        "        color: red;",
        "    }",
        "`",
    );

    const res = runPlugin(code, {
        pluginOptions: {
            precompile: true,
            sourceMap: false,
        },
    });

    expect(res.code).toEqual(
        lines(
            'import { css } from "react-bemed/css-precompiled";',
            'const foo = css(["@media (", variable, "){__BEMED__{color:red;}}"].join(""), "");',
        ),
    );
});

test("can handle single placeholder without precompiling", () => {
    const code = lines(
        'import { css } from "react-bemed/css";',
        "const foo = css`color: ${123}; border: 1px solid black;`;",
    );

    const res = runPlugin(code, {
        pluginOptions: {
            precompile: false,
            sourceMap: true,
        },
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
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
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
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
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
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
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
        pluginOptions: {
            precompile: true,
            sourceMap: true,
            stylis: new Stylis({
                prefix: true,
            }),
        },
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
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
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
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
    });

    const res = runPlugin(code, {
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
    });

    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css-precompiled";',
            'const foo = css(["__BEMED__ .foo{color:red;}/*|*/@media (max-width:600px){__BEMED__{border-radius:10px;}}"].join(""), "/*# sourceMappingURL=SOURCEMAP */");',
        ),
    );
});

test("precompile variables with prefixer", () => {
    const code = lines(
        'import { css } from "react-bemed/css";',
        "css`",
        "   flex: ${variable};",
        "   color: ${red};",
        "`",
    );

    const res = runPlugin(code, {
        pluginOptions: {
            precompile: true,
            sourceMap: false,
            stylis: new Stylis({
                prefix: true,
            }),
        },
    });

    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { css } from "react-bemed/css-precompiled";',
            'css(["__BEMED__{-webkit-flex:", variable, ";-ms-flex:", variable, ";flex:", variable, ";color:", red, ";}"].join(""), "");',
        ),
    );
});

test("adds name automatically", () => {
    const code = dedent`
    import { bemed } from "react-bemed";
    const Container = bemed();
    `;

    const res = runPlugin(code, {
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
    });

    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { bemed } from "react-bemed";',
            "const Container = bemed({",
            '  name: "Container"',
            "});",
        ),
    );
});

test("adds name automatically to existing object (const)", () => {
    const code = dedent`
    import { bemed } from "react-bemed";
    const Container = bemed({className: "ding"});
    `;

    const res = runPlugin(code, {
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
    });

    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { bemed } from "react-bemed";',
            "const Container = bemed({",
            '  name: "Container",',
            '  className: "ding"',
            "});",
        ),
    );
});

test("adds name automatically to existing object (let)", () => {
    const code = dedent`
    import { bemed } from "react-bemed";
    let Container = bemed({className: "ding"});
    `;

    const res = runPlugin(code, {
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
    });

    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { bemed } from "react-bemed";',
            "let Container = bemed({",
            '  name: "Container",',
            '  className: "ding"',
            "});",
        ),
    );
});

test("does not touch existing name", () => {
    const code = dedent`
    import { bemed } from "react-bemed";
    const Container = bemed({ name: "existing-name" });
    `;

    const res = runPlugin(code, {
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
    });

    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { bemed } from "react-bemed";',
            "const Container = bemed({",
            '  name: "existing-name"',
            "});",
        ),
    );
});

test("can use custom function to generate the name", () => {
    const code = dedent`
    import { bemed } from "react-bemed";
    const Container = bemed({className: "ding"});
    `;

    const res = runPlugin(code, {
        pluginOptions: {
            precompile: true,
            sourceMap: true,
            generateName(options) {
                return "custom-" + options.variableName;
            },
        },
    });

    expect(cleanSourceMapComment(res.code)).toEqual(
        lines(
            'import { bemed } from "react-bemed";',
            "const Container = bemed({",
            '  name: "custom-Container",',
            '  className: "ding"',
            "});",
        ),
    );
});

test("detects duplicates when generating name props", () => {
    process.env.NODE_ENV = "production";
    const code = dedent`
    import { bemed } from "react-bemed";
    let Container = bemed();
    `;

    runPlugin(code, {
        filename: "a.ts",
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
    });

    expect(() => {
        runPlugin(code, {
            filename: "b.ts",
            pluginOptions: {
                precompile: true,
                sourceMap: true,
            },
        });
    }).toThrowError('bemed component name "Container" already defined in');
});

test("detects duplicates with existing string literals", () => {
    process.env.NODE_ENV = "production";
    const code = dedent`
    import { bemed } from "react-bemed";
    let Container = bemed({name: "DuplicateContainer"});
    `;

    runPlugin(code, {
        filename: "a.ts",
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
    });

    expect(() => {
        runPlugin(code, {
            filename: "b.ts",
            pluginOptions: {
                precompile: true,
                sourceMap: true,
            },
        });
    }).toThrowError(
        'bemed component name "DuplicateContainer" already defined in',
    );
});

test("duplicate detection does not get confused by multiple compile passes", () => {
    process.env.NODE_ENV = "production";
    const code = dedent`
    import { bemed } from "react-bemed";
    let Container = bemed();
    `;

    runPlugin(code, {
        filename: "a.ts",
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
    });

    runPlugin(code, {
        filename: "a.ts",
        pluginOptions: {
            precompile: true,
            sourceMap: true,
        },
    });
});
