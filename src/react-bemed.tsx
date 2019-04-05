import { forwardRef, createElement } from "react";

type ElementNames = keyof React.ReactHTML;

function classNameToArray(className: undefined | string | string[]) {
    return Array.isArray(className) ? className : (className || "").split(" ");
}

export function createReactBEMComponent<
    Comp extends ElementNames,
    KnownMods extends Record<string, boolean | undefined>
>(
    comp: Comp,
    blockName: string,
    knownMods: KnownMods,
    extraClassNames: string[],
    modifierSeparator: string,
) {
    type ReactProps = JSX.IntrinsicElements[Comp];

    type FinalProps = typeof knownMods extends undefined
        ? ReactProps
        : ReactProps & ModProps<typeof knownMods>;

    const BEMComponent = forwardRef((props: FinalProps, ref) => {
        const className = props.className;

        let componentProps: Record<string, any> = {};
        const usedMods: string[] = [];
        const customMods: string[] = [];

        if (knownMods) {
            for (const prop in props) {
                const modType = knownMods[prop];
                if (modType) {
                    const isActive = props[prop];
                    if (isActive) {
                        if (typeof modType === "string") {
                            customMods.push(modType);
                        } else {
                            usedMods.push(prop);
                        }
                    }
                } else {
                    componentProps[prop] = props[prop];
                }
            }
        } else {
            componentProps = props;
        }

        const parentClassNames =
            typeof className === "string" ? className.split(" ") : [];

        const finalClassName = parentClassNames
            .concat(blockName)
            .concat(
                generateBEMModClassNames(
                    blockName,
                    usedMods,
                    modifierSeparator,
                ),
            )
            .concat(customMods)
            .concat(extraClassNames || [])
            .map(cn => cn.trim())
            .filter(Boolean)
            .join(" ")
            .trim();

        return createElement(
            comp,
            Object.assign({}, componentProps, {
                className: finalClassName,
                ref,
            }),
        );
    });

    return (BEMComponent as any) as ((props: FinalProps) => any);
}

/**
 * Convert dict of mods to boolean react props
 */
type ModProps<T> = { [P in keyof T]?: boolean };

function generateBEMModClassNames(name: string, mods: string[], sep: string) {
    return mods
        .map(mod => {
            return name.trim() + sep + mod.trim();
        })
        .sort();
}

interface BemedOptions {
    className?: string | string[];
    separators?: {
        namespace?: string;
        modifier?: string;
        element?: string;
    };
}

interface BEMComponentDefinition {
    el?: ElementNames;
    className?: string;
    mods?: {
        [mod: string]: true | string;
    };
}

interface BEMComponentDefinitionStrict {
    el: ElementNames;
    className?: string;
    mods?: {
        [mod: string]: true | string;
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
    return function createBEMBlock<
        Elements extends {
            [key: string]: BEMComponentDefinition;
        },
        BEMBlockDOMElement extends ElementNames = "div",
        BEMBlockMods extends
            | Record<string, true | string>
            | undefined = undefined
    >(
        blockName: string,
        blockOptions:
            | {
                  el?: BEMBlockDOMElement;
                  mods?: BEMBlockMods;
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

        const globalClassNames = classNameToArray(bemedOptions.className);

        const Block = createReactBEMComponent(
            blockOptions.el || "div",
            blockClassName,
            blockOptions.mods as BEMBlockProps,
            classNameToArray(blockOptions.className).concat(globalClassNames),
            separators.modifier,
        );

        (Block as any).displayName = `BEMBlock(${blockClassName})`;

        function createBEMElement<
            BEMElement extends ElementNames,
            BEMElementMods extends
                | Record<string, true | string>
                | undefined = undefined
        >(
            blockElementName: string,
            elementOptions:
                | {
                      el?: BEMElement;
                      mods?: BEMElementMods;
                      className?: string | string[];
                  }
                | undefined = {},
        ) {
            type BEMElementProps = ModProps<BEMElementMods>;

            const fullElementName =
                blockClassName + separators.element + blockElementName;

            const BEMElement = createReactBEMComponent(
                elementOptions.el || "div",
                fullElementName,
                elementOptions.mods as BEMElementProps,
                classNameToArray(elementOptions.className).concat(
                    globalClassNames,
                ),
                separators.modifier,
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
                });
            }
        }

        const final = Object.assign(Block, out, {
            className: blockClassName,
        });

        return final as BEMBlock<typeof Block, Elements>;
    };
}

export const block = bemed();
