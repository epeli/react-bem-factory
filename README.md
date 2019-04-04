# 🦖 BEMed Components

Like BEM in your React? Me neither.

I wholeheartedly prefer the styled components API like [Emotion][] or
[Linaria][] but sometimes one just has to move the CSS away from the
components to separate CSS files and [BEM][] might be the best way to go
about it.

[emotion]: https://emotion.sh/docs/introduction
[linaria]: https://linaria.now.sh/
[bem]: http://getbem.com/

This module gives you a simple declarative API for working with BEM classes
in React.

```tsx
import { bemed } from "react-bemed";

const defineBlock = bemed("app");

// Define a "BEMed Block Component" with element components
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
                <Button.Icon>+</Button.Icon> Add Button
            </Button>
            <Button delete>
                <Button.Icon danger>X</Button.Icon> Delete Button
            </Button>
        </div>
    );
}
```

The resulting DOM will have the BEM class name jazz generated 🎷

```html
<div>
    <button class="app-Button">Normal Button</button>
    <button class="app-Button app-Button--add">
        <span class="app-Button__Icon">+</span> Add Button
    </button>
    <button class="app-Button app-Button--delete">
        <span class="app-Button__Icon app-Button__Icon--danger">X</span> Delete
        Button
    </button>
</div>
```

You now free to enhance it with your familiar BEM CSS ❤️

Checkout this example on CodeSandbox https://codesandbox.io/s/k393yrj6p5

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
-   Typed when using TypeScript
    -   The created components respect the `el` option so `video` elements
        have their special attributes as props etc.
    -   The BEM modifiers are typed as optional boolean props

## 🧐 Noteworthy features

-   [It's tiny!][tiny] 623B (min+gzip)
-   Zero deps
-   Forwards refs correctly
-   You can still pass custom class names to the BEMed Components `<Button className="custom">`
-   Nice names in React Devtools
    -   `<BEMBlock(app-Button) add={true}>`
    -   `<BEMElement(app-Button__Icon)>`

[tiny]: https://bundlephobia.com/result?p=react-bemed@0.1.6

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
    className: "flexbox border-box",

    // Customize separators in the generated class names
    // The defaults are shown.
    separators: {
        namespace: "-",
        modifier: "--",
        element: "__",
    },
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

    // The element object define the Element components
    elements: {
        // The object key will be the component and BEM element name
        Icon: {
            // The element options are the same as with the block
            el: "span",
            // Multiple class names are cool too
            className: "icon-position-top-left",
            mods: {
                danger: true,
                secondary: "is-secondary",
            },
        },
    },
});

// All options are optional
const Button = block("item-button", {
    // What element should the component render to.
    // If omitted it defaults to "div"
    el: "button",

    // Custom static class name for this component.
    // The prefix is not applied to this
    className: "button-reset",

    // Modifier definitions
    mods: {
        // When the value is true a BEM modifier class name is generated based
        // on the block name. Ex. app-item-button--add
        add: true,

        // But if the value is a string it will be used
        // directly as is when the modifier prop is true
        primary: "is-primary",
    },
});
```

## 🧟 Usage with Bootstrap

or with other non-BEM class systems

```tsx
const createBSBlock = bemed("bs", {
    className: "btn",
});

const Button = createBSBlock("Button", {
    el: "button",
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

## Prior Art

There's already a [`bemed-components`][bc] module on npm but it's deprecated
in favor of something completely different.

[bc]: https://www.npmjs.com/package/bemed-components
