import * as BabelTypes from "@babel/types";
import { basename } from "path";
import { Visitor, NodePath } from "@babel/traverse";
import { SourceMapGenerator } from "source-map";
import convert from "convert-source-map";
import Stylis from "stylis";
import { adaptStylis } from "./stylis-adapter";

const customStylis = new Stylis({
    prefix: process.env.NODE_ENV === "production",
});

declare const process: any;

interface BabelFile {
    opts: {
        generatorOpts: any;
    };
    code: string;
    path: NodePath;
}

export interface BemedBabelPluginOptions {
    target?: string;
    runtime?: string;
    stylis?: typeof stylis;
    precompile?: boolean;
    sourceMap?: boolean;
}

interface VisitorState {
    opts?: BemedBabelPluginOptions;
    file: BabelFile;
    filename?: string;
}

export interface Babel {
    types: typeof BabelTypes;
}

function getGeneratorOpts(
    file: BabelFile,
): { sourceFileName: string; sourceRoot: string } {
    return file.opts.generatorOpts ? file.opts.generatorOpts : file.opts;
}

export function makeSourceMapGenerator(file: BabelFile) {
    const generatorOpts = getGeneratorOpts(file);
    const filename = generatorOpts.sourceFileName;
    const generator = new SourceMapGenerator({
        file: filename,
        sourceRoot: generatorOpts.sourceRoot,
    });

    generator.setSourceContent(filename, file.code);
    return generator;
}

export function getSourceMap(
    offset: {
        line: number;
        column: number;
    },
    file: BabelFile,
): string {
    const generator = makeSourceMapGenerator(file);
    const generatorOpts = getGeneratorOpts(file);
    if (generatorOpts.sourceFileName) {
        generator.addMapping({
            generated: {
                line: 1,
                column: 0,
            },
            source: generatorOpts.sourceFileName,
            original: offset,
        });
        return convert.fromObject(generator).toComment({ multiline: true });
    }
    return "";
}

function createArrayExpression(
    t: typeof BabelTypes,
    strings: string[],
    expressions: BabelTypes.Expression[],
    out: BabelTypes.Expression[],
): BabelTypes.ArrayExpression {
    if (strings.length > 1 && expressions.length >= 1) {
        if (strings[0]) {
            out.push(t.stringLiteral(strings[0]));
        }
        out.push(expressions[0]);
        return createArrayExpression(
            t,
            strings.slice(1),
            expressions.slice(1),
            out,
        );
    }

    if (strings.length === 1) {
        if (strings[0]) {
            out.push(t.stringLiteral(strings[0]));
        }
    }

    return t.arrayExpression(out);
}

export default function bemedBabelPlugin(
    babel: Babel,
): { visitor: Visitor<VisitorState> } {
    const t = babel.types;

    /**
     * Local name of the css import from react-bemed/css if any
     */
    let cssImportName: string | null = null;
    let bemedImportName: string | null = null;

    return {
        visitor: {
            Program() {
                // Reset import name state when entering a new file
                cssImportName = null;
                bemedImportName = null;
            },

            ImportDeclaration(path, state) {
                const opts = state.opts || {};

                const target = opts.target || "react-bemed/css";

                if (path.node.source.value === "react-bemed/css") {
                    for (const s of path.node.specifiers) {
                        if (!t.isImportSpecifier(s)) {
                            continue;
                        }

                        if (s.imported.name === "css") {
                            cssImportName = s.local.name;
                        }
                    }

                    if (opts.precompile) {
                        path.node.source.value = "react-bemed/css-precompiled";
                    }
                }

                if (path.node.source.value === "react-bemed") {
                    for (const s of path.node.specifiers) {
                        if (!t.isImportSpecifier(s)) {
                            continue;
                        }

                        if (s.imported.name === "bemed") {
                            bemedImportName = s.local.name;
                        }
                    }
                }
            },

            CallExpression(path, state) {
                if (bemedImportName === null) {
                    return;
                }

                if (!state.filename) {
                    return;
                }

                if (path.node.callee.type !== "Identifier") {
                    return;
                }

                if (path.node.callee.name !== bemedImportName) {
                    return;
                }

                if (path.parentPath.node.type !== "VariableDeclarator") {
                    return;
                }

                if (path.parentPath.node.id.type !== "Identifier") {
                    return;
                }

                const variableName = path.parentPath.node.id.name;

                const currentArg = path.node.arguments[0];

                const nameProp = t.objectProperty(
                    t.identifier("name"),
                    t.stringLiteral(variableName),
                );

                if (!currentArg) {
                    path.node.arguments[0] = t.objectExpression([nameProp]);
                    return;
                }

                if (currentArg.type !== "ObjectExpression") {
                    return;
                }

                const hasNameProp = currentArg.properties.some((prop) => {
                    if (prop.type !== "ObjectProperty") {
                        return false;
                    }

                    if (!t.isIdentifier(prop.key)) {
                        return false;
                    }

                    return prop.key.name === "name";
                });

                if (!hasNameProp) {
                    currentArg.properties.unshift(nameProp);
                }
            },

            TaggedTemplateExpression(path, state) {
                if (!cssImportName) {
                    return;
                }

                if (!t.isIdentifier(path.node.tag, { name: cssImportName })) {
                    return;
                }

                if (!path.node.loc) {
                    return;
                }

                const opts = state.opts || {};

                const addSourceMap =
                    typeof opts.sourceMap === "boolean"
                        ? opts.sourceMap
                        : process.env.NODE_ENV !== "production";

                const sourceMap = addSourceMap
                    ? getSourceMap(path.node.loc.start, state.file)
                    : "";

                let cssArray = path.node.quasi.quasis.map((q) => {
                    return q.value.raw;
                });

                if (opts.precompile) {
                    const finalStylis = opts.stylis || customStylis;
                    const styleString = cssArray.join("__BEMED_VAR__");
                    const adaptedStylis = adaptStylis(finalStylis);
                    cssArray = adaptedStylis("__BEMED__", styleString).split(
                        "__BEMED_VAR__",
                    );
                }

                const arrayJoin = t.callExpression(
                    t.memberExpression(
                        createArrayExpression(
                            t,
                            cssArray,
                            path.node.quasi.expressions,
                            [],
                        ),
                        t.identifier("join"),
                    ),
                    [t.stringLiteral("")],
                );

                const sourceMapStringLiteral = t.stringLiteral(sourceMap);

                path.replaceWith(
                    t.callExpression(t.identifier(cssImportName), [
                        arrayJoin,
                        sourceMapStringLiteral,
                    ]),
                );
            },
        },
    };
}
