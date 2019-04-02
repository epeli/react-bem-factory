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

export function classNamed<
    Comp extends ElementNames,
    KnownMods extends Record<string, boolean | undefined>
>(comp: Comp, blockName: string, knownMods: KnownMods) {
    type ComponentType = React.ReactHTML[Comp];
    type ReactProps = Parameters<ComponentType>[0];

    type FinalProps = typeof knownMods extends undefined
        ? ReactProps
        : ReactProps & BoolDict<typeof knownMods>;

    const ClassNamed = React.forwardRef((props: FinalProps, ref) => {
        const {className, ...passedProps} = props as {
            className?: string;
            mods?: Record<string, unknown>;
        };

        let componentProps: Record<string, any> = {};
        const usedMods: string[] = [];

        if (knownMods) {
            for (const prop in passedProps) {
                const isActive = knownMods[prop];
                if (isActive) {
                    usedMods.push(prop);
                } else {
                    componentProps[prop] = (passedProps as any)[prop];
                }
            }
        } else {
            componentProps = passedProps;
        }

        const parentClassNames =
            typeof className === "string" ? className.split(" ") : [];

        const finalClassName = Object.keys(
            buildClassName(
                {},
                parentClassNames
                    .concat(generateBEMModClassNames(blockName, usedMods))
                    .concat(blockName),
            ),
        )
            .sort()
            .join(" ");

        return React.createElement(comp, {
            ...componentProps,
            className: finalClassName,
            ref,
        });
    });

    ClassNamed.displayName = `ClassNamed(${comp})`;

    return (ClassNamed as any) as ((props: FinalProps) => any) & {
        displayName: string;
    };
}

type BoolDict<T> = {[P in keyof T]?: boolean};

function generateBEMModClassNames(name: string, mods: string[]) {
    return mods.map(mod => {
        return name + "--" + mod;
    });
}

export function createBEMNamespace(prefix?: string) {
    return function createBEMBlock<
        BEMBlock extends ElementNames,
        BEMBlockMods extends Record<string, boolean> | undefined = undefined
    >(block: {el?: BEMBlock; name: string; mods?: BEMBlockMods}) {
        type BEMBlockProps = BoolDict<BEMBlockMods>;
        const blockClassName = (prefix || "") + block.name;

        const Block = classNamed(
            block.el || "div",
            blockClassName,
            block.mods as BEMBlockProps,
        );

        Block.displayName = `BEMBlock(${blockClassName})`;

        return Object.assign(Block, {
            className: blockClassName,
            createBEMElement<
                BEMElement extends ElementNames,
                BEMElementMods extends
                    | Record<string, boolean>
                    | undefined = undefined
            >(bemEl: {el?: BEMElement; name: string; mods?: BEMElementMods}) {
                type BEMElementProps = BoolDict<BEMElementMods>;

                const fullBEMName = blockClassName + "__" + bemEl.name;

                const BEMElement = classNamed(
                    bemEl.el || "div",
                    fullBEMName,
                    bemEl.mods as BEMElementProps,
                );

                BEMElement.displayName = `BEMElement(${fullBEMName})`;

                return BEMElement;
            },
        });
    };
}
