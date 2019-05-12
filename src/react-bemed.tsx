import { forwardRef, createElement } from "react";
import React from "react";

type BEMCSS = import("./css-core").BEMCSS;

type ElementNames = keyof React.ReactHTML;

function classNameToArray(className: undefined | string | string[]) {
    return Array.isArray(className) ? className : (className || "").split(" ");
}

/**
 * Add BEM class names to any given React Component that takes a className prop
 */
function createReactBEMComponent<
    Comp extends ElementNames,
    KnownMods extends Record<string, boolean | undefined>
>(opts: {
    component: Comp;
    blockClassName: string;
    knownMods: KnownMods;
    staticClassNames: string[];
    globalStaticClassNames: string[];
    modifierSeparator: string;
    css?: BEMCSS;
}) {
    type ReactProps = JSX.IntrinsicElements[Comp];

    type FinalProps = typeof opts.knownMods extends undefined
        ? ReactProps
        : ReactProps & ModProps<typeof opts.knownMods>;

    const BEMComponent = forwardRef((props: FinalProps, ref) => {
        let componentProps: Record<string, any> = {};

        /**
         * Class names passed during rendering in JSX
         */
        const runtimeClassNames = classNameToArray(props.className);

        /** Array of used BEM mods */
        const usedMods: string[] = [];

        /** css-in-js mods */
        const usedCSS: {
            className: string;
            bemCSS: BEMCSS;
        }[] = [];

        const usedModClassNames: string[] = [];

        /**
         * Custom class names from string valued mod definitions
         * Ex. from
         *
         * {
         *      mods: {
         *          foo: "my-custom-foo"
         *      }
         * }
         */
        const customModClassNames: string[] = [];

        const applyMods = (prop: string) => {
            const modType = opts.knownMods[prop];

            // Not a style mod. Just pass it as normal prop forward
            if (!modType) {
                componentProps[prop] = props[prop];
                return;
            }

            // Inactive props. Eg. mymod={false} passed
            if (!props[prop]) {
                return;
            }

            // Custom class name mod
            if (typeof modType === "string") {
                customModClassNames.push(modType);
                return;
            }

            // A BEM mod. We need to generate BEM modifier class name from this
            usedMods.push(prop);

            // The generated mod class name
            const modClassName =
                opts.blockClassName.trim() +
                opts.modifierSeparator +
                prop.trim();

            usedModClassNames.push(modClassName);

            // Class name only mod
            if (modType === true) {
                return;
            }

            // At the point it must be a css-in-js mod
            const cssMod = (modType as any) as BEMCSS;
            usedCSS.push({
                className: modClassName,
                bemCSS: cssMod,
            });
        };

        if (opts.knownMods) {
            for (const prop in props) {
                applyMods(prop);
            }
        } else {
            componentProps = props;
        }

        /**
         * Final class name to be passed to DOM
         */
        const finalClassName = [opts.blockClassName]
            .concat(usedModClassNames.sort())
            .concat(customModClassNames)
            .concat(opts.staticClassNames)
            .concat(opts.globalStaticClassNames)
            .concat(runtimeClassNames)
            .reduce(
                (acc, className) => {
                    className = className.trim();

                    if (!className) {
                        return acc;
                    }

                    // Remove duplicates
                    //
                    // Use @: prefix to avoid collision with the Object
                    // prototype properties
                    if (acc.used["@:" + className]) {
                        return acc;
                    }

                    acc.used["@:" + className] = true;
                    acc.final.push(className);

                    return acc;
                },
                {
                    final: [] as string[],
                    used: {} as Record<string, true>,
                },
            )
            .final.join(" ")
            .trim();

        const reactElement = createElement(
            opts.component,
            Object.assign({}, componentProps, {
                className: finalClassName,
                ref,
            }),
        );

        // css-in-js css for the block
        if (opts.css) {
            usedCSS.unshift({
                className: opts.blockClassName,
                bemCSS: opts.css,
            });
        }

        if (usedCSS.length > 0) {
            // This is bit weird but we do it like this because this way the
            // css-in-js does not get imported unless it is actually used
            return usedCSS[0].bemCSS.render(
                reactElement,
                usedCSS.map(css => ({
                    className: css.className,
                    cssString: css.bemCSS.cssString,
                    sourceMap: css.bemCSS.sourceMap,
                })),
            );
        }

        return reactElement;
    });

    return (BEMComponent as any) as ((props: FinalProps) => any);
}

