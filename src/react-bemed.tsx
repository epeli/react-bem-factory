import { forwardRef, createElement } from "react";
import React from "react";
import { isBrowser } from "./is-browser";

type BEMCSS = import("./css-core").BEMCSS;

type InlineClassName = ReturnType<typeof import("./css-core").createClassName>;

type ClassNamesTypes = string | InlineClassName;

function isBemCss(ob: any): ob is BEMCSS {
    return ob && typeof ob.render === "function";
}

function asArray<T>(value: T | undefined): T extends Array<any> ? T : T[] {
    return (Array.isArray(value || []) ? value : [value]) as any;
}

type InlineCSS = BEMCSS;

// Webpack module global with .hot
declare const module: any;

type AnyReactComponent =
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<any>;

export interface BEMComponentProperties {
    blockName: string;
    parent?: BemedFC;
    bemed: true;
    className: string;
    displayName: string;
    css?: BEMCSS;
    mods?: Mods;
    asElement(
        elementName: string,
        blockName: string,
    ): (props: any) => React.ReactNode;
}

export type BemedFC = React.FC & BEMComponentProperties;

function isBemedComponent(c: any): c is BemedFC {
    return Boolean(c && c.bemed === true);
}

interface Mods {
    [key: string]:
        | true
        | string
        | string[]
        | InlineCSS
        | Record<string, true | string | string[] | InlineCSS>;
}

interface CSSWithClassName {
    className: string;
    bemCSS: BEMCSS;
}

function applyMods(opts: {
    component: BemedFC;
    providedProps: Record<string, any>;
    modifierSeparator: string;
    out?: {
        modProps: Record<string, boolean>;
        customModClassNames: string[];
        usedModClassNames: string[];
        usedMods: string[];
        usedCSS: CSSWithClassName[];
    };
}) {
    if (!opts.out) {
        opts.out = {
            modProps: {},
            customModClassNames: [],
            usedModClassNames: [],
            usedMods: [],
            usedCSS: [],
        };
    }

    let out = opts.out;

    if (opts.component.parent) {
        out = applyMods(
            Object.assign({}, opts, {
                out,
                component: opts.component.parent,
            }),
        );
    }

    if (opts.component.css) {
        out.usedCSS.push({
            className: opts.component.className,
            bemCSS: opts.component.css,
        });
    }

    const knownMods = opts.component.mods || {};

    for (const prop in opts.providedProps) {
        const modType = knownMods[prop];

        // This prop does not match with a mod. Skip it.
        if (!modType) {
            continue;
        }

        // Mark this be a mod prop
        out.modProps[prop] = true;

        // Inactive props. Eg. mymod={false} passed
        if (!opts.providedProps[prop]) {
            continue;
        }

        // Custom class name mod
        if (typeof modType === "string") {
            out.customModClassNames.push(modType);
            continue;
        }

        // A BEM mod. We need to generate BEM modifier class name from this
        out.usedMods.push(prop);

        // The generated mod class name
        const modClassName =
            opts.component.className.trim() +
            opts.modifierSeparator +
            prop.trim();

        // Class name only mod
        if (modType === true) {
            out.usedModClassNames.push(modClassName);
            continue;
        }

        if (isBemCss(modType)) {
            out.usedModClassNames.push(modClassName);
            out.usedCSS.push({
                className: modClassName,
                bemCSS: modType,
            });
            continue;
        }

        if (Array.isArray(modType)) {
            out.usedModClassNames.push(...modType);
            continue;
        }

        // At this point modType can be only an enum mod

        const knownSubMods = modType;
        const selectedEnumMod = opts.providedProps[prop];
        const enumModValue = knownSubMods[selectedEnumMod];
        const enumModClassName =
            modClassName + opts.modifierSeparator + selectedEnumMod;

        if (enumModValue === true) {
            out.usedModClassNames.push(enumModClassName);
            continue;
        }

        if (Array.isArray(enumModValue)) {
            out.usedModClassNames.push(...enumModValue);
            continue;
        }

        if (typeof enumModValue === "string") {
            out.usedModClassNames.push(enumModValue);
            continue;
        }

        if (isBemCss(enumModValue)) {
            out.usedModClassNames.push(enumModClassName);
            out.usedCSS.push({
                className: enumModClassName,
                bemCSS: enumModValue,
            });
            continue;
        }
    }

    return out;
}

/**
 * Add BEM class names to any given React Component that takes a className prop
 */
function createReactBEMComponent<
    Comp extends AnyReactComponent,
    KnownMods extends
        | undefined
        | Record<
              string,
              | true
              | string
              | string[]
              | InlineCSS
              | Record<string, true | string | string[] | InlineCSS>
          >
