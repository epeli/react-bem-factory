import Stylis from "stylis";
import { CSSCompiler } from "./css-core";

const ContextTypes = {
    POST_PROCESS: -2 as const /* post-process context */,
    PREPARATION: -1 as const /* preparation context */,
    NEW_LINE: 0 as const /* newline context */,
    PROPERTY: 1 as const /* property context */,
    SELECTOR_BLOCK: 2 as const /* selector block context */,
    AT_RULE: 3 as const /* @at-rule block context */,
};

const DELIMETER = "/*|*/";

/** get union of object value types */
type ObjectValueTypes<T> = T[keyof T];
type StylisContext = ObjectValueTypes<typeof ContextTypes>;

export function createSelectorsPlugin() {
    return (
        context: StylisContext,
        content: string,
        selectors: string,
        parent: string,
        line: number,
        column: number,
        length: number,
    ) => {
        if (context === ContextTypes.POST_PROCESS) {
            return content.replace(
                // .Foo:--Bar
                /(\.[a-zA-Z0-9]+|__BEMED__)(.*?):--([a-zA-Z0-9]+)/g,
                (
                    full: string,
                    currentParent: string,
                    nestingSelectors: string,
                    elementSelector: string,
                ) => {
                    if (!selectors.includes(currentParent)) {
                        return full;
                    }

                    return [
                        currentParent,
                        nestingSelectors,
                        `${currentParent}__${elementSelector}`,
                    ]
                        .map(s => (s || "").trim())
                        .filter(Boolean)
                        .join(" ")
                        .trim();
                },
            );
        }
    };
}

/**
 * Borrowed from https://github.com/thysultan/stylis.js/blob/4561e9bc830fccf1cb0e9e9838488b4d1d5cebf5/plugins/rule-sheet/index.js#L29
 */
export function createInsertRule(insertRule: (rule: string) => void) {
    const needle = DELIMETER + "}";

    function toSheet(block: string) {
        if (block)
            try {
                insertRule(block + "}");
            } catch (e) {}
    }

    return function ruleSheet(
        context: StylisContext,
        content: string,
        selectors: string,
        parent: string,
        line: number,
        column: number,
        length: number,
        ns: number,
        depth: number,
        at: number,
    ) {
        switch (context) {
            // property
            case 1:
                // @import
                if (depth === 0 && content.charCodeAt(0) === 64)
                    return insertRule(content + ";"), "";
                break;
            // selector
            case 2:
                if (ns === 0 && !content.endsWith(DELIMETER)) {
                    return content + DELIMETER;
                }
                break;
            // at-rule
            case 3:
                switch (ns) {
                    // @font-face, @page
                    case 102:
                    case 112:
                        return insertRule(selectors[0] + content), "";
                    default:
                        return (
                            content +
                            (at === 0 && !content.endsWith(DELIMETER)
                                ? DELIMETER
                                : "")
                        );
                }
            case -2:
                content.split(needle).forEach(toSheet);
        }
    };
}

export function adaptStylis(stylis: typeof Stylis): CSSCompiler {
    const rules: string[] = [];

    stylis.use(createSelectorsPlugin() as any);
    stylis.use(createInsertRule(rule => {
        rules.push(rule.split(DELIMETER).join(""));
    }) as any);

    return (selector: string, css: string) => {
        rules.splice(0);
        stylis(selector, css);
        return rules.join(DELIMETER);
    };
}
