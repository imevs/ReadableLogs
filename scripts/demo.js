define(["require", "exports", "./PrettyLogs", "./testData"], function (require, exports, PrettyLogs_1, testData_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const result = PrettyLogs_1.formatLogs(testData_1.logs);
    PrettyLogs_1.showLogsInBrowserConsole(result);
});
