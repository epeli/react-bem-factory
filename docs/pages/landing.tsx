import React from "react";
import { rem } from "polished";
import { FaHamburger } from "react-icons/fa";
import { MdClose } from "react-icons/md";

import { bemed } from "react-bemed";
import { css } from "react-bemed/css";
import { Utils, Vars, Colors } from "../components/core";
import { CodeBlock } from "../components/CodeBlock";

const Blk = bemed({
    className: Utils.AbsoluteStretch,
    css: css`
        background-color: ${Colors.black};
        /* justify-content: center; */
        align-items: center;
    `,
    elements: {
        Header: bemed({
            as: "h1",
            css: css`
                text-align: center;
                height: ${50};
                background-color: ${Colors.black};
                color: ${Colors.menuTitle};
            `,
        }),
        TagLine: bemed({
            css: css`
                color: white;
                text-align: center;
            `,
        }),
        Content: bemed({
            css: css`
                /* border: 1px solid hotpink; */
                /* width: ${rem(400)}; */
            `,
        }),
    },
})("Landing");

const code1 = `
const Link = bemed({
    as: "a",
    css: css\`
        background-color: hotpink;
    \`,
    mods: {
        awesome: css\`
            box-shadow: 0px 0px 30px 10px purple;
        \`
    },
    elements: {
        Icon: bemed({
            as: ReactSVGIcon,
            className: "cool-animation",
            mods: {
                playAnimation true,
            }
        }),
    },
})("Link");
`;

const code2 = `
<Link awesome href="/tutorial">
    <Link.Icon playAnimation={clicked} /> Get started!
</Link>
`;

const code3 = `
<a class="Link Link--awesome cool-animation">
    <svg ... /> Get started!
</Link>
`;

function Landing() {
    return (
        <Blk>
            <Blk.Content>
                <Blk.Header>BEMed Components</Blk.Header>
                <Blk.TagLine>React Component Primitives for Humans</Blk.TagLine>
                <pre>
                    <CodeBlock>{code1}</CodeBlock>
                </pre>

                <pre>
                    <CodeBlock>{code2}</CodeBlock>
                </pre>

                <pre>
                    <CodeBlock>{code3}</CodeBlock>
                </pre>
            </Blk.Content>
        </Blk>
    );
}

export default Landing;
