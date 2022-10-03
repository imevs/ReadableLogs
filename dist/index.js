var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
define(["require", "exports", "./yamlSupport", "./PrettyLogs", "./PrettyLogs", "./formattingUtils"], function (require, exports, yamlSupport_1, PrettyLogs_1, PrettyLogs_2, formattingUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.highlightJsonParts = exports.parseMessage = void 0;
    __exportStar(PrettyLogs_2, exports);
    __exportStar(formattingUtils_1, exports);
    function parseMessage(data, options = {}) {
        if (options.yaml) {
            return yamlSupport_1.convertJsonToYaml(data);
        }
        const result = PrettyLogs_1.highlightPartsOfMessage(data, options);
        if (options.isDebug) {
            console.debug("parseMessage", result);
        }
        return result;
    }
    exports.parseMessage = parseMessage;
    function highlightJsonParts(data, path, options = {}) {
        const result = PrettyLogs_1.highlightAddedSubMessage(PrettyLogs_1.highlightPartsOfMessage(data, options), path, options);
        if (options === null || options === void 0 ? void 0 : options.isDebug) {
            console.debug("highlightJsonParts", result);
        }
        return result;
    }
    exports.highlightJsonParts = highlightJsonParts;
});
