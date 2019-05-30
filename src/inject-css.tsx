import { isBrowser } from "./is-browser";
import { StyleSheet } from "@emotion/sheet";

const DELIMETER = "/*|*/";

let sheet: StyleSheet | null = null;

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

const DEV_STYLE_TAGS: Record<
    string,
    { el: HTMLStyleElement; css: string } | undefined
> = {};

/**
 * In development use slower injection method that allows source maps and hot
 * reload
 */
function devInject(id: string, css: string) {
    css = css.trim();
    const existing = DEV_STYLE_TAGS[id];

    if (existing) {
        if (existing.el.innerHTML !== css) {
            console.log("react-bemed: hot update: " + id);
            existing.el.innerHTML = css;
            existing.el.dataset.ver = String(
                Number(existing.el.dataset.ver) + 1,
            );
        }
    } else {
        const style = document.createElement("style");
        style.dataset.bemed = id;
        style.dataset.ver = "1";
        style.innerHTML = css;
        document.head.appendChild(style);
        DEV_STYLE_TAGS[id] = {
            el: style,
            css,
        };
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
