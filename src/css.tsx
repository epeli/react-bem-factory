import React from "react";
import stylis from "stylis";

const IS_BROWSER = typeof document !== "undefined";
const INJECTED: Record<string, true> = {};
let STYLE_EL: HTMLStyleElement | null = null;

function injectGlobal(id: string, css: string) {
    if (!IS_BROWSER) {
        return;
    }

    if (INJECTED[id]) {
        return;
    }

    if (!STYLE_EL) {
        STYLE_EL = document.createElement("style");
        document.head.appendChild(STYLE_EL);
        STYLE_EL.type = "text/css";
        STYLE_EL.id = "react-bemed";
    }

    STYLE_EL.appendChild(document.createTextNode(css));
    INJECTED[id] = true;
}

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

                    return React.createElement(
                        React.Fragment,
                        null,
                        React.createElement(
                            "style",
                            null,
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
