import React from "react";
import stylis from "stylis";
import { injectGlobal, IS_BROWSER } from "./inject-css";

declare const process: any;

type StyleRenderRecord = Record<string, true>;

let DING: Record<string, true> | null = null;

export function serverRenderContext<T>(fn: () => T): T {
    DING = {};
    const ret = fn();
    DING = null;
    return ret;
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
    if (IS_BROWSER()) {
        console.log("is browser skip");
        return reactElement;
    }

    const finalCompiler = compiler || defaultCompile;

    if (!DING) {
        console.log("no ding");

        return reactElement;
    }

    let css = "";

    for (const chunk of cssChunks) {
        if (DING[chunk.className]) {
            continue;
        }

        DING[chunk.className] = true;
        css += finalCompiler(chunk.className, chunk.cssString);
    }

    let props: any = {};

    if (process.env.NODE_ENV !== "production") {
        props["data-testid"] = "bemed-style";
    }

    if (!css) {
        console.log("no css");

        return reactElement;
    }

    return (React.createElement(
        React.Fragment,
        null,
        React.createElement("style", props, css),
        reactElement,
    ) as any) as T;
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
