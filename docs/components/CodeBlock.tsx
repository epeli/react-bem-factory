import React from "react";
import Highlight, { defaultProps } from "prism-react-renderer";
import { bemed } from "react-bemed";
import { css } from "react-bemed/css";
import theme from "prism-react-renderer/themes/nightOwl";
import { rem } from "polished";
import { Utils, Colors } from "./core";

const PADDING = 22;

theme.plain.backgroundColor = Colors.black;

const Code = bemed({
    css: css`
        overflow-x: auto;
    `,
    elements: {
        Line: bemed({
            css: css`
                display: block;
                min-width: 100%;
            `,
            mods: {
                paddings: css`
                    padding-left: ${rem(PADDING)};
                    padding-right: ${rem(PADDING)};
                `,
                firstLine: css`
                    margin-top: ${rem(PADDING)};
                `,
                lastLine: css`
                    margin-bottom: ${rem(PADDING)};
                `,
                focusLine: css`
                    background-color: rgb(45, 45, 45);
                `,
                firstFocusLine: css`
                    margin-top: 3px;
                    padding-top: 7px;
                `,
                lastFocusLine: css`
                    margin-bottom: 3px;
                    padding-bottom: 7px;
                `,
            },
        }),

        LineBar: bemed({
            className: Utils.AbsoluteStretch,
            css: css`
                right: auto;
                width: ${rem(PADDING / 2)};
                background-color: rgb(140, 130, 128);
            `,
        }),

        LineNumber: bemed({
            as: "span",
            css: css`
                display: inline;
                margin-right: 20px;
                margin-left: 20px;
            `,
        }),
    },
})("CodeBlock");

interface Range {
    start: number;
    end: number;
}

function isInRange(line: number, ranges?: Range[]) {
    if (!ranges) {
        return false;
    }

    for (const range of ranges) {
        if (line >= range.start && line <= range.end) {
            return true;
        }
    }

    return false;
}

function isFirstInRange(line: number, ranges?: Range[]) {
    if (!ranges) {
        return false;
    }

    for (const range of ranges) {
        if (line === range.start) {
            return true;
        }
    }

    return false;
}

function isLastInRange(line: number, ranges?: Range[]) {
    if (!ranges) {
        return false;
    }

    for (const range of ranges) {
        if (line === range.end) {
            return true;
        }
    }

    return false;
}

function parseCodeFence(fence?: string): Range[] {
    if (!fence) {
        return [];
    }

    const ranges: Range[] = [];

    fence.replace(/\{([0-9]+),([0-9]+)\}/g, (_, start, end) => {
        ranges.push({
            start: Number(start),
            end: Number(end),
        });

        return "";
    });

    return ranges;
}

export function MdxCodeBlock(props: { className?: string; children: string }) {
    return (
        <CodeBlock paddings highlightRanges={parseCodeFence(props.className)}>
            {props.children}
        </CodeBlock>
    );
}

export function CodeBlock(props: {
    highlightRanges?: Range[];
    paddings?: boolean;
    children: string;
}) {
    return (
        <Highlight
            {...defaultProps}
            theme={theme}
            code={props.children.trim()}
            language="jsx"
        >
            {hl => (
                <Code className={hl.className} style={hl.style}>
                    {hl.tokens.map((line, i) => {
                        const isFocusLine = isInRange(
                            i + 1,
                            props.highlightRanges,
                        );
                        return (
                            <Code.Line
                                paddings={props.paddings}
                                {...hl.getLineProps({ line, key: i })}
                                focusLine={isFocusLine}
                                firstLine={i === 0 && props.paddings}
                                lastLine={
                                    hl.tokens.length - 1 === i && props.paddings
                                }
                                firstFocusLine={isFirstInRange(
                                    i + 1,
                                    props.highlightRanges,
                                )}
                                lastFocusLine={isLastInRange(
                                    i + 1,
                                    props.highlightRanges,
                                )}
                            >
                                {line.map((token, key) => (
                                    <span
                                        {...hl.getTokenProps({ token, key })}
                                    />
                                ))}
                                {isFocusLine && <Code.LineBar />}
                            </Code.Line>
                        );
                    })}
                </Code>
            )}
        </Highlight>
    );
}
