declare const process: any;

export function isBrowser() {
    if (process.env.NODE_ENV !== "production") {
        if (process.env.TEST_ENV) {
            return process.env.TEST_ENV === "browser";
        }
    }

    return typeof document !== "undefined";
}
