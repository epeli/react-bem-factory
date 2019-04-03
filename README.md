# 🦖 react-bemed

Like BEM in your React? Me neither.

I wholeheartedly prefer the styled components API like [Emotion][] or
[Linaria][] but sometimes one just has to move the CSS away from the
components to separate CSS files and [BEM][] might be the best way to go
about it.

[emotion]: https://emotion.sh/docs/introduction
[linaria]: https://linaria.now.sh/
[bem]: http://getbem.com/

The react-bemed library gives you a simple styled components inspired
component builder API for working with BEM classes.

```tsx
import { bemed } from "react-bemed";

// Create namespaced BEM component creator. You can also import "block"
// directly if you don't care about namepacing
const block = bemed("app");

// Create a "bemed component"
// <button class="app-button">
const Button = block("button", {
    el: "button", // defaults to div
    mods: {
        // <button class="app-button app-button--add">
        add: true,
        // <button class="app-button app-button--delete">
        delete: true,
    },
});

// <span class="app-button__icon">
const Icon = Button.element("icon", {
    el: "span",
    // Modifiers work here too
    // mods: {}
});

// And write you components in idiomatic React code without BEM classes
// mutilating their readability.
function App() {
    return (
        <div className="App">
            <Button>Normal Button</Button>
            <Button add>
                <Icon>+</Icon> Add Button
            </Button>
            <Button delete>
                <Icon>X</Icon> Delete Button
            </Button>
        </div>
    );
}
```

The resulting DOM will look like this

```html
<div class="App">
    <button class="app-button">Normal Button</button>
    <button class="app-button app-button--add">
        <span class="app-button__icon">+</span> Add Button
    </button>
    <button class="app-button app-button--delete">
        <span class="app-button__icon">X</span> Delete Button
    </button>
</div>
```

Checkout this example on CodeSandbox https://codesandbox.io/s/pyzwpv0lmm

## Why?

Wonder why this better than manually writing the above HTML?

-   Autcomplete for components and modifier props
-   The resulting JSX is not overly verbose and thus more readable
-   No need to manually concatenate class names when doing dymamic styling
    -   `<Button add={props.isAdding}>` just works
-   Typed when using TypeScript
    -   The created components respect the `el` option so `video` elements
        have their special attributes as props etc.
    -   The BEM modifiers are typed as optional boolean props

## Noteworthy features

-   [It's tiny!][tiny] 623B (min+gzip)
-   Zero deps
-   Forwards refs correctly
-   You can still pass custom class names to the bemed components `<Button className="custom">`
-   Nice names in React Devtools
    -   `<BEMBlock(app-button) add={true}>`
    -   `<BEMElement(app-button__icon)>`

[tiny]: https://bundlephobia.com/result?p=react-bemed@0.1.6
