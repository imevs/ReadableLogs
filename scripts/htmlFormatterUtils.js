define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.highlightTextInHtml = exports.removeHtmlEntities = void 0;
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
                .map(part => `<span style="color: ${part.color}">${formatMultiLineTextAsHTML(part.text)}</span>`)
                .join("");
        });
        if (!Array.isArray(messages[0])) {
            return formattedMessages[0];
        }
        return "[<br>" + formattedMessages.join(",<br>") + "<br>]";
    }
    exports.highlightTextInHtml = highlightTextInHtml;
});
