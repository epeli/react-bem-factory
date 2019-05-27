import React from "react";
import { rem } from "polished";
import { FaHamburger, FaReact } from "react-icons/fa";
import { MdClose } from "react-icons/md";

import { bemed } from "react-bemed";
import { css } from "react-bemed/css";
import { Utils, Vars, Colors } from "../components/core";
import { CodeBlock } from "../components/CodeBlock";
import Link from "next/link";

const BodyStyles = css`
    background-color: ${Colors.black};
`.asStyleTag("body");

const Blk = bemed({
    className: Utils.AbsoluteStretch,
    css: css`
        align-items: center;
        @media (${Vars.isDesktop}) {
            justify-content: center;
            /* margin-top: ${rem(50)}; */
        }
    `,
    elements: {
        Header: bemed({
            as: "h1",
            css: css`
                height: ${50};
                background-color: ${Colors.black};
                color: ${Colors.menuTitle};
            `,
        }),
        CodeTitle: bemed({
            as: "h2",
            css: css`
                margin-top: ${rem(40)};
                margin-bottom: ${rem(5)};
                background-color: ${Colors.black};
                color: ${Colors.menuTitle};
                font-family: monospace;
            `,
        }),
        CodeTitle2: bemed({
            as: "span",
            css: css`
                color: white;
                font-size: 10pt;
                font-family: system-ui, sans-serif;
                font-style: italic;
            `,
        }),
        TagLine: bemed({
            css: css`
                color: white;
            `,
        }),
        Content: bemed({
            css: css`
                /* border: 1px solid hotpink; */
            `,
        }),
        Pre: bemed({
            as: "pre",
            css: css`
                margin: 0;
                margin-top: ${rem(10)};
            `,
        }),
        Colum1: bemed({
            css: css`
                @media (${Vars.isDesktop}) {
                    margin-right: ${rem(40)};
                }
            `,
        }),
        Colum2: bemed({
            css: css`
                /* border: 1px solid hotpink; */
                @media (${Vars.isDesktop}) {
                    justify-content: center;
                }
            `,
        }),
        CodeWrap: bemed({
            css: css`
                @media (${Vars.isDesktop}) {
                    flex-direction: row;
                }
            `,
        }),
        LinkWrap: bemed({
            css: css`
                margin-top: ${rem(50)};
                margin-bottom: ${rem(50)};
                padding: ${rem(40)};
                align-items: center;
            `,
        }),
    },
})("Landing");

const code1 = `
const Link = bemed({
    as: "a",
    css: css\`
        background-color: hotpink;
        ...
    \`,
    mods: {
        awesome: css\`
            box-shadow: 0px 0px 30px 10px purple;
            ...
        \`
    },
    elements: {
        Icon: bemed({
            as: ReactSVGIcon,
            className: "react-colors",
            mods: {
                playAnimation true,
            }
        }),
    },
})("TutorialLink");
`;

const code2 = `
<Link awesome href="/tutorial">
    <Link.Icon playAnimation={clicked} />
    Get started!
</Link>
`;

const code3 = `
<a class="TutorialLink TutorialLink--awesome">
    <svg class="TutorialLink__Icon react-colors" ... />
    Get started!
</a>
`;

const TutorialLink = bemed({
    css: css`
        background-color: hotpink;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: ${rem(240)};
        padding: ${rem(10)};
        padding-right: ${rem(20)};
        color: white;
        font-size: 18pt;
        border-radius: ${rem(10)};
    `,
    mods: {
        awesome: css`
            box-shadow: 0px 0px 30px 10px purple;
        `,
    },
    elements: {
        Icon: bemed({
            as: FaReact,
            css: css`
                margin-right: ${rem(10)};
                color: ${Colors.reactBlue};
                width: ${rem(50)};
                height: ${rem(50)};
            `,
        }),
    },
})("TutorialLink");

function CodeBox(props: { title: string; subtitle: string; children: string }) {
    return (
        <>
            <Blk.CodeTitle>
                {props.title}
                <Blk.CodeTitle2>{props.subtitle}</Blk.CodeTitle2>
            </Blk.CodeTitle>
            <Blk.Pre>
                <CodeBlock>{props.children}</CodeBlock>
            </Blk.Pre>
        </>
    );
}

function Landing() {
    return (
        <Blk>
            <BodyStyles />
            <Blk.Content>
                <Blk.Header>BEMed Components</Blk.Header>
                <Blk.TagLine>React Component Primitives for Humans</Blk.TagLine>

                <Blk.CodeWrap>
                    <Blk.Colum1>
                        <CodeBox
                            title="JAVASCRIPT"
                            subtitle="Create your own legos"
                        >
                            {code1}
                        </CodeBox>
                    </Blk.Colum1>

                    <Blk.Colum2>
                        <CodeBox title="JSX" subtitle="Build awesome stuff">
                            {code2}
                        </CodeBox>
                        <CodeBox
                            title="HTML"
                            subtitle="Get human readable HTML out"
                        >
                            {code3}
                        </CodeBox>
                    </Blk.Colum2>
                </Blk.CodeWrap>

                <Blk.LinkWrap>
                    <Link passHref href="/">
                        <TutorialLink awesome>
                            <TutorialLink.Icon />
                            Get Started
                        </TutorialLink>
                    </Link>
                </Blk.LinkWrap>
            </Blk.Content>
        </Blk>
    );
}

export default Landing;