>(opts: {
    component: Comp;
    blockClassName: string;
    knownMods: KnownMods;
    staticClassNames: ClassNamesTypes[];
    globalStaticClassNames: ClassNamesTypes[];
    defaultProps: Record<string, any>;
    modifierSeparator: string;
    css?: BEMCSS;
}) {
    type ReactProps = React.ComponentProps<Comp>;

    type FinalProps = typeof opts.knownMods extends undefined
        ? ReactProps
        : ReactProps & ModProps<KnownMods>;

    const BEMComponent = forwardRef((props: FinalProps, ref) => {
        const {
            usedCSS,
            usedModClassNames,
            customModClassNames,
            modProps,
        } = applyMods({
            component: BEMComponent as any,
            providedProps: props,
            modifierSeparator: opts.modifierSeparator,
        });

        /**
         * Class names passed during rendering in JSX
         */
        const runtimeClassNames = (props.className || "").split(" ");

        /**
         * Final class name to be passed to DOM
         */
        const finalClassName = ([opts.blockClassName] as ClassNamesTypes[])
            .concat(usedModClassNames.sort())
            .concat(customModClassNames)
            .concat(opts.staticClassNames)
            .concat(opts.globalStaticClassNames)
            .concat(runtimeClassNames)
            .map((className) => {
                if (typeof className === "string") {
                    return className;
                }

                if (!className) {
                    return "";
                }

                usedCSS.unshift(className);

                return className.className;
            })
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

        // Remove those props that where used for BEM mods
        const componentProps: Record<string, any> = {};
        for (const prop in props) {
            if (!modProps[prop]) {
                componentProps[prop] = props[prop];
            }
        }

        const reactElement = createElement(
            opts.component,
            Object.assign({}, opts.defaultProps, componentProps, {
                className: finalClassName,
                ref,
            }),
        );

        if (usedCSS.length > 0) {
            // This is bit weird but we do it like this because this way the
            // css-in-js does not get imported unless it is actually used
            return usedCSS[0].bemCSS.render(
                reactElement,
                usedCSS.map((css) => ({
                    className: css.className,
                    cssString: css.bemCSS.cssString,
                    sourceMap: css.bemCSS.sourceMap,
                })),
            );
        }

        return reactElement;
    });

    return (BEMComponent as any) as (props: FinalProps) => any;
}

type ModPrimitives = string | string[] | true | InlineCSS;

type AllModTypeds = ModPrimitives | Record<string, ModPrimitives>;

type ModProps<T extends undefined | Record<string, AllModTypeds>> = {
    [P in keyof T]?: T[P] extends boolean
        ? boolean
        : T[P] extends string
        ? boolean
        : T[P] extends string[]
        ? boolean
        : T[P] extends InlineCSS
        ? boolean
        : T[P] extends undefined
        ? never
        : keyof T[P];
};

export interface BemedOptions {
    className?: ClassNamesTypes | ClassNamesTypes[];
    prefix?: string;
    separators?: {
        modifier?: string;
        element?: string;
    };
}

/**
 * Create BEMBlock component type
 */
type BEMBlock<Block, Elements extends { [key: string]: ElementBlock }> = Block &
    BEMComponentProperties &
    Elements;

interface ElementBlock {
    (props: any): React.ReactNode;
    asElement(
        elementName: string,
        blockName: string,
    ): (props: any) => React.ReactNode;
}

export function createBemed(bemedOptions: BemedOptions | undefined = {}) {
    const usedBlockNames: Record<string, true | undefined> = {};

    /**
     * Define BEM Block and Elements. The bemed() function
     */
    function defineBEMBlock<
        Elements extends {
            [key: string]: ElementBlock;
        },
        BEMBlockDOMElement extends AnyReactComponent = "div",
        DefaultProps extends React.ComponentProps<BEMBlockDOMElement> = any,
        BEMBlockMods extends
            | Record<
                  string,
                  | true
                  | string
                  | string[]
                  | InlineCSS
                  | Record<string, true | string | string[] | InlineCSS>
              >
            | undefined = undefined
    >(
        blockOptions:
            | {
                  name?: string;
                  as?: BEMBlockDOMElement;
                  defaultProps?: DefaultProps;
                  mods?: BEMBlockMods;
                  css?: BEMCSS;
                  className?: ClassNamesTypes | ClassNamesTypes[];
                  elements?: Elements;
              }
            | undefined = {},
    ) {
        // if (!blockName) {
        //     throw new Error(
        //         "You must pass class name to bemed() or use the babel plugin to automatically generate one",
        //     );
        // }
        const separators = Object.assign(
            {
                modifier: "--",
                element: "__",
            },
            bemedOptions ? bemedOptions.separators : {},
        );

        const prefix =
            typeof bemedOptions.prefix === "string" ? bemedOptions.prefix : "";

        const blockName = blockOptions.name
            ? prefix + blockOptions.name
            : undefined;

        // Ensure the type is BEMBlockDOMElement and not union with "div"
        const comp: BEMBlockDOMElement = (blockOptions.as || "div") as any;

        function init(name: string | undefined) {
            const bemProperties: BEMComponentProperties = {
                bemed: true,
                blockName: name ?? "invalid",
                displayName: `BEM(${name ?? "invalid"})`,
                className: "",
                css: blockOptions.css,
                mods: blockOptions.mods,
                asElement(elementName, parentBlockName) {
                    const fullElementName =
                        parentBlockName + separators.element + elementName;
                    return init(fullElementName);
                },
            };

            if (!name) {
                const Null = () => {
                    throw new Error(
                        "This component has no name. Pass in name or use it as an element",
                    );
                };
                Object.assign(Null, bemProperties);
                return (Null as any) as BEMBlock<typeof Block, Elements>;
            }

            const Block = createReactBEMComponent({
                component: comp,
                blockClassName: name,
                knownMods: blockOptions.mods,
                staticClassNames: asArray(blockOptions.className),
                globalStaticClassNames: asArray(bemedOptions.className),
                modifierSeparator: separators.modifier,
                defaultProps: blockOptions.defaultProps || {},
                css: blockOptions.css,
            });

            if (isBemedComponent(comp)) {
                bemProperties.parent = comp;
            }

            const out: any = {};

            if (blockOptions.elements) {
                for (const key in blockOptions.elements) {
                    const def = blockOptions.elements[key];
                    out[key] = def.asElement(key, name);
                }
            }

            const final = Object.assign(Block, bemProperties, out, {
                className: name,
            });

            return final as BEMBlock<typeof Block, Elements>;
        }

        return init(blockName);
    }

    return defineBEMBlock;
}

export const bemed = createBemed({
    className: "bemed",
});
