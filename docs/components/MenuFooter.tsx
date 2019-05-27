import React from "react";
import { FaGithub, FaTwitter, FaNpm } from "react-icons/fa";
import { rem } from "polished";
import { FaHamburger } from "react-icons/fa";
import { bemed } from "react-bemed";
import { css } from "react-bemed/css";
import { Colors, Utils, Vars } from "./core";

const Blk = bemed({
    className: Utils.AbsoluteStretch,
    css: css`
        flex-direction: row;
        align-items: center;
        justify-content: center;
        justify-content: space-around;
        margin-left: ${rem(15)};
        margin-right: ${rem(15)};

        /* Make room for the mobile menu button */
        @media (${Vars.isMobile}) {
            margin-right: ${rem(100)};
        }

        svg {
            color: ${Colors.fontBlack};
            height: ${rem(30)};
            width: ${rem(30)};
        }
        a:hover svg {
            color: white;
        }
    `,
})("MenuFooter");

export function MenuFooter() {
    return (
        <Blk>
            <a href="https://github.com/epeli/react-bemed">
                <FaGithub />
            </a>
            <a href="https://twitter.com/esamatti">
                <FaTwitter />
            </a>
            <a href="https://www.npmjs.com/package/react-bemed">
                <FaNpm />
            </a>
        </Blk>
    );
}
