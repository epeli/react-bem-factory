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

function getGeneratorOpts(file: BabelFile) {
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
     * Local name of the oc import from ts-optchain if any
     */
    let name: string | null = null;

    return {
        visitor: {
            Program() {
                // Reset import name state when entering a new file
                name = "css";
            },

            ImportDeclaration(path, state) {
                // const opts = state.opts || {};
                // const target = opts.target || "ts-optchain";
                // if (path.node.source.value !== target) {
                //     return;
                // }
                // path.node.source.value = opts.runtime || RUNTIME_IMPORT;
                // for (const s of path.node.specifiers) {
                //     if (!t.isImportSpecifier(s)) {
                //         continue;
                //     }
                //     if (s.imported.name === "oc") {
                //         name = s.local.name;
                //     }
                // }
            },

            TaggedTemplateExpression(path, state) {
                if (t.isIdentifier(path.node.tag, { name })) {
                    console.log("tagged", path.node.tag.name, state.file);
                    if (path.node.loc) {
                        const sm = getSourceMap(
                            path.node.loc.start,
                            state.file,
                        );
                        console.log("SM", sm);
                    }
                }
            },
        },
    };
}
