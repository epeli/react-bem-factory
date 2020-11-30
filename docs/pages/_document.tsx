import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { css } from "react-bemed/css";
import { Colors } from "../components/core";

const GlobalStyles = css`
    margin: 0;
    padding: 0;
    font-family: system-ui, sans-serif;
    color: ${Colors.fontBlack};
`.asStyleTag("body, html");

const BemedStyles = css`
    display: flex;
    position: relative;
    flex-direction: column;
    box-sizing: border-box;
`.asStyleTag(".bemed");

export const TAG_LINE =
    "React Component Primitives for Humans inspired by the Block Element Modifier convention. react-bemed on npm.";

class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <meta name="Description" content={TAG_LINE} />
                    <GlobalStyles />
                    <BemedStyles />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
