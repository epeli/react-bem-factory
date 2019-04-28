import React from "react";
import stylis from "stylis";
import { injectGlobal } from "./inject-css";
import { isBrowser } from "./is-browser";

declare const process: any;

type StyleRenderRecord = Record<string, true>;

/**
 * Record CSS strings that are rendered to DOM
 */
let BROWSER_RECORD: StyleRenderRecord | null = {};

const Context = React.createContext<StyleRenderRecord | null>(null);

export class SSRProvider extends React.Component {
    componentDidMount() {
        // Remove record after the fist browser render
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

const defaultCompiler = (className: string, css: string): string => {
    return stylis("." + className, css);
};

/**
 * Render given React Element in a Fragment with a style tag
 * if the given CSS chunks are not rendered before
 */
function renderWithStyleTags<T>(
    reactElement: T,
    cssChunks: {
        className: string;
        cssString: string;
    }[],
    customCompiler?: CSSCompiler,
): T {
    const cssCompiler = customCompiler || defaultCompiler;

    function render(renderRecord: StyleRenderRecord | null) {
        if (!renderRecord) {
            return reactElement;
        }

        let css = "";

        for (const chunk of cssChunks) {
            if (renderRecord[chunk.className]) {
                // Already rendered to DOM/HTML.
                continue;
            }

            renderRecord[chunk.className] = true;
            css += cssCompiler(chunk.className, chunk.cssString);
        }

        /**
         * Props for the style tag
         */
        let styleProps: any = {};

        if (process.env.NODE_ENV !== "production") {
            // For react-testing-library
            styleProps["data-testid"] = "bemed-style";
        }

        // No unrendered CSS - just return the react element
        if (!css) {
            return reactElement;
        }

        // If we have unrendered CSS render the element with a style tag
        return React.createElement(
            React.Fragment,
            null,
            React.createElement("style", styleProps, css),
            reactElement,
        ) as any;
    }

    // In browser use only a global record on the first render
    if (isBrowser()) {
        if (BROWSER_RECORD) {
            return render(BROWSER_RECORD);
        } else {
            // For subsequent render there's no need to render style tags as
            // they are injected to the HEAD
            return reactElement;
        }
    }

    // During server render get the style render record from the context so it
    // won't get mixed when multiple requests are rendered at once.
    return React.createElement(Context.Consumer, null, render) as any;
}

type Placeholders = string | number;

export function css(
    literals: TemplateStringsArray,
    ...placeholders: Placeholders[]
) {
    let cssString = "";

    for (let i = 0; i < placeholders.length; i++) {
        cssString += literals[i];
        cssString += placeholders[i];
    }

    cssString += literals[literals.length - 1];

    return {
        cssString,

        inject(className: string, compiler: CSSCompiler = defaultCompiler) {
            injectGlobal(className, compiler(className, cssString));
        },

        renderWithStyleTags,
    };
}

export type BEMCSS = ReturnType<typeof css>;
