import { createClassName, css } from "react-bemed/css";
import { rem } from "polished";

export const Utils = {
    AbsoluteStretch: createClassName(
        "absolute-stretch",
        css`
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
        `,
    ),
};

const MOBILE_BREAK_POINT = 740;

export const Vars = {
    isMobile: `max-width: ${rem(MOBILE_BREAK_POINT)}`,
    isDesktop: `min-width: ${rem(MOBILE_BREAK_POINT)}`,
    lineHeight: 1.5,
};

export const Colors = {
    black: "#0e1e24",
    fontBlack: "#5d5d5d",
    menuTitle: "#828282",
};
