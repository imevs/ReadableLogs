define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.highlightTextInHtml = exports.removeHtmlEntities = exports.formatMultiLineTextAsHTML = exports.formatForLoggingInBrowser = void 0;
    const typeToColorMap = {
        "": "",
        value: "lightgreen",
        key: "orange",
        added: "blue",
        changed: "green",
        removed: "red",
        error: "red",
        commented: "green",
    };
    function getColor(type) {
        return typeToColorMap[type];
    }
    function formatForLoggingInBrowser(prefix, result, prefixColors = [], typeToStyleMap = typeToColorMap) {
        const getStyle = (type) => typeToStyleMap[type];
        return [
            prefix +
                result.filter(item => item.type !== "removed").map(item => "%c" + item.text).join("") +
                (result.filter(item => item.type === "removed").length > 0 ? "%c Removed: %c" : "") +
                result.filter(item => item.type === "removed").map(item => item.path + ":" + item.text)
                    .join(",").split("/").join("."),
            ...prefixColors,
            ...result.filter(item => item.type !== "removed").map(item => item.type !== "" ? `color: ${getStyle(item.type)};` : ""),
            ...(result.filter(item => item.type === "removed").length > 0 ? ["", `color: ${getStyle("removed")};`] : [])
        ];
    }
    exports.formatForLoggingInBrowser = formatForLoggingInBrowser;
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
