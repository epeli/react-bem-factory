import { createClassName, css } from "react-bemed/css";
import { rem } from "polished";

export const ABSOLUTE_STRECH = createClassName(
    "absolute-strech",
    css`
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
    `,
);

export const MOBILE_BREAK_POINT = rem(740);

export const Colors = {
    black: "#0e1e24",
    fontBlack: "#5d5d5d",
    menuTitle: "#828282",
};
