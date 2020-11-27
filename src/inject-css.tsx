import { isBrowser } from "./is-browser";
import { StyleSheet } from "@emotion/sheet";

const DELIMETER = "/*|*/";

let sheet: StyleSheet | null = null;

// Webpack module global with .hot
declare const module: any;

if (isBrowser()) {
    sheet = new StyleSheet({
        key: "bemed",
        container: document.head,
        speedy: true,
    });
}

/**
 * Use fast style injection production provided by @emotion/sheet
 *
 * Rules must be delimited with the above comment because StyleSheet insertRule
 * can insert only one rule at the time
 */
function productionInject(id: string, css: string) {
    css.split(DELIMETER).forEach((rule) => {
        if (sheet) {
            sheet.insert(rule);
        }
    });
}

function removeSourceMapLine(css: string) {
    return css
        .trim()
        .split("\n")
        .filter((line) => {
            // Starts with: /*# sourceMappingURL
            return !/^[\/\*\# ]*sourceMappingURL=/.test(line);
        })
        .join("\n");
}

/**
 * In development use slower injection method that allows source maps and hot
 * reload
 */
function devInject(id: string, css: string, sourceMap: string) {
    const cssWithMapping =
        css + "\n" + sourceMap.trim().split(DELIMETER).join("\n");

    const existing = document.querySelector<HTMLStyleElement>(
        `style[data-bemed=${id}]`,
    );

    if (existing) {
        const existingCSS = removeSourceMapLine(existing.innerHTML);
        if (existingCSS !== css) {
            console.log("[bemed live update] " + id);
            existing.innerHTML = cssWithMapping;
            existing.dataset.ver = String(Number(existing.dataset.ver) + 1);
        }
    } else {
        const style = document.createElement("style");
        style.dataset.bemed = id;
        style.dataset.ver = "1";
        style.innerHTML = css;
        document.head.appendChild(style);
    }
}

export function injectGlobal(id: string, css: string, sourceMap: string) {
    if (!isBrowser()) {
        return;
    }

    if (process.env.NODE_ENV !== "production") {
        return devInject(id, css, sourceMap);
    }

    return productionInject(id, css);
}
