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

    const compileCSS = (className: string): string => {
        return stylis("." + className, result);
    };

    return {
        inject(className: string) {
            injectGlobal(className, compileCSS(className));
        },

        render<T>(className: string, renderReactElement: () => T): T {
            if (IS_BROWSER) {
                return renderReactElement();
            }

            return React.createElement(
                Context.Consumer,
                null,
                (record: StyleRenderRecord) => {
                    if (!record) {
                        return renderReactElement();
                    }

                    if (record[className]) {
                        return renderReactElement();
                    }

                    record[className] = true;

                    let props: any = {};

                    if (process.env.NODE_ENV !== "production") {
                        props["data-testid"] = "bemed-style";
                    }

                    return React.createElement(
                        React.Fragment,
                        null,
                        React.createElement(
                            "style",
                            props,
                            compileCSS(className),
                        ),
                        renderReactElement(),
                    );
                },
            ) as any;
        },
    };
}

export type BEMCSS = ReturnType<typeof css>;
