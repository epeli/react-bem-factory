import React from "react";
import stylis from "stylis";
import { injectGlobal, IS_BROWSER } from "./inject-css";

declare const process: any;

type StyleRenderRecord = Record<string, true>;
const Context = React.createContext<StyleRenderRecord | null>(null);

export function SSRProvider(props: { children: React.ReactNode }) {
    return <Context.Provider value={{}}>{props.children}</Context.Provider>;
}

export function css(literals: TemplateStringsArray, ...placeholders: string[]) {
    let result = "";

    for (let i = 0; i < placeholders.length; i++) {
        result += literals[i];
        result += placeholders[i];
    }

    result += literals[literals.length - 1];

    const compileBlockCSS = (className: string): string => {
        return stylis("." + className, result);
    };

    return {
        compile: compileBlockCSS,

        inject(className: string) {
            injectGlobal(className, compileBlockCSS(className));
        },

        render<T>(
            reactElement: T,
            cssThings: {
                className: string;
                compile(className: string): string;
            }[],
        ): T {
            if (IS_BROWSER) {
                return reactElement;
            }

            return React.createElement(
                Context.Consumer,
                null,
                (compilingRecord: StyleRenderRecord) => {
                    if (!compilingRecord) {
                        return reactElement;
                    }

                    let css = "";

                    for (const cssThing of cssThings) {
                        if (compilingRecord[cssThing.className]) {
                            continue;
                        }

                        compilingRecord[cssThing.className] = true;
                        css += cssThing.compile(cssThing.className);
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
        },
    };
}

export type BEMCSS = ReturnType<typeof css>;
