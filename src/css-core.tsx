import React from "react";
import { injectGlobal } from "./inject-css";
import { isBrowser } from "./is-browser";

declare const process: any;

type StyleRenderRecord = Record<string, true | number>;

/**
 * From https://github.com/emotion-js/emotion/blob/0d47e57d143f96efd2846a1cac9e8bb29c0650fb/packages/hash/src/index.js
 */
function hash(str: string) {
    // 'm' and 'r' are mixing constants generated offline.
    // They're not really 'magic', they just happen to work well.

    // const m = 0x5bd1e995;
    // const r = 24;

    // Initialize the hash

    var h = 0;

    // Mix 4 bytes at a time into the hash

    var k,
        i = 0,
        len = str.length;
    for (; len >= 4; ++i, len -= 4) {
        k =
            (str.charCodeAt(i) & 0xff) |
            ((str.charCodeAt(++i) & 0xff) << 8) |
            ((str.charCodeAt(++i) & 0xff) << 16) |
            ((str.charCodeAt(++i) & 0xff) << 24);

        k =
            /* Math.imul(k, m): */
            (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0xe995) << 16);
        k ^= /* k >>> r: */ k >>> 24;

        h =
            /* Math.imul(k, m): */
            ((k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0xe995) << 16)) ^
            /* Math.imul(h, m): */
            ((h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0xe995) << 16));
    }

    // Handle the last few bytes of the input array

    switch (len) {
        case 3:
            h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
        case 2:
            h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
        case 1:
            h ^= str.charCodeAt(i) & 0xff;
            h =
                /* Math.imul(h, m): */
                (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0xe995) << 16);
    }

    // Do a few final mixes of the hash to ensure the last few
    // bytes are well-incorporated.

    h ^= h >>> 13;
    h =
        /* Math.imul(h, m): */
        (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0xe995) << 16);

    return ((h ^ (h >>> 15)) >>> 0).toString(36);
}

/**
 * Record CSS strings that are rendered to DOM
 */
let BROWSER_RECORD: StyleRenderRecord = {};

let INITIAL_BROWSER_RENDER_DONE = false;

/**
 * Only for tests
 */
export function _resetModuleState() {
    BROWSER_RECORD = {};
    INITIAL_BROWSER_RENDER_DONE = false;
}

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

export interface CSSCompiler {
    (selector: string, css: string): string;
}

class DisappearingStyle extends React.Component<{
    children: string;
}> {
    state = { remove: false };

    componentDidMount() {
        if (isBrowser()) {
            INITIAL_BROWSER_RENDER_DONE = true;
            this.setState({ remove: true });
        }
    }

    render() {
        if (this.state.remove) {
            return null;
        }

        /**
         * Props for the style tag
         */
        const styleProps: any = {
            // Set dangerously to avoid escaping quotes
            dangerouslySetInnerHTML: {
                __html: this.props.children,
            },
        };

        if (process.env.NODE_ENV !== "production") {
            // For react-testing-library
            styleProps["data-testid"] = "bemed-style";
        }

        return React.createElement("style", styleProps);
    }
}

function createRenderer(cssCompiler: CSSCompiler) {
    /**
     * Render given React Element in a Fragment with a style tag
     * if the given CSS chunks are not rendered before
     */
    return function renderWithStyleTags<T>(
        reactElement: T,
        cssChunks: {
            className: string;
            cssString: string;
            sourceMap: string;
        }[],
    ): T {
        function render(renderRecord: StyleRenderRecord) {
            let compiledChunks: { className: string; css: string }[] = [];

            for (const chunk of cssChunks) {
                if (renderRecord[chunk.className]) {
                    // Never allow duplicate styles in prod
                    if (process.env.NODE_ENV === "production") {
                        continue;
                    }

                    // or tests
                    if (process.env.NODE_ENV === "test") {
                        continue;
                    }

                    // or during server rendering
                    if (!isBrowser()) {
                        continue;
                    }

                    // or during the initial rendering in the brower because it
                    // must match with the server-rendered content
                    if (!INITIAL_BROWSER_RENDER_DONE) {
                        continue;
                    }

                    // But allow during development in the browser to enable
                    // style hot reloading
                }

                let styleOrder = "";

                // // Just for debugging in dev
                // const num = (renderRecord.__counter || 1) as number;
                // renderRecord.__counter = num + 1;
                // styleOrder = `/* ${num} */`;

                const compiled = cssCompiler(
                    styleOrder + "." + chunk.className,
                    chunk.cssString,
                );

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
                React.createElement(DisappearingStyle, {
                    key: compiledChunks
                        .map((chunk) => chunk.className)
                        .join(","),
                    children: compiledChunks
                        .map((chunk) => chunk.css)
                        .join("\n"),
                }),
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
    };
}

type Placeholders = string | number;

export function createClassName(className: string, bemCSS: BEMCSS) {
    return {
        className,
        bemCSS,
    };
}

export function createCSSTag(providedCompiler: CSSCompiler) {
    function compilerWrap(className: string, cssString: string) {
        return css.compiler(className, cssString);
    }

    const renderWithStyleTags = createRenderer(compilerWrap);

    type ReturnValue = {
        asCSS(selector: string): string;
        asStyleTag(selector: string): (props: any) => JSX.Element;
        cssString: string;
        sourceMap: string;
        render: typeof renderWithStyleTags;
        hash: typeof hash;
    };

    function css(style: string, sourceMap: string): ReturnValue;

    function css(
        literals: TemplateStringsArray,
        ...placeholders: Placeholders[]
    ): ReturnValue;

    function css(...args: any[]) {
        let cssString = "";
        let sourceMap = "";

        if (typeof args[0] === "string") {
            const [style, _sourceMap] = args as [string, string | undefined];
            cssString = style;
            sourceMap = _sourceMap || "";
        } else {
            const [literals, ...placeholders] = args as [
                TemplateStringsArray,
                Placeholders[],
            ];

            for (let i = 0; i < placeholders.length; i++) {
                cssString += literals[i];
                cssString += placeholders[i];
            }

            cssString += literals[literals.length - 1];
        }

        function asCSS(selector: string) {
            return (
                providedCompiler(selector, cssString) +
                "\n" +
                sourceMap
            ).trim();
        }

        function asStyleTag(selector: string) {
            const cssString = asCSS(selector);

            return function ReactBemedStyleTag(props: any) {
                return React.createElement(
                    "style",
                    Object.assign({}, props, {
                        dangerouslySetInnerHTML: {
                            __html: cssString,
                        },
                    }),
                );
            };
        }

        return {
            cssString,
            hash,
            sourceMap,
            render: renderWithStyleTags,
            asCSS,
            asStyleTag,
        };
    }

    css.compiler = providedCompiler;

    return css;
}

export type BEMCSS = ReturnType<ReturnType<typeof createCSSTag>>;
