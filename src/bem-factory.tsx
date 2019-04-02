import React from "react";

type ClassNamePrimitive = string | false | undefined | null;

interface ClassNamesFunction<Props> {
    (props: Props): ClassNamePrimitive | ClassNamePrimitive[];
}

interface ClassNamesDict<Props> {
    [className: string]: boolean | ((props: Props) => boolean);
}

type ElementNames = keyof React.ReactHTML;

type ClassNames<Props> =
    | ClassNamePrimitive
    | ClassNamesFunction<Props>
    | ClassNamesDict<Props>
    | Array<
        ClassNamePrimitive | ClassNamesFunction<Props> | ClassNamesDict<Props>
    >;

function isClassNamesDict<Props>(
    o: ClassNames<Props>,
): o is ClassNamesDict<Props> {
    if (!o) {
        return false;
    }
    return typeof o === "object" && o.constructor === Object;
}

function buildClassName(
    props: unknown,
    cns: ClassNames<any>[],
    _ret?: Record<string, boolean>,
) {
    if (!_ret) {
        _ret = {};
    }

    for (const cn of cns) {
        if (!cn) {
            continue;
        }

        if (typeof cn === "string" && cn.trim() !== "") {
            _ret[cn] = true;
            continue;
        }

        if (typeof cn === "function") {
            buildClassName(props, [cn(props)], _ret);
            continue;
        }

        if (Array.isArray(cn)) {
            buildClassName(props, cn, _ret);
            continue;
        }

        if (isClassNamesDict(cn)) {
            Object.keys(cn).forEach(className => {
                let cond = cn[className];

                if (typeof cond === "function") {
                    cond = cond(props);
                }

                if (cond) {
                    buildClassName(props, [className], _ret);
                }
            });
            continue;
        }
    }

    return _ret;
}

interface Options {
    requireMods: boolean;
}

export function classNamed<
    Comp extends ElementNames,
    Opt extends Options = { requireMods: true }
>(comp: Comp, options?: Opt) {
    function inner<ClassNameProps = null>(
        ...classNames: ClassNames<ClassNameProps>[]
    ) {
        type ComponentType = React.ReactHTML[Comp];
        type ReactProps = Parameters<ComponentType>[0];

        type ModsProp = Opt extends { requireMods: true }
            ? { mods: ClassNameProps }
            : { mods?: ClassNameProps };

        type FinalProps = ClassNameProps extends null
            ? ReactProps
            : ReactProps & ModsProp;

        const ClassNamed = React.forwardRef((props: FinalProps, ref) => {
            const { mods, className, ...otherProps } = props as {
                className?: string;
                mods?: Record<string, unknown>;
            };
            const parentClassNames =
                typeof className === "string" ? className.split(" ") : [];

            const finalClassName = Object.keys(
                buildClassName(mods, classNames.concat(parentClassNames)),
            )
                .sort()
                .join(" ");

            return React.createElement(comp, {
                ...otherProps,
                className: finalClassName,
                ref,
            });
        });

        ClassNamed.displayName = `ClassNamed(${comp})`;

        return (ClassNamed as any) as ((props: FinalProps) => any) & {
            displayName: string;
        };
    }

    return inner;
}

type BoolDict<T> = { [P in keyof T]?: boolean };

function generateBEMModClassNames(
    name: string,
    mods?: Record<string, boolean>,
) {
    if (!mods) {
        return [];
    }

    return Object.keys(mods).map(mod => {
        if (!mods[mod]) {
            return null;
        }

        return name + "--" + mod;
    });
}

export function createBEMNamespace(prefix?: string) {
    return function createBEMBlock<
        BEMBlock extends ElementNames,
        BEMBlockMods extends Record<string, boolean> | undefined = undefined
    >(block: { el?: BEMBlock; name: string; mods?: BEMBlockMods }) {
        type BEMBlockProps = BoolDict<BEMBlockMods>;
        const blockClassName = (prefix || "") + block.name;

        const Block = classNamed(block.el || "div", { requireMods: false })<
            BEMBlockProps
        >(blockClassName, props =>
            generateBEMModClassNames(blockClassName, props as any),
        );

        Block.displayName = `BEMBlock(${blockClassName})`;

        return Object.assign(Block, {
            className: blockClassName,
            createBEMElement<
                BEMElement extends ElementNames,
                BEMElementMods extends
                | Record<string, boolean>
                | undefined = undefined
            >(bemEl: { el?: BEMElement; name: string; mods?: BEMElementMods }) {
                type BEMElementProps = BoolDict<BEMElementMods>;

                const fullBEMName = blockClassName + "__" + bemEl.name;

                const BEMElement = classNamed(bemEl.el || "div", {
                    requireMods: false,
                })<BEMElementProps>(fullBEMName, props =>
                    generateBEMModClassNames(fullBEMName, props as any),
                );

                BEMElement.displayName = `BEMElement(${fullBEMName})`;

                return BEMElement;
            },
        });
    };
}
