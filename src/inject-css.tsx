import { isBrowser } from "./is-browser";

const INJECTED: Record<string, true> = {};
let STYLE_EL: HTMLStyleElement | null = null;

export function injectGlobal(id: string, css: string) {
    if (!isBrowser()) {
        return;
    }

    if (INJECTED[id]) {
        return;
    }

    if (!STYLE_EL) {
        STYLE_EL = document.createElement("style");
        document.head.appendChild(STYLE_EL);
        STYLE_EL.type = "text/css";
        STYLE_EL.id = "react-bemed";
    }

    STYLE_EL.appendChild(document.createTextNode(css));
    INJECTED[id] = true;
}
