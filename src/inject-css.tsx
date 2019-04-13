const INJECTED: Record<string, true> = {};
let STYLE_EL: HTMLStyleElement | null = null;

declare const process: any;

export const IS_BROWSER: boolean = (() => {
    if (process.env.NODE_ENV !== "production") {
        return process.env.TEST_ENV === "browser";
    }

    return typeof document !== "undefined";
})();

export function injectGlobal(id: string, css: string) {
    if (!IS_BROWSER) {
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
