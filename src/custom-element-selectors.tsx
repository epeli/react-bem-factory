const ContextTypes = {
    POST_PROCESS: -2 as const /* post-process context */,
    PREPARATION: -1 as const /* preparation context */,
    NEW_LINE: 0 as const /* newline context */,
    PROPERTY: 1 as const /* property context */,
    SELECTOR_BLOCK: 2 as const /* selector block context */,
    AT_RULE: 3 as const /* @at-rule block context */,
};

/** get union of object value types */
type ObjectValueTypes<T> = T[keyof T];

export function createSelectorsPlugin() {
    return (
        context: ObjectValueTypes<typeof ContextTypes>,
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
                /(\.[a-zA-Z0-9]+)(.*?):--([a-zA-Z0-9]+)/g,
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
