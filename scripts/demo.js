define(["require", "exports", "./PrettyLogs", "./testData", "./formattingUtils"], function (require, exports, PrettyLogs_1, testData_1, formattingUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function executeFormatter(data) {
        console.log("Default browser presentation", data.current);
        const result = PrettyLogs_1.parseMessage(data.current, { highlightKeys: true, showDifferences: true, formatMultiline: false }, data.prevObject);
        console.info(...formattingUtils_1.formatForLoggingInBrowser("Formatted message: ", result));
        const result2 = PrettyLogs_1.parseMessage(data.current, { highlightKeys: true, showDifferences: true, formatMultiline: true }, data.prevObject);
        document.querySelector("#demo_input_currentMessage").innerHTML = formattingUtils_1.highlightTextInHtml(result2);
        document.querySelector("#demo_input_prevMessage").innerHTML =
            formattingUtils_1.formatMultiLineTextAsHTML(JSON.stringify(data.prevObject, null, '  '));
    }
    executeFormatter(testData_1.logs);
    document.querySelector("#run").addEventListener("click", () => {
        var _a, _b;
        console.clear();
        const currentLoggableMessage = formattingUtils_1.removeHtmlEntities((_a = document.querySelector("#demo_input_currentMessage").textContent) !== null && _a !== void 0 ? _a : "");
        const prevMessage = formattingUtils_1.removeHtmlEntities((_b = document.querySelector("#demo_input_prevMessage").textContent) !== null && _b !== void 0 ? _b : "");
        try {
            executeFormatter({
                prevObject: JSON.parse(prevMessage),
                current: JSON.parse(currentLoggableMessage),
            });
            document.querySelector("#error").innerHTML = "";
        }
        catch (ex) {
            document.querySelector("#error").innerHTML = JSON.stringify(ex.message);
        }
    });
});
