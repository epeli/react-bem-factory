const { createWebpackConfig } = require("@epeli/webpack-config");
module.exports = createWebpackConfig({
    babelPlugins: [
        [__dirname + "/../lib/babel-plugin.js", { target: "../../src/css" }],
    ],
});
