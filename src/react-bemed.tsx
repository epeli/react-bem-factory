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

function classNameToArray(
    className?: ClassNamesTypes | ClassNamesTypes[],
): string[] {
    return (Array.isArray(className) ? className : [className]).map(foo => {
        if (!foo) {
            return "";
        }

        if (typeof foo === "string") {
            return foo;
        }

        return foo.className;
    });
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
              | InlineCSS
              | Record<string, true | string | InlineCSS>
          >
>(opts: {
    component: Comp;
    blockClassName: string;
    knownMods: KnownMods;
    staticClassNames: ClassNamesTypes[];
    globalStaticClassNames: ClassNamesTypes[];
    modifierSeparator: string;
    css?: BEMCSS;
}) {
    type ReactProps = React.ComponentProps<Comp>;

    type FinalProps = typeof opts.knownMods extends undefined
        ? ReactProps
        : ReactProps & ModProps<KnownMods>;

    const knownMods = (opts.knownMods || {}) as NonNullable<KnownMods>;
    const BEMComponent = forwardRef((props: FinalProps, ref) => {
        let componentProps: Record<string, any> = {};

        /**
         * Class names passed during rendering in JSX
         */
        const runtimeClassNames = (props.className || "").split(" ");

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
            const modType = knownMods[prop];

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

            // Class name only mod
            if (modType === true) {
                usedModClassNames.push(modClassName);
                return;
            }

            if (isBemCss(modType)) {
                usedModClassNames.push(modClassName);
                usedCSS.push({
                    className: modClassName,
                    bemCSS: modType,
                });
                return;
            }

            // At this point modType can be only a submod

            const knownSubMods = modType;
            const selectedSubMod = props[prop];
            const subModValue = knownSubMods[selectedSubMod];
            const subModClassName =
                modClassName + opts.modifierSeparator + selectedSubMod;

            if (subModValue === true) {
                usedModClassNames.push(subModClassName);
                return;
            }

            if (typeof subModValue === "string") {
                usedModClassNames.push(subModValue);
                return;
            }

            if (isBemCss(subModValue)) {
                usedModClassNames.push(modClassName);
                usedCSS.push({
                    className: subModClassName,
                    bemCSS: subModValue,
                });
                return;
            }
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
        const finalClassName = ([opts.blockClassName] as ClassNamesTypes[])
            .concat(usedModClassNames.sort())
            .concat(customModClassNames)
            .concat(opts.staticClassNames)
            .concat(opts.globalStaticClassNames)
            .concat(runtimeClassNames)
            .map(className => {
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

type ModPrimitives = string | true | InlineCSS;

type AllModTypeds = ModPrimitives | Record<string, ModPrimitives>;

type ModProps<T extends undefined | Record<string, AllModTypeds>> = {
    [P in keyof T]?: T[P] extends boolean
        ? boolean
        : T[P] extends string
        ? boolean
        : T[P] extends InlineCSS
        ? boolean
        : T[P] extends undefined
        ? never
        : keyof T[P]
};


type MethodObject = { [key: string]: (...args: any[]) => any };

/** flatten functions in an object to their return values */
type FlattenToReturnTypes<T extends MethodObject> = {
    [K in keyof T]: ReturnType<T[K]>
};

export interface BemedOptions {
    className?: ClassNamesTypes | ClassNamesTypes[];
    separators?: {
        namespace?: string;
        modifier?: string;
        element?: string;
    };
}

/**
 * Create BEMBlock component type
 */
type BEMBlock<
    Block,
    Elements extends { [key: string]: (props: any) => React.ReactNode }
> = Block & {
    className: string;
    displayName: string;
} & FlattenToReturnTypes<Elements>;

/*
type BEM<
    BEMBlockDOMElement extends ElementNames,
    BEMBlockMods extends Record<string, true | string | BEMCSS> | undefined,
    Elements extends {
        [key: string]: (
            className: string,
            isElement?: boolean,
        ) => (props: any) => React.ReactNode;
    }
> = ((
    props: BEMBlockMods extends undefined
        ? JSX.IntrinsicElements[BEMBlockDOMElement]
        : JSX.IntrinsicElements[BEMBlockDOMElement] & ModProps<BEMBlockMods>,
) => any) &
    FlattenToReturnTypes<Elements>;
*/

export function createBemed(
    prefix?: string,
    bemedOptions: BemedOptions | undefined = {},
) {
    const usedBlockNames: Record<string, true | undefined> = {};
    let isHotReloading = false;

    if (module && module.hot) {
        module.hot.addStatusHandler((status: string) => {
            isHotReloading = status !== "idle";
        });
    }

    /**
     * Define BEM Block and Elements
     */
    function defineBEMBlock<
        Elements extends {
            [key: string]: (
                className: string,
                isElement?: boolean,
            ) => (props: any) => React.ReactNode;
        },
        BEMBlockDOMElement extends AnyReactComponent = "div",
        BEMBlockMods extends
            | Record<
                  string,
                  | true
                  | string
                  | InlineCSS
                  | Record<string, true | string | InlineCSS>
              >
            | undefined = undefined
    >(
        blockOptions:
            | {
                  as?: BEMBlockDOMElement;
                  mods?: BEMBlockMods;
                  css?: BEMCSS;
                  className?: ClassNamesTypes | ClassNamesTypes[];
                  elements?: Elements;
              }
            | undefined = {},
    ) {
        return (blockName: string, isElement?: boolean) => {
            const separators = Object.assign(
                {
                    namespace: "-",
                    modifier: "--",
                    element: "__",
                },
                bemedOptions ? bemedOptions.separators : {},
            );

            type BEMBlockProps = ModProps<BEMBlockMods>;

            let blockClassName = "";

            if (isElement) {
                blockClassName = blockName;
            } else {
                blockClassName =
                    (prefix ? prefix + separators.namespace : "") + blockName;
            }

            const isCollision = usedBlockNames[blockClassName];

            // We must skip the collision check when:
            //  - Executing on the server. The memory is shared between requests
            //    so multiple requests cause false positives
            //  - When hot reload is active it by definition re-executes the same code
            if (isCollision && !isHotReloading && isBrowser()) {
                throw new Error(
                    `Class name collision with "${blockClassName}". Make sure you pass unique class names to the function returned by bemed()`,
                );
            }

            usedBlockNames[blockClassName] = true;

            // Ensure the type is BEMBlockDOMElement and not union with "div"
            const comp: BEMBlockDOMElement = (blockOptions.as || "div") as any;

            const Block = createReactBEMComponent({
                component: comp,
                blockClassName,
                knownMods: blockOptions.mods,
                staticClassNames: asArray(blockOptions.className),
                globalStaticClassNames: asArray(bemedOptions.className),
                modifierSeparator: separators.modifier,
                css: blockOptions.css,
            });

            (Block as any).displayName = `BEM(${blockClassName})`;

            const out: any = {};

            if (blockOptions.elements) {
                for (const key in blockOptions.elements) {
                    const def = blockOptions.elements[key];
                    out[key] = def(
                        blockClassName + separators.element + key,
                        true,
                    );
                }
            }

            const final = Object.assign(Block, out, {
                className: blockClassName,
            });

            return final as BEMBlock<typeof Block, Elements>;
        };
    }

    return defineBEMBlock;
}

export const bemed = createBemed("", {
    className: "bemed",
});
