import { createCSSTag } from "./css-core";

function replaceCompiler(selector: string, cssString: string) {
    return cssString.replace(/__BEMED__/g, selector);
}

export const css = createCSSTag(replaceCompiler);
