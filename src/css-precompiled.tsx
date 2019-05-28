import { createCSSTag } from "./css-core";

export { SSRProvider, createClassName } from "./css-core";

/**
 * Make sure animation names does not contain invalid characters from selectors
 */
function cleanupAnimationName(name: string) {
    return name.replace(/[^a-zA-Z]+/g, "-");
}

/**
 * Simple compiler that adds the selector to CSS compiled by Stylis
 */
export function replaceCompiler(selector: string, cssString: string) {
    return cssString.replace(
        /([a-zA-Z]*)__BEMED__/g,
        (_, prefix: string | undefined) => {
            if (prefix) {
                // When placeholder is prefixed with a a-z string it is an
                // animation name
                //
                // XXX can it be something else too? Could probably make this
                // more robust with a Stylis plugin.
                return cleanupAnimationName(prefix + selector);
            }

            return selector;
        },
    );
}

export const css = createCSSTag(replaceCompiler);
