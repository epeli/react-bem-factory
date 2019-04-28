import React from "react";
import stylis from "stylis";
import { injectGlobal } from "./inject-css";
import { isBrowser } from "./is-browser";

declare const process: any;

type StyleRenderRecord = Record<string, true>;

/**
 * Record CSS strings that are rendered to DOM
 */
let BROWSER_RECORD: StyleRenderRecord = {};

const Context = React.createContext<StyleRenderRecord | null>(null);

export class SSRProvider extends React.Component {
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

let INITIAL_BROWSER_RENDER_DONE = false;

class DisappearingStyle extends React.Component<{
    children: string;
}> {
    state = { remove: false };

    componentDidMount() {
        INITIAL_BROWSER_RENDER_DONE = true;
        this.setState({ remove: true });
    }

    render() {
        if (this.state.remove) {
            return null;
        }

        /**
         * Props for the style tag
         */
        let styleProps: any = {};

        if (process.env.NODE_ENV !== "production") {
            // For react-testing-library
            styleProps["data-testid"] = "bemed-style";
        }

        return React.createElement("style", styleProps, this.props.children);
    }
}

/**
 * Render given React Element in a Fragment with a style tag
 * if the given CSS chunks are not rendered before
 */
function renderWithStyleTags<T>(
    reactElement: T,
    cssChunks: {
        className: string;
        cssString: string;
        sourceMap: string;
    }[],
    customCompiler?: CSSCompiler,
): T {
    const cssCompiler = customCompiler || defaultCompiler;

    function render(renderRecord: StyleRenderRecord) {
        let compiledChunks: { className: string; css: string }[] = [];

        for (const chunk of cssChunks) {
            if (renderRecord[chunk.className]) {
                // Already rendered to DOM/HTML.
                continue;
            }

            const compiled = cssCompiler(chunk.className, chunk.cssString);
            renderRecord[chunk.className] = true;

            if (isBrowser()) {
                injectGlobal(chunk.className, compiled, chunk.sourceMap);
            }

            compiledChunks.push({
                className: chunk.className,
                css: compiled,
            });
        }

        // No unrendered CSS - just return the react element
        if (compiledChunks.length === 0) {
            return reactElement;
        }

        if (INITIAL_BROWSER_RENDER_DONE) {
            return reactElement;
        }

        // If we have unrendered CSS render the element with a style tag
        return React.createElement(
            React.Fragment,
            null,
            compiledChunks.map(chunk =>
                React.createElement(DisappearingStyle, {
                    key: chunk.className,
                    children: chunk.css,
                }),
            ),
            reactElement,
        ) as any;
    }

    // In browser use only a global record on the first render
    if (isBrowser()) {
        return render(BROWSER_RECORD);
    }

    // During server render get the style render record from the context so it
    // won't get mixed when multiple requests are rendered at once.
    return React.createElement(Context.Consumer, null, render) as any;
}

type Placeholders = string | number;

export function css(
    style: string,
    sourceMap: string,
): {
    cssString: string;
    sourceMap: string;
    renderWithStyleTags: typeof renderWithStyleTags;
};

export function css(
    literals: TemplateStringsArray,
    ...placeholders: Placeholders[]
): {
    cssString: string;
    sourceMap: string;
    renderWithStyleTags: typeof renderWithStyleTags;
};

export function css(...args: any[]) {
    let cssString = "";
    let sourceMap = "";

    if (typeof args[0] === "string") {
        const [style, _sourceMap] = args as [string, string];
        cssString = style;
        sourceMap = _sourceMap;
    } else {
        const [literals, ...placeholders] = args as [
            TemplateStringsArray,
            Placeholders[]
        ];

        for (let i = 0; i < placeholders.length; i++) {
            cssString += literals[i];
            cssString += placeholders[i];
        }

        cssString += literals[literals.length - 1];
    }

    return {
        cssString,
        sourceMap,
        renderWithStyleTags,
    };
}

export type BEMCSS = ReturnType<typeof css>;
