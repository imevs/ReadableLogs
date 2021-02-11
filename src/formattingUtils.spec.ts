import chai from "chai";
import { formatForLoggingInBrowser } from "./formattingUtils";
import { parseMessage } from "./PrettyLogs";

const assert = chai.assert;

describe("formattingUtils", () => {

    describe("formatForLoggingInBrowser", () => {
        it("should return arguments for console logging", () => {
            const message = { a: 1, c: { b: "2" } };
            const result = parseMessage(message);
            assert.deepEqual(formatForLoggingInBrowser("", result), [
                '%c{%c"a"%c:1,%c"c"%c:{%c"b"%c:"2"}}',
                "",
                "color: orange;",
                "",
                "color: orange;",
                "",
                "color: orange;",
                ""
            ]);
        });
    });
});