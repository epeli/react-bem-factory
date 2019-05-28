import Link from "next/link";
import { css } from "react-bemed/css";
import { bemed } from "react-bemed";
import { rem } from "polished";
import { Colors } from "./core";
import React from "react";
import { useRouter } from "../pages/_app";

const Blk = bemed({
    css: css`
        padding-left: ${rem(30)};
        padding-right: ${rem(30)};
    `,
    elements: {
        Title: bemed({
            as: "h1",
            css: css`
                /* text-align: center; */
                a {
                    color: ${Colors.menuTitle};
                    text-decoration: none;
                }
            `,
        }),
        List: bemed({
            css: css`
                margin: 0px;
                padding: 0px;
            `,
        }),
        Item: bemed({
            css: css`
                margin-top: ${rem(10)};
                margin-bottom: ${rem(10)};
            `,
            mods: {
                isActive: css`
                    a {
                        font-weight: bold;
                    }
                `,
            },
        }),
        Link: bemed({
            as: "a",
            css: css`
                color: white;
                text-decoration: none;
            `,
        }),
        SubLink: bemed({
            as: "a",
            css: css`
                color: silver;
                text-decoration: none;
                padding-left: ${rem(10)};
            `,
        }),
    },
})("Menu");

function removeTrailinSlash(path: string) {
    return path.replace(/\/$/, "");
}

function useIsActive(path: string, sub?: boolean) {
    const router = useRouter();

    const [urlPath, hash] = router.asPath.split("#");

    const pathMatches =
        removeTrailinSlash(urlPath) === removeTrailinSlash(path);

    return pathMatches;
}

function Item(props: { sub?: boolean; href: string; title: string }) {
    const isActive = useIsActive(props.href, props.sub);
    const ItemLink = props.sub ? Blk.SubLink : Blk.Link;

    return (
        <Blk.Item isActive={isActive}>
            <Link href={props.href} passHref>
                <ItemLink>{props.title}</ItemLink>
            </Link>
        </Blk.Item>
    );
}

function GrouppedItems(props: {
    title: string;
    href: string;
    children: React.ReactNode;
}) {
    const isActive = useIsActive(props.href);
    const subitems = isActive ? props.children : null;

    return (
        <>
            <Item title={props.title} href={props.href} />
            {subitems}
        </>
    );
}

export function Menu() {
    const router = useRouter();

    return (
        <Blk>
            <Blk.Title>
                <Link href="/" passHref>
                    <a>BEMed Components</a>
                </Link>
            </Blk.Title>
            <Blk.List>
                <GrouppedItems title="Tutorial" href="/tutorial">
                    <Item sub title="Install" href="/tutorial#install" />
                    <Item sub title="Basics" href="/tutorial#basics" />
                    <Item
                        sub
                        title="Target DOM Elements"
                        href="/tutorial#target-dom-elements"
                    />
                    <Item
                        sub
                        title="Custom Class Names"
                        href="/tutorial#custom-class-names"
                    />
                    <Item
                        sub
                        title="Default Props"
                        href="/tutorial#default-props"
                    />
                    <Item sub title="Modifiers" href="/tutorial#modifiers" />
                    <Item sub title="Elements" href="/tutorial#elements" />
                    <Item
                        sub
                        title="Custom Target Components"
                        href="/tutorial#custom-target-components"
                    />
                    <Item
                        sub
                        title="Scoped CSS Selectors"
                        href="/tutorial#scoped-css-selectors"
                    />
                    <Item sub title="TypeScript" href="/tutorial#typescript" />
                </GrouppedItems>

                <Item title="Modifier Types" href="/mods" />
                <Item title="Server-Side Rendering" href="/ssr" />

                <GrouppedItems title="Babel Plugin" href="/babel">
                    <Item sub title="Source Maps" href="/babel#source-maps" />
                    <Item
                        sub
                        title="CSS Precompiling"
                        href="/babel#css-precompiling"
                    />
                </GrouppedItems>

                <Item title="Examples" href="/examples" />
                <Item title="FAQ" href="/faq" />
            </Blk.List>
        </Blk>
    );
}
