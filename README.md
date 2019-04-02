# react-bemed

🦖 Like BEM in your React? Me neither.

I wholeheartedly prefer the styled components API like [Emotion][] or
[Linaria][] but sometimes you just have to move the CSS away from your
components to a separate and CSS files and [BEM][] might be the best way to
go with it.

[emotion]: https://emotion.sh/docs/introduction
[linaria]: https://linaria.now.sh/
[bem]: http://getbem.com/

The react-bemed library gives you a simple styled components inspired
component builder API for working with BEM classes.

```tsx
import { bemed } from "react-bemed";

// Create namespaced BEM component creator
const createBlock = bemed("app");

// <button class="app-button">
const Button = createBlock("button", {
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

## Noteworthy features

-   It's tiny! 875B (minified+gzipped)
-   100% typed with TypeScript
-   Forwards ref correctly
