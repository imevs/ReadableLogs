define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.safeParse = exports.highlightTextInHtml = exports.removeHtmlEntities = exports.formatMultiLineTextAsHTML = exports.formatForLoggingInBrowser = exports.typeToColorMap = void 0;
    exports.typeToColorMap = {
        unknown: "",
        specialSymbols: "",
        value: "lightgreen",
        key: "orange",
        added: "blue",
        changed: "green",
        removed: "red",
        error: "red",
        annotation: "green",
    };
    function getColor(type) {
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
            ...notRemovedItems.map(item => item.type !== "specialSymbols" ? `color: ${getStyle(item.type)};` : ""),
            ...(removedItems.length > 0 ? ["", `color: ${getStyle("removed")};`] : [])
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
                .filter(part => part.type !== "removed")
                .map(part => `<span style="color: ${getColor(part.type)}">${formatMultiLineTextAsHTML(part.text)}</span>`)
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
