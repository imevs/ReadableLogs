define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.safeParse = exports.highlightTextInHtml = exports.removeHtmlEntities = exports.formatMultiLineTextAsHTML = exports.formatForLoggingInBrowser = exports.typeToColorMap = void 0;
    function color(s) {
        return s;
    }
    exports.typeToColorMap = {
        unknown: "",
        specialSymbols: "",
        value: "color: " + "lightgreen",
        string: "color: " + color("#008000"),
        number: "color: " + color("#0000FF"),
        boolean: "color: " + color("#08FFF5"),
        key: "color: " + color("#660E6A"),
        added: "color: " + "blue;background: grey",
        changed: "color: " + "lightgreen;text-decoration: underline",
        removed: "color: " + "red",
        error: "color: " + "red",
        annotation: "color: " + color("#808080"),
    };
    function getStyle(type) {
        return exports.typeToColorMap[type];
    }
    function formatForLoggingInBrowser(prefix, result, prefixColors = [], typeToStyleMap) {
        const getStyle = (type) => { var _a; return (_a = typeToStyleMap === null || typeToStyleMap === void 0 ? void 0 : typeToStyleMap[type]) !== null && _a !== void 0 ? _a : exports.typeToColorMap[type]; };
        const removedItems = result.filter(item => item.type === "removed");
        const notRemovedItems = result.filter(item => item.type !== "removed");
        return [
            prefix +
                notRemovedItems.map(item => "%c" + item.text).join("") +
                (removedItems.length > 0 ? "%c Removed: %c" : "") +
                removedItems.map(item => item.path + ":" + item.text)
                    .join(",").split("/").join("."),
            ...prefixColors,
            ...notRemovedItems.map(item => item.type !== "specialSymbols" ? `${getStyle(item.type)};` : ""),
            ...(removedItems.length > 0 ? ["", `${getStyle("removed")};`] : [])
        ];
    }
    exports.formatForLoggingInBrowser = formatForLoggingInBrowser;
    function showLegendForSyntaxHighlighting() {
        console.log(...formatForLoggingInBrowser("", [
            {
                type: "annotation",
                path: "root",
                text: "You are using ReadableLogs library, it sets specific styles to make logs more readable (you can specify your own colors in configuration):\n "
            },
            { type: "added", path: "root", text: "Added text" },
            { type: "annotation", path: "root", text: "   " },
            { type: "changed", path: "root", text: "Changed text" },
            { type: "annotation", path: "root", text: "   " },
            { type: "key", path: "root", text: '"keyOfObject"' },
            { type: "annotation", path: "root", text: "   String: " },
            { type: "string", path: "root", text: '"String of text"' },
            { type: "annotation", path: "root", text: "   Number: " },
            { type: "number", path: "root", text: "1234.567" },
            { type: "annotation", path: "root", text: "   Boolean: " },
            { type: "boolean", path: "root", text: "false" },
            { type: "annotation", path: "root", text: "   " },
            { type: "removed", path: "root", text: "removed text" }
        ]));
    }
    showLegendForSyntaxHighlighting();
    function formatMultiLineTextAsHTML(content) {
        return content.split(" ").join("&nbsp;").split("\n").join("<br />");
    }
    exports.formatMultiLineTextAsHTML = formatMultiLineTextAsHTML;
    function removeHtmlEntities(content) {
        return content.split(String.fromCharCode(160)).join(" ").split("<br />").join("\n");
    }
    exports.removeHtmlEntities = removeHtmlEntities;
    function highlightTextInHtml(messages) {
        const formattedMessages = (Array.isArray(messages[0]) ? messages : [messages]).map(message => {
            return message
                .filter(part => part.type !== "removed")
                .map(part => `<span style="${getStyle(part.type)};">${formatMultiLineTextAsHTML(part.text)}</span>`)
                .join("");
        });
        if (!Array.isArray(messages[0])) {
            return formattedMessages[0];
        }
        return "[<br>" + formattedMessages.join(",<br>") + "<br>]";
    }
    exports.highlightTextInHtml = highlightTextInHtml;
    function safeParse(data) {
        try {
            return data === "" ? undefined : JSON.parse(data);
        }
        catch (ex) {
            return undefined;
        }
    }
    exports.safeParse = safeParse;
});
