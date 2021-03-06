import React from "react";
import App, { Container } from "next/app";
import { Layout } from "../components/Layout";
import { SSRProvider } from "react-bemed/css";
import { bemed } from "react-bemed";
import { css } from "react-bemed/css";
import { MdxCodeBlock } from "../components/CodeBlock";
import { rem } from "polished";
import { Colors, Utils, Vars } from "../components/core";
import { Router } from "next/router";

const { MDXProvider } = require("@mdx-js/react");

function slugify(s: string) {
    return s
        .toLowerCase()
        .replace(/[^a-z]+/g, " ")
        .trim()
        .replace(/ +/g, "-");
}

const MdxBemed = bemed({
    elements: {
        H1: bemed({
            as: "h1",
            css: css`
                display: block;
                font-size: 34pt;
            `,
        }),
        Paragraph: bemed({
            as: "p",
            css: css`
                display: block;
                margin-top: ${rem(5)};
                margin-bottom: ${rem(5)};
                line-height: ${Vars.lineHeight};
            `,
        }),

        Li: bemed({
            css: css`
                list-style-type: circle;
                display: list-item;
                line-height: ${Vars.lineHeight};
            `,
        }),

        InlineCode: bemed({
            as: "span",
            css: css`
                display: inline;
                color: #5d5d5d;
                background-color: #f1f1f1;
                font-family: monospace;
                padding-left: 5px;
                padding-right: 5px;
                padding-top: 2px;
                padding-bottom: 2px;
                border-radius: ${rem(5)};
            `,
        }),
        HeaderContainer: bemed({
            css: css`
                flex-direction: row;
                :hover a {
                    color: ${Colors.fontBlack};
                }
            `,
        }),
        HeaderAnchor: bemed({
            as: "a",
            css: css`
                text-decoration: none;
                top: ${rem(3)};
                display: inline;
                color: #f1f1f1;
                margin-left: ${rem(10)};
            `,
        }),
    },
})("MdxBemed");

function createLinkableHeader(El: any) {
    return function Header(props: { children: string }) {
        const slug = slugify(props.children);
        return (
            <MdxBemed.HeaderContainer>
                <El id={slug}>
                    {props.children}
                    <MdxBemed.HeaderAnchor href={"#" + slug}>
                        #
                    </MdxBemed.HeaderAnchor>
                </El>
            </MdxBemed.HeaderContainer>
        );
    };
}

const MdxComponents = {
    wrapper: Layout,
    p: MdxBemed.Paragraph,
    li: MdxBemed.Li,
    code: MdxCodeBlock,
    inlineCode: MdxBemed.InlineCode,
    h1: createLinkableHeader(MdxBemed.H1),
    h2: createLinkableHeader("h2"),
};

const RouterContext = React.createContext<Router | null>(null);

export function useRouter() {
    const router = React.useContext(RouterContext);
    if (!router) {
        throw new Error("Router Context missing");
    }

    return router;
}

class Docs extends App {
    render() {
        const { Component, pageProps } = this.props;

        return (
            <Container>
                <RouterContext.Provider value={this.props.router}>
                    <SSRProvider>
                        <MDXProvider components={MdxComponents}>
                            <Component {...pageProps} />
                        </MDXProvider>
                    </SSRProvider>
                </RouterContext.Provider>
            </Container>
        );
    }
}

export default Docs;
