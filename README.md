# ReadableLogs
Utility formats logs for browser console in more readable way (highlight changes, colorify JSON syntax).

Use case: utility allows to highlight data in JSON format in console logs for better readability.
The difference with default presentation of objects in console -
utility displays whole content of object instead of collapsed style.
Another use case is for scenario when application has stateful client-server API
and you need to track differences in state between messages.

Useful links:
- https://developer.mozilla.org/en-US/docs/Web/API/console#outputting_text_to_the_console

Browsers support:
- Chrome
- Safari
- Firefox

## Installation

```
npm install readable-json-log
```

# Usage
```js
    import { parseMessage } from "./PrettyLogs";
    import { formatForLoggingInBrowser } from "./formattingUtils";

    const message = {
        a: 1,
        b: "2",
        c: ["3"]
    };
    const parsedMessage = parseMessage(message, { multiline: true });
    console.info(...formatForLoggingInBrowser("Formatted message: ", parsedMessage));
```
or

```js
    import { parseMessage } from "./PrettyLogs";
    import { formatForLoggingInBrowser } from "./formattingUtils";

    const prevMessage = {
        a: 0,
        b: "3",
        c: []
    };
    const message = {
        a: 1,
        b: "2",
        c: ["3"]
    };
    // if prevMessage is provided it should be able to apply option "showDiffWithObject"
    const parsedMessage = parseMessage(message, { showDiffWithObject: prevMessage });
    console.info(...formatForLoggingInBrowser("Formatted message: ", parsedMessage));
```

Demo page: https://imevs.github.io/ReadableLogs/

![Demo](/demo.png?raw=true)
