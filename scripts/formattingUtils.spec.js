var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "chai", "./formattingUtils", "./index"], function (require, exports, chai_1, formattingUtils_1, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    chai_1 = __importDefault(chai_1);
    const assert = chai_1.default.assert;
    describe("formattingUtils", () => {
        describe("formatForLoggingInBrowser", () => {
            it("should return arguments for console logging", () => {
                const message = { a: 1, c: { b: "2" } };
                const result = index_1.parseMessage(message);
                assert.deepEqual(formattingUtils_1.formatForLoggingInBrowser("", result), [
                    '%c{%c"a"%c:%c1%c,%c"c"%c:{%c"b"%c:%c"2"%c}}',
                    "",
                    "color: #660E6A;",
                    "",
                    "color: #0000FF;",
                    "",
                    "color: #660E6A;",
                    "",
                    "color: #660E6A;",
                    "",
                    "color: #008000;",
                    "",
                ]);
            });
            it("should return arguments for console logging including removed parts", () => {
                const prevObject = { b: [{ a: 1 }, { a: 2 }] };
                const current = { b: [{ a: 1 }] };
                const result = index_1.parseMessage(current, { showDiffWithObject: prevObject });
                assert.deepEqual(formattingUtils_1.formatForLoggingInBrowser("", result), [
                    '%c{%c"b"%c:[{%c"a"%c:%c1%c}]}%c Removed: %c.b.1:{"a":2}',
                    "",
                    "color: #660E6A;",
                    "",
                    "color: #660E6A;",
                    "",
                    "color: #0000FF;",
                    "",
                    "",
                    "color: red;"
                ]);
            });
        });
    });
});
