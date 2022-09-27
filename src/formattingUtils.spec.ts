import chai from "chai";
import { formatForLoggingInBrowser } from "./formattingUtils";
import { parseMessage } from "./index";

const assert = chai.assert;

describe("formattingUtils", () => {

    describe("formatForLoggingInBrowser", () => {
        it("should return arguments for console logging", () => {
            const message = { a: 1, c: { b: "2" } };
            const result = parseMessage(message);
            assert.deepEqual(formatForLoggingInBrowser("", result), [
                '%c{%c"a"%c:%c1%c,%c"c"%c:{%c"b"%c:%c"2"%c}}',
                "",
                "color: orange;",
                "",
                "color: lightgreen;",
                "",
                "color: orange;",
                "",
                "color: orange;",
                "",
                "color: lightgreen;",
                "",
            ]);
        });

        it("should return arguments for console logging including removed parts", () => {
            const prevObject = { b: [{ a: 1}, {a: 2}] };
            const current = { b: [{ a: 1} ] };
            const result = parseMessage(current, { showDiffWithObject: prevObject });
            assert.deepEqual(formatForLoggingInBrowser("", result), [
                '%c{%c"b"%c:[{%c"a"%c:%c1%c}]}%c Removed: %c.b.1:{"a":2}',
                "",
                "color: orange;",
                "",
                "color: orange;",
                "",
                "color: lightgreen;",
                "",
                "",
                "color: red;"
            ]);
        });
    });
});