# 🦖 BEMed Components

Like BEM in your React?

This module gives you a simple declarative API for working with BEM style
classes in React and an unique CSS-in-JS API which uses the BEM class names
in the generated CSS. No cryptic `css-16my406` class names here!

```tsx
import { bemed } from "react-bemed";

const defineBlock = bemed("app");

// Define a "BEMed Block Component" with an additional "Icon" element component
const Button = defineBlock("Button", {
    el: "button",
    mods: {
        add: true,
        delete: true,
    },
    elements: {
        Icon: {
            el: "span",
            mods: {
                danger: true,
            },
        },
    },
});

// Usage of BEMed Components is idiomatic React
// without BEM classes mutilating the readability
function App() {
    return (
        <div>
            <Button>Normal Button</Button>
            <Button add>
                <Button.Icon>+</Button.Icon>
                Add Button
            </Button>
            <Button delete>
                <Button.Icon danger>X</Button.Icon>
                Delete Button
            </Button>
        </div>
    );
}
```

The resulting DOM will have all the BEM class name jazz generated for you 🎷

```html
<div>
    <button class="app-Button">Normal Button</button>
    <button class="app-Button app-Button--add">
        <span class="app-Button__Icon">+</span>
        Add Button
    </button>
    <button class="app-Button app-Button--delete">
        <span class="app-Button__Icon app-Button__Icon--danger">X</span>
        Delete Button
    </button>
</div>
```

You are now free to enhance it with your lovely BEM CSS ❤️

Checkout this example on CodeSandbox https://codesandbox.io/s/k393yrj6p5

## CSS-in-JS

If you want co-locate your CSS code with your React component code you can
import the `css` helper from `react-bemed/css` and write the above component
definition like this:

```ts
import { css } from "react-bemed/css"

const Button = defineBlock("Button", {
    el: "button",
    mods: {
        add: css`
            color: green;
        `
        delete: css`
            color: red;
        `
    },
    elements: {
        Icon: {
            el: "span",
            mods: {
                danger: css`
                    background-color: red;
                `
            },
        },
    },
});
```

and the generated DOM will look excatly same as in the vanilla CSS version!

The CSS is passed through [Stylis][] so media queries, animations and
autoprefixing are supported out of the box. The experience should be pretty
similiar to styled-components and Emotion as they use Stylis too.

For better developer experience in VSCode you should install the
[vscode-styled-components][] extension to get syntax highlighting and
auto-completion.

Here's simple CodesandBox app using the CSS-in-JS API you can playaround with: https://codesandbox.io/s/4w74x13z04

[stylis]: https://stylis.js.org/
[vscode-styled-components]: https://marketplace.visualstudio.com/items?itemName=mf.vscode-styled-components

## 📦 Install

    npm install react-bemed

## 🤔 Why?

Wonder why this better than manually writing the above HTML?

-   **Encapsulation!** Usage of BEM is an implementation detail of a
    component and it should not leak to consumers
    -   Users should be able just use them like any other React components
-   Easy reuseability – no need to keep typing the class names all the time
-   Composability – BEMed Components compose cleanly into bigger React Components
-   Editor autocomplete for components and modifier props
    -   vs. typing the class name strings
-   No need to manually concatenate class name strings when doing dymamic styling
    -   `<Button add={props.isAdding}>` just works
-   CSS-in-JS awesome! (but optional)
    -   That's why it has custom entry point so it won't get included into your
        bundle if you don't use it.

## 🧐 Noteworthy features

-   You can mix CSS-in-JS and normal CSS
    -   For example you could write the structural CSS with the CSS-in-JS API
        but apply theming via normal CSS
    -   The generated class names are a public API and not some compiler output
-   The components are lightweight
    -   Just plain function components with class names
    -   No context reading with every component
    -   Dynamic styling is made only by toggling class names
        -   More advanced dynamic styles must be made using the `style` prop
        -   It's not as flexible as styled-components but it's a lot simpler and probably faster <sup>(not benchmarked yet)</sup>