/**
 * Convert dict of mods to boolean react props
 */
type ModProps<T> = { [P in keyof T]?: boolean };

export interface BemedOptions {
    className?: string | string[];
    separators?: {
        namespace?: string;
        modifier?: string;
        element?: string;
    };
}

export interface BEMComponentDefinition {
    el?: ElementNames;
    css?: BEMCSS;
    className?: string;
    mods?: {
        [mod: string]: true | string | BEMCSS;
    };
}

interface BEMComponentDefinitionStrict {
    el: ElementNames;
    className?: string;
    mods?: {
        [mod: string]: true | string | BEMCSS;
    };
}

/**
 * Convert BEMComponentDefinition to BEMElement component type
 */
type BEMElement<Def extends BEMComponentDefinitionStrict> = ((
    props: JSX.IntrinsicElements[Def["el"]] & ModProps<Def["mods"]>,
) => any) & { className: string };

type BEMElements<T extends { [key: string]: BEMComponentDefinition }> = {
    [P in keyof T]: T[P] extends { el: ElementNames }
        ? BEMElement<T[P]>
        : BEMElement<T[P] & { el: "div" }>
};

/**
 * Create BEMBlock component type
 */
type BEMBlock<
    Block,
    Elements extends { [key: string]: BEMComponentDefinition }
> = Block & {
    className: string;
    displayName: string;
} & BEMElements<Elements>;

export function bemed(
    prefix?: string,
    bemedOptions: BemedOptions | undefined = {},
) {
    /**
     * Define BEM Block and Elements
     */
    return function defineBEMBlock<
        Elements extends {
            [key: string]: BEMComponentDefinition;
        },
        BEMBlockDOMElement extends ElementNames = "div",
        BEMBlockMods extends
            | Record<string, true | string | BEMCSS>
            | undefined = undefined
    >(
        blockName: string,
        blockOptions:
            | {
                  el?: BEMBlockDOMElement;
                  mods?: BEMBlockMods;
                  css?: BEMCSS;
                  className?: string | string[];
                  elements?: Elements;
              }
            | undefined = {},
    ) {
        const separators = Object.assign(
            {
                namespace: "-",
                modifier: "--",
                element: "__",
            },
            bemedOptions ? bemedOptions.separators : {},
        );

        type BEMBlockProps = ModProps<BEMBlockMods>;
        const blockClassName =
            (prefix ? prefix + separators.namespace : "") + blockName;

        const globalStaticClassNames = classNameToArray(bemedOptions.className);

        const Block = createReactBEMComponent({
            component: blockOptions.el || "div",
            blockClassName,
            knownMods: blockOptions.mods as BEMBlockProps,
            staticClassNames: classNameToArray(blockOptions.className),
            globalStaticClassNames,
            modifierSeparator: separators.modifier,
            css: blockOptions.css,
        });

        (Block as any).displayName = `BEMBlock(${blockClassName})`;

        function createBEMElement<
            BEMElement extends ElementNames,
            BEMElementMods extends
                | Record<string, true | string | BEMCSS>
                | undefined = undefined
        >(
            blockElementName: string,
            elementOptions:
                | {
                      el?: BEMElement;
                      mods?: BEMElementMods;
                      css?: BEMCSS;
                      className?: string | string[];
                  }
                | undefined = {},
        ) {
            type BEMElementProps = ModProps<BEMElementMods>;

            const fullElementName =
                blockClassName + separators.element + blockElementName;

            const BEMElement = createReactBEMComponent({
                component: elementOptions.el || "div",
                blockClassName: fullElementName,
                knownMods: elementOptions.mods as BEMElementProps,
                staticClassNames: classNameToArray(elementOptions.className),
                globalStaticClassNames,
                modifierSeparator: separators.modifier,
                css: elementOptions.css,
            });

            (BEMElement as any).displayName = `BEMElement(${fullElementName})`;
            (BEMElement as any).className = fullElementName;

            return BEMElement;
        }

        const out: any = {};

        if (blockOptions.elements) {
            for (const key in blockOptions.elements) {
                const def = blockOptions.elements[key];
                out[key] = createBEMElement(key, {
                    el: def.el,
                    mods: def.mods,
                    className: def.className,
                    css: def.css,
                });
            }
        }

        const final = Object.assign(Block, out, {
            className: blockClassName,
        });

        return final as BEMBlock<typeof Block, Elements>;
    };
}
