import Stylis from "stylis";

import { createCSSTag } from "./css-core";

export { SSRProvider } from "./css-core";

const customStylis = new Stylis({
    prefix: process.env.NODE_ENV === "production",
});

export const css = createCSSTag(customStylis);
