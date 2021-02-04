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

Usage:
```js
    const logs = [
        {
            a: 1,
            b: "2",
            c: []
        },
        {
            a: 2,
            b: "3",
            c: ["4"]
        }
    ];
    const formattedLogs = formatLogs(logs, { highlightKeys: true, showDifferences: true, formatMultiline: true });
    showLogsInBrowserConsole(formattedLogs);
```

Demo page: https://imevs.github.io/ReadableLogs/

![Demo](/demo.png?raw=true)
