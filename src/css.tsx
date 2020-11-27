import Stylis from "stylis";

import { createCSSTag } from "./css-core";
import { adaptStylis } from "./stylis-adapter";

export { SSRProvider, createClassName } from "./css-core";

const customStylis = new Stylis({
    prefix: process.env.NODE_ENV === "production",
});

export const css = createCSSTag(adaptStylis(customStylis));
