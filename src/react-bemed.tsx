import { forwardRef, createElement } from "react";
import React from "react";

type BEMCSS = import("./css-core").BEMCSS;

type AnyReactComponent =
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<any>;

function classNameToArray(className: undefined | string | string[]) {
    return Array.isArray(className) ? className : (className || "").split(" ");
}

/**
 * Add BEM class names to any given React Component that takes a className prop
 */
function createReactBEMComponent<
    Comp extends AnyReactComponent,
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
    type ReactProps = React.ComponentProps<Comp>;

    type FinalProps = typeof opts.knownMods extends undefined
        ? ReactProps
        : ReactProps & ModProps<KnownMods>;

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

type MethodObject = { [key: string]: (...args: any[]) => any };

/** flatten functions in an object to their return values */
type FlattenToReturnTypes<T extends MethodObject> = {
    [K in keyof T]: ReturnType<T[K]>
};

export interface BemedOptions {
    className?: string | string[];
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
            | Record<string, true | string | BEMCSS>
            | undefined = undefined
    >(
        blockOptions:
            | {
                  as?: BEMBlockDOMElement;
                  mods?: BEMBlockMods;
                  css?: BEMCSS;
                  className?: string | string[];
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

            const globalStaticClassNames = classNameToArray(
                bemedOptions.className,
            );

            // Ensure the type is BEMBlockDOMElement and not union with "div"
            const comp: BEMBlockDOMElement = (blockOptions.as || "div") as any;

            const Block = createReactBEMComponent({
                component: comp,
                blockClassName,
                knownMods: blockOptions.mods as BEMBlockProps,
                staticClassNames: classNameToArray(blockOptions.className),
                globalStaticClassNames,
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
