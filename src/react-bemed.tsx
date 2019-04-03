import { forwardRef, createElement } from "react";

type ElementNames = keyof React.ReactHTML;

function buildClassName(classNames: string[]) {
    const dups: Record<string, boolean> = {};

    for (const cn of classNames) {
        dups[cn] = true;
    }

    return Object.keys(dups)
        .sort()
        .join(" ")
        .trim();
}

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
    extraClassNames?: string[],
) {
    type ReactProps = JSX.IntrinsicElements[Comp];

    type FinalProps = typeof knownMods extends undefined
        ? ReactProps
        : ReactProps & BoolDict<typeof knownMods>;

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

        const finalClassName = buildClassName(
            parentClassNames
                .concat(extraClassNames || [])
                .concat(generateBEMModClassNames(blockName, usedMods))
                .concat(blockName)
                .concat(customMods),
        );

        return createElement(
            comp,
            Object.assign({}, componentProps, {
                className: finalClassName,
                ref,
            }),
        );
    });

    return (BEMComponent as any) as ((props: FinalProps) => any) & {
        displayName: string;
    };
}

type BoolDict<T> = { [P in keyof T]?: boolean };

function generateBEMModClassNames(name: string, mods: string[]) {
    return mods.map(mod => {
        return name + "--" + mod;
    });
}

interface BemedOptions {
    className?: string | string[];
}

export function bemed(
    prefix?: string,
    bemedOptions: BemedOptions | undefined = {},
) {
    return function createBEMBlock<
        BEMBlock extends ElementNames = "div",
        BEMBlockMods extends
            | Record<string, true | string>
            | undefined = undefined
    >(
        blockName: string,
        options:
            | {
                  el?: BEMBlock;
                  mods?: BEMBlockMods;
                  className?: string | string[];
              }
            | undefined = {},
    ) {
        type BEMBlockProps = BoolDict<BEMBlockMods>;
        const blockClassName = (prefix ? prefix + "-" : "") + blockName;

        const extraClassNames = classNameToArray(bemedOptions.className);

        const Block = createReactBEMComponent(
            options.el || "div",
            blockClassName,
            options.mods as BEMBlockProps,
            extraClassNames.concat(classNameToArray(options.className)),
        );

        Block.displayName = `BEMBlock(${blockClassName})`;

        return Object.assign(Block, {
            className: blockClassName,
            element<
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
                type BEMElementProps = BoolDict<BEMElementMods>;

                const fullElementName =
                    blockClassName + "__" + blockElementName;

                const BEMElement = createReactBEMComponent(
                    elementOptions.el || "div",
                    fullElementName,
                    elementOptions.mods as BEMElementProps,
                    extraClassNames.concat(
                        classNameToArray(elementOptions.className),
                    ),
                );

                BEMElement.displayName = `BEMElement(${fullElementName})`;

                return BEMElement;
            },
        });
    };
}

export const block = bemed();
