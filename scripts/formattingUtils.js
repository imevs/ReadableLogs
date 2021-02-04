define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.highlightTextInHtml = exports.removeHtmlEntities = exports.showLogsInBrowserConsole = void 0;
    const typeToColorMap = {
        "": "",
        key: "red",
        added: "blue",
        changed: "green",
        removed: "orange",
    };
    function getColor(type) {
        return typeToColorMap[type];
    }
    function showLogsInBrowserConsole(result) {
        (Array.isArray(result[0]) ? result : [result]).forEach(r => {
            console.info(...formatForLoggingInBrowser("Formatted message: ", r));
        });
    }
    exports.showLogsInBrowserConsole = showLogsInBrowserConsole;
    function formatForLoggingInBrowser(prefix, result) {
        return [prefix + result.map(item => "%c" + item.text).join(""),
            ...(result.map(item => `color: ${getColor(item.type)};`))];
    }
    function formatMultiLineTextAsHTML(content) {
        return content.split(' ').join('&nbsp;').split("\n").join("<br />");
    }
    function removeHtmlEntities(content) {
        return content.split(String.fromCharCode(160)).join(' ').split("<br />").join("\n");
    }
    exports.removeHtmlEntities = removeHtmlEntities;
    function highlightTextInHtml(messages) {
        const formattedMessages = (Array.isArray(messages[0]) ? messages : [messages]).map(message => {
            return message
                .map(part => `<span style="color: ${getColor(part.type)}">${formatMultiLineTextAsHTML(part.text)}</span>`)
                .join("");
        });
        if (!Array.isArray(messages[0])) {
            return formattedMessages[0];
        }
        return "[<br>" + formattedMessages.join(",<br>") + "<br>]";
    }
    exports.highlightTextInHtml = highlightTextInHtml;
});
