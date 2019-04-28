import * as BabelTypes from "@babel/types";
import { Visitor, NodePath } from "@babel/traverse";
import { SourceMapGenerator } from "source-map";
import convert from "convert-source-map";

type CallValue = BabelTypes.CallExpression["arguments"][0];

interface BabelFile {
    opts: {
        generatorOpts: any;
    };
    code: string;
    path: NodePath;
}

export interface PluginOptions {
    opts?: {
        target?: string;
        runtime?: string;
    };
    file: BabelFile;
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

export default function bemedBabelPlugin(
    babel: Babel,
): { visitor: Visitor<PluginOptions> } {
    const t = babel.types;

    /**
     * Local name of the css import from react-bemed/css if any
     */
    let name: string | null = null;

    return {
        visitor: {
            Program() {
                // Reset import name state when entering a new file
                name = null;
            },

            ImportDeclaration(path, state) {
                const opts = state.opts || {};

                const target = opts.target || "react-bemed/css";

                if (path.node.source.value !== target) {
                    return;
                }

                for (const s of path.node.specifiers) {
                    if (!t.isImportSpecifier(s)) {
                        continue;
                    }
                    if (s.imported.name === "css") {
                        name = s.local.name;
                    }
                }
            },

            TaggedTemplateExpression(path, state) {
                if (!name) {
                    return;
                }

                if (!t.isIdentifier(path.node.tag, { name })) {
                    return;
                }

                if (!path.node.loc) {
                    return;
                }

                const sourceMap = getSourceMap(path.node.loc.start, state.file);

                path.replaceWith(
                    t.callExpression(t.identifier(name), [
                        path.node.quasi,
                        t.stringLiteral(sourceMap),
                    ]),
                );
            },
        },
    };
}
