define(["require", "exports", "./PrettyLogs", "./testData", "./formattingUtils"], function (require, exports, PrettyLogs_1, testData_1, formattingUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function executeFormatter(data) {
        const res = PrettyLogs_1.formatLogs(data);
        formattingUtils_1.showLogsInBrowserConsole(res);
        document.querySelector("#demo_input").innerHTML = formattingUtils_1.highlightTextInHtml(res);
    }
    executeFormatter(testData_1.logs);
    document.querySelector("#run").addEventListener("click", () => {
        var _a;
        console.clear();
        const data = formattingUtils_1.removeHtmlEntities((_a = document.querySelector("#demo_input").textContent) !== null && _a !== void 0 ? _a : "");
        try {
            const object = JSON.parse(data);
            executeFormatter(object);
            document.querySelector("#error").innerHTML = "";
        }
        catch (ex) {
            document.querySelector("#error").innerHTML = JSON.stringify(ex.message);
        }
    });
});
