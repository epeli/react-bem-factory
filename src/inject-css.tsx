import { isBrowser } from "./is-browser";
import { StyleSheet } from "@emotion/sheet";

let sheet: StyleSheet | null = null;

if (isBrowser()) {
    sheet = new StyleSheet({ key: "bemed", container: document.head });
}

export function injectGlobal(id: string, css: string, sourceMap: string) {
    if (!isBrowser()) {
        return;
    }

    if (sheet) {
        sheet.insert(css + sourceMap);
    }
}
