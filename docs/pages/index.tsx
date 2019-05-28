import React from "react";
import Router from "next/router";
import { rem } from "polished";
import { FaReact } from "react-icons/fa";

import { bemed } from "react-bemed";
import { css } from "react-bemed/css";
import { Utils, Vars, Colors } from "../components/core";
import { CodeBlock } from "../components/CodeBlock";
import Link from "next/link";
import Head from "next/head";

const TUTORIAL_HREF = "/tutorial";

const BodyStyles = css`
    background-color: ${Colors.black};
`.asStyleTag("body");

const Blk = bemed({
    className: Utils.AbsoluteStretch,
    css: css`
        align-items: center;
        @media (${Vars.isDesktop}) and (min-height: 1000px) {
            justify-content: center;
        }
    `,
    elements: {
        Heading: bemed({
            as: "h1",
            css: css`
                height: ${50};
                background-color: ${Colors.black};
                color: ${Colors.menuTitle};
                @media (${Vars.isDesktop}) {
                    maring-top: ${rem(20)};
                    font-size: 44pt;
                }
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
                font-size: 11pt;
                font-family: system-ui, sans-serif;
                font-style: italic;
            `,
        }),
        TagLine: bemed({
            css: css`
                color: white;
                margin-left: ${rem(5)};
            `,
        }),
        Content: bemed({
            css: css`
                width: 100%;
                padding: ${rem(10)};
                @media (min-width: 450px) {
                    width: auto;
                }
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
        LinkContainer: bemed({
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
        playAnimation "icon-animation",
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
<a class="TutorialLink TutorialLink--awesome"
   href="/tutorial">
    <svg class="TutorialLink__Icon react-colors" ... />
    Get started!
</a>
`;

const TutorialLink = bemed({
    as: "a",
    css: css`
        text-decoration: none;
        background-color: hotpink;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: ${rem(240)};
        padding: ${rem(10)};
        padding-right: ${rem(20)};
        color: #9beaff;
        font-weight: bold;
        font-size: 18pt;
        border-radius: ${rem(10)};
        cursor: pointer;
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
            mods: {
                playAnimation: css`
                    @keyframes icon-scale {
                        from {
                            transform: rotate(0deg) scale(1);
                        }
                        to {
                            transform: rotate(360deg) scale(6);
                        }
                    }

                    animation: icon-scale 1s
                        cubic-bezier(0.36, 0.09, 0.91, 0.42);
                `,
            },
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

function AnimatedLink() {
    const [clicked, setClicked] = React.useState(false);

    function handleClick(e: {
        preventDefault: () => void;
        target: { href: string };
    }) {
        e.preventDefault();
        setClicked(true);
        setTimeout(() => {
            window.scrollTo(0, 0);
            Router.push(TUTORIAL_HREF);
        }, 1000);
    }

    return (
        <Link passHref href={TUTORIAL_HREF}>
            <TutorialLink awesome onClick={handleClick as any}>
                <TutorialLink.Icon playAnimation={clicked} />
                Get Started!
            </TutorialLink>
        </Link>
    );
}

function Landing() {
    return (
        <Blk>
            <Head>
                <title>BEMed Components</title>
            </Head>
            <BodyStyles />
            <Blk.Content>
                <Blk.Heading>BEMed Components</Blk.Heading>
                <Blk.TagLine>
                    React Component Primitives for Humans inspired by the Block
                    Element Modifier convention
                </Blk.TagLine>

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

                <Blk.LinkContainer>
                    <AnimatedLink />
                </Blk.LinkContainer>
            </Blk.Content>
        </Blk>
    );
}

export default Landing;