-   Typed when using TypeScript
    -   The created components respect the `el` option so `video` elements
        have their special attributes as props etc.
    -   The BEM modifiers are typed as optional boolean props
-   Forwards refs correctly
-   You can still pass custom class names to the BEMed Components `<Button className="custom">`
-   Nice names in React Devtools
    -   `<BEMBlock(app-Button) add={true}>`
    -   `<BEMElement(app-Button__Icon)>`

[tiny]: https://bundlephobia.com/result?p=react-bemed@0.3.3

## Server-rendering with CSS-in-JS

It's almost zero config. You just need to wrap your app with the `SSRProvider`

```ts
import { SSRProvider } from "react-bemed/css";

export default () => (
    <SSRProvider>
        <App />
    </SSRProvider>
);
```

Server rendering automatically renders only the critical CSS incrementally
within the components as they are being used providing very good first
meaningful paint experience.

## 🧟 Usage with Bootstrap

This module can also work with basically any CSS framework when using custom
static class names. Here's an example with Bootstrap:

```tsx
const createBSBlock = bemed("bs");

const Button = createBSBlock("Button", {
    el: "button",
    className: "btn",
    mods: {
        primary: "btn-primary",
        danger: "btn-danger",
    },
});

export function BootstrapExample() {
    return (
        <>
            <Button primary>Primary</Button>
            <Button danger>Danger</Button>
        </>
    );
}
```

outputs

```html
<button class="bs-Button btn btn-primary">Primary</button>
<button class="bs-Button btn btn-danger">Danger</button>
```

## 🚶 API Walkthrough

This example uses every exposed API.

```tsx
// You can also import "block" directly if you don't care about namespaces
import { bemed } from "react-bemed";

// The first argument will be used as prefix to all generated BEM class names
// from this BEM component creator. A dash will be appended to it.
const defineBlock = bemed("app", {
    // Add a static class names for all BEM Block and Element components created
    // by this block creator. The prefix is not be applied to these.
    className: "flex-box border-box",

    // Customize separators in the generated class names
    // The defaults are shown.
    separators: {
        namespace: "-",
        modifier: "--",
        element: "__",
    },

    // Pass in custom CSS compiler when using the CSS-in-JS API. You can for
    // example pass in custom Stylis instance with autoprefixing disabled
    cssCompiler: new Stylis({
        prefix: false,
    }),
});

// The string "Button" is the BEM block name
const Button = defineBlock("Button", {
    // All options are optional

    // What DOM element should the component render to.
    // If omitted it defaults to "div"
    el: "button",

    // Custom static class name for this component.
    // The prefix is not applied to this.
    className: "button-reset",

    // Modifier definitions
    mods: {
        // When the value is true a BEM modifier class name is generated based
        // on the block name. Ex. app-Button--add
        add: true,

        // But if the value is a string it will be used
        // directly as is when the modifier prop is true
        primary: "is-primary",
    },

    elements: {
        // The object key will be the component and BEM element name
        Icon: {
            // The element options are the same as with the block
            el: "span",
            className: "icon-position-top-left",
            mods: {
                danger: true,
                secondary: "is-secondary",
            },
        },
    },
});
```

## Babel Plugin?

It's not needed and there is no such thing yet but I'm planning to create one
that optimizes the production bundles and developer experience.

-   Precompile the CSS with Stylis and remove Stylis from the bundle
    -   Stylis is pretty small (5kb) but there's a small startup penalty when the styles are injected
-   Add CSS source maps pointing to the JavaScript source
-   Extract separate CSS bundle like Linaria does
    -   Not 100% sure this is the best idea as it does not work well code splitting frameworks like Gatsby or Nextjs

## Prior Art

There's already a [`bemed-components`][bc] module on npm but it's deprecated
in favor of something completely different.

[bc]: https://www.npmjs.com/package/bemed-components
