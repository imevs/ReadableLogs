define(["require", "exports", "./index", "./testData", "./formattingUtils"], function (require, exports, index_1, testData_1, formattingUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function executeFormatter(data) {
        var _a, _b, _c, _d;
        console.log("JSON message 1", data.prevObject);
        console.log("JSON message 2", data.current);
        const multiline = (_b = !!((_a = document.querySelector("#multiline")) === null || _a === void 0 ? void 0 : _a.checked)) !== null && _b !== void 0 ? _b : false;
        const yaml = (_d = !!((_c = document.querySelector("#yaml")) === null || _c === void 0 ? void 0 : _c.checked)) !== null && _d !== void 0 ? _d : false;
        const result = index_1.parseMessage(data.current, yaml ? { yaml: true } : { showDiffWithObject: data.prevObject, multiline: multiline, isDebug: true });
        console.info(...formattingUtils_1.formatForLoggingInBrowser("Formatted message 2: ", result));
        if (yaml) {
            document.querySelector("#demo_input_prevMessage").innerHTML = formattingUtils_1.highlightTextInHtml(result);
        }
        else {
            document.querySelector("#demo_input_currentMessage").innerHTML = formattingUtils_1.highlightTextInHtml(result);
            document.querySelector("#demo_input_prevMessage").innerHTML = data.prevObject ?
                formattingUtils_1.formatMultiLineTextAsHTML(JSON.stringify(data.prevObject, null, "  ")) : "";
        }
    }
    function onClick() {
        var _a, _b, _c, _d;
        console.clear();
        const currentLoggableMessage = formattingUtils_1.removeHtmlEntities((_a = document.querySelector("#demo_input_currentMessage").innerText) !== null && _a !== void 0 ? _a : "");
        const prevMessage = formattingUtils_1.removeHtmlEntities((_b = document.querySelector("#demo_input_prevMessage").textContent) !== null && _b !== void 0 ? _b : "");
        const preserveFormatting = (_d = !!((_c = document.querySelector("#preserveFormatting")) === null || _c === void 0 ? void 0 : _c.checked)) !== null && _d !== void 0 ? _d : false;
        try {
            executeFormatter({
                prevObject: index_1.safeParse(prevMessage),
                current: preserveFormatting ? currentLoggableMessage : index_1.safeParse(currentLoggableMessage),
            });
            document.querySelector("#error").innerHTML = "";
        }
        catch (ex) {
            document.querySelector("#error").innerHTML = JSON.stringify(ex.message);
        }
    }
    executeFormatter(testData_1.logs);
    ["#run", "#yaml", "#multiline", "#preserveFormatting"].map(selector => document.querySelector(selector).addEventListener("click", onClick));
});
