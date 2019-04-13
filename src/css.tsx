import React from "react";
import stylis from "stylis";
import { injectGlobal, IS_BROWSER } from "./inject-css";

declare const process: any;

type StyleRenderRecord = Record<string, true>;
const Context = React.createContext<StyleRenderRecord | null>(null);

export function SSRProvider(props: { children: React.ReactNode }) {
    return <Context.Provider value={{}}>{props.children}</Context.Provider>;
}

export type CSSCompiler = (className: string, css: string) => string;

const defaultCompile = (className: string, css: string): string => {
    return stylis("." + className, css);
};

function serverRender<T>(
    reactElement: T,
    cssChunks: {
        className: string;
        cssString: string;
    }[],
    compiler?: CSSCompiler,
): T {
    if (IS_BROWSER) {
        return reactElement;
    }

    const finalCompiler = compiler || defaultCompile;

    return React.createElement(
        Context.Consumer,
        null,
        (compilingRecord: StyleRenderRecord) => {
            if (!compilingRecord) {
                return reactElement;
            }

            let css = "";

            for (const chunk of cssChunks) {
                if (compilingRecord[chunk.className]) {
                    continue;
                }

                compilingRecord[chunk.className] = true;
                css += finalCompiler(chunk.className, chunk.cssString);
            }

            let props: any = {};

            if (process.env.NODE_ENV !== "production") {
                props["data-testid"] = "bemed-style";
            }

            if (!css) {
                return reactElement;
            }

            return React.createElement(
                React.Fragment,
                null,
                React.createElement("style", props, css),
                reactElement,
            );
        },
    ) as any;
}

export function css(literals: TemplateStringsArray, ...placeholders: string[]) {
    let cssString = "";

    for (let i = 0; i < placeholders.length; i++) {
        cssString += literals[i];
        cssString += placeholders[i];
    }

    cssString += literals[literals.length - 1];

    return {
        cssString,

        inject(className: string, compiler: CSSCompiler = defaultCompile) {
            injectGlobal(className, compiler(className, cssString));
        },

        render: serverRender,
    };
}

export type BEMCSS = ReturnType<typeof css>;
