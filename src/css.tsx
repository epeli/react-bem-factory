import React from "react";
import stylis from "stylis";
import { injectGlobal } from "./inject-css";
import { isBrowser } from "./is-browser";

declare const process: any;

type StyleRenderRecord = Record<string, true>;

let BROWSER_RECORD: StyleRenderRecord | null = {};

const Context = React.createContext<StyleRenderRecord | null>(null);

export class SSRProvider extends React.Component {
    componentDidMount() {
        BROWSER_RECORD = null;
    }

    render() {
        return (
            <Context.Provider value={{}}>
                {this.props.children}
            </Context.Provider>
        );
    }
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
    const finalCompiler = compiler || defaultCompile;

    function renderStyleTags(renderRecord: StyleRenderRecord | null) {
        if (!renderRecord) {
            return reactElement;
        }

        let css = "";

        for (const chunk of cssChunks) {
            if (renderRecord[chunk.className]) {
                continue;
            }

            renderRecord[chunk.className] = true;
            css += finalCompiler(chunk.className, chunk.cssString);
        }

        let props: any = {};

        if (process.env.NODE_ENV !== "production") {
            props["data-testid"] = "bemed-style";
        }

        if (!css) {
            return reactElement;
        }

        return (React.createElement(
            React.Fragment,
            null,
            React.createElement("style", props, css),
            reactElement,
        ) as any) as T;
    }

    if (isBrowser()) {
        if (BROWSER_RECORD) {
            return renderStyleTags(BROWSER_RECORD);
        } else {
            return reactElement;
        }
    }

    return React.createElement(Context.Consumer, null, renderStyleTags) as any;
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
