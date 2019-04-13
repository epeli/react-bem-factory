import { forwardRef, createElement } from "react";
import React from "react";
import { CSSCompiler } from "./css";

type BEMCSS = import("./css").BEMCSS;

type ElementNames = keyof React.ReactHTML;

function classNameToArray(className: undefined | string | string[]) {
    return Array.isArray(className) ? className : (className || "").split(" ");
}

/**
 * Add BEM class names to any given React Component that takes a className prop
 *
 * @param comp Any React Component that takes className
 * @param blockClassName The block or element name string
 * @param knownMods Object of known modifiers
 * @param staticClassNames Extra static class names given in the BEM component definition
 * @param globalStaticClassNames Extra static class names given by the bemed() factory
 * @param modifierSeparator Extra static class names
 */
function createReactBEMComponent<
    Comp extends ElementNames,
    KnownMods extends Record<string, boolean | undefined>
>(
    comp: Comp,
    blockClassName: string,
    knownMods: KnownMods,
    staticClassNames: string[],
    globalStaticClassNames: string[],
    modifierSeparator: string,
    css?: BEMCSS,
    cssCompiler?: CSSCompiler,
) {
    type ReactProps = JSX.IntrinsicElements[Comp];

    type FinalProps = typeof knownMods extends undefined
        ? ReactProps
        : ReactProps & ModProps<typeof knownMods>;

    const BEMComponent = forwardRef((props: FinalProps, ref) => {
        let componentProps: Record<string, any> = {};

        /**
         * Class names passed during rendering in JSX
         */
        const runtimeClassNames = classNameToArray(props.className);

        /** Array of used BEM mods */
        const usedMods: string[] = [];

        const usedCSS: {
            className: string;
            css: BEMCSS;
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

        if (knownMods) {
            for (const prop in props) {
                const modType = knownMods[prop];
                if (modType) {
                    const isActive = props[prop];
                    if (isActive) {
                        if (typeof modType === "string") {
                            customModClassNames.push(modType);
                        } else {
                            usedMods.push(prop);

                            const modClassName =
                                blockClassName.trim() +
                                modifierSeparator +
                                prop.trim();

                            usedModClassNames.push(modClassName);

                            if (modType !== true) {
                                const cssMod = (modType as any) as BEMCSS;
                                usedCSS.push({
                                    className: modClassName,
                                    css: cssMod,
                                });
                            }
                        }
                    }
                } else {
                    componentProps[prop] = props[prop];
                }
            }
        } else {
            componentProps = props;
        }

        /**
         * Final class name to be passed to DOM
         */
        const finalClassName = [blockClassName]
            .concat(usedModClassNames.sort())
            .concat(customModClassNames)
            .concat(staticClassNames)
            .concat(globalStaticClassNames)
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
            comp,
            Object.assign({}, componentProps, {
                className: finalClassName,
                ref,
            }),
        );

        if (css) {
            usedCSS.push({
                className: blockClassName,
                css: css,
            });
        }

        if (usedCSS.length > 0) {
            return usedCSS[0].css.render(
                reactElement,
                usedCSS.map(css => ({
                    className: css.className,
                    cssString: css.css.cssString,
                })),
                cssCompiler,
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
    cssCompiler?: CSSCompiler;
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

        if (blockOptions.css) {
            blockOptions.css.inject(blockClassName, bemedOptions.cssCompiler);
        }

        if (blockOptions.mods) {
            for (const key in blockOptions.mods) {
                const mod = blockOptions.mods[key] as any;
                if (mod.inject) {
                    mod.inject(
                        blockClassName + separators.modifier + key,
                        bemedOptions.cssCompiler,
                    );
                }
            }
        }

        const Block = createReactBEMComponent(
            blockOptions.el || "div",
            blockClassName,
            blockOptions.mods as BEMBlockProps,
            classNameToArray(blockOptions.className),
            globalStaticClassNames,
            separators.modifier,
            blockOptions.css,
            bemedOptions.cssCompiler,
        );

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

            if (elementOptions.css) {
                elementOptions.css.inject(
                    fullElementName,
                    bemedOptions.cssCompiler,
                );
            }

            if (elementOptions.mods) {
                for (const key in elementOptions.mods) {
                    const mod = elementOptions.mods[key] as any;
                    if (mod.inject) {
                        mod.inject(
                            fullElementName + separators.modifier + key,
                            bemedOptions.cssCompiler,
                        );
                    }
                }
            }

            const BEMElement = createReactBEMComponent(
                elementOptions.el || "div",
                fullElementName,
                elementOptions.mods as BEMElementProps,
                classNameToArray(elementOptions.className),
                globalStaticClassNames,
                separators.modifier,
                elementOptions.css,
                bemedOptions.cssCompiler,
            );

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
