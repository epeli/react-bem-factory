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
 */
function productionInject(id: string, css: string) {
    css.split(DELIMETER).forEach(rule => {
        if (sheet) {
            sheet.insert(rule);
        }
    });
}

let isHotReloading = false;

if (module && module.hot) {
    module.hot.addStatusHandler((status: string) => {
        console.log("status", status);
        isHotReloading = status !== "idle";
    });
}

/**
 * In development use slower injection method that allows source maps and hot
 * reload
 */
function devInject(id: string, css: string) {
    css = css
        .trim()
        .split(DELIMETER)
        .join("\n");

    const existing = document.querySelector<HTMLStyleElement>(
        `style[data-bemed=${id}]`,
    );

    if (existing) {
        // The css content check works only when source maps are disabled
        // because when the module updates so will the source map update too
        if (isHotReloading && existing.innerHTML.trim() !== css) {
            existing.innerHTML = css;
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
        return devInject(id, css + "\n" + sourceMap);
    }

    return productionInject(id, css);
}
