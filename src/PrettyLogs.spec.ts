import chai from "chai";
const assert = chai.assert;
import { parseMessage } from "./PrettyLogs";

describe("PrettyLogs", () => {
    describe("parseMessage", () => {
        it("should build valid JSON stringified content", () => {
            const message = { "a": 1, c: { b: "2" } };
            const result = parseMessage(message);
            assert.equal(result.map(i => i.text).join(""), JSON.stringify(message));
        });

        it("should parse JSON object", () => {
            assert.deepEqual(parseMessage({ "a": 1 }, { highlightKeys: true }), [
                { path: "", text: "{", type: "" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "", text: ":1}", type: "" }
            ]);
        });

        it("should parse JSON object with changed attr", () => {
            const prevObject = { a: 2 };
            assert.deepEqual(parseMessage({ "a": 1 }, { highlightKeys: true, showDifferences: true }, prevObject), [
                { path: "", text: "{", type: "" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "", text: ":", type: "" },
                { path: "/a", text: "1", type: "changed" },
                { path: "", text: "}", type: "" }
            ]);
        });

        it("should parse JSON object with added attr", () => {
            const prevObject = {};
            assert.deepEqual(parseMessage({ "a": 1 }, { highlightKeys: true, showDifferences: true }, prevObject), [
                { path: "", text: "{", type: "" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "", text: ":", type: "" },
                { path: "/a", text: "1", type: "added" },
                { path: "", text: "}", type: "" }
            ]);
        });

        it("should parse JSON object with changed sub object", () => {
            const prevObject = { a: { c: 1 }};
            assert.deepEqual(parseMessage({ "a": { c: 2 } }, { highlightKeys: true, showDifferences: true }, prevObject), [
                { path: "", text: "{", type: "" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "", text: ":{", type: "" },
                { path: "/a", text: '"c"', type: "key" },
                { path: "", text: ":", type: "" },
                { path: "/a/c", text: "2", type: "changed" },
                { path: "", text: "}}", type: "" }
            ]);
        });

        it("should parse JSON object with added attribute in sub object", () => {
            const prevObject = { a: { }};
            assert.deepEqual(parseMessage({ "a": { c: 2 } }, { highlightKeys: true, showDifferences: true }, prevObject), [
                { path: "", text: "{", type: "" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "", text: ":{", type: "" },
                { path: "/a", text: '"c"', type: "key" },
                { path: "", text: ":", type: "" },
                { path: "/a/c", text: "2", type: "added" },
                { path: "", text: "}}", type: "" }
            ]);
        });

        it("should highlight correctly keys in not changed object", () => {
            const prevObject = { e: "2", a: { c: { d: 1 } }};
            assert.deepEqual(parseMessage({ e: "2", a: { c: { d: 1 } }}, { highlightKeys: true, showDifferences: true }, prevObject), [
                { path: "", text: "{", type: "" },
                { path: "/e", text: '"e"', type: "key" },
                { path: "", text: ':"2",', type: "" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "", text: ":{", type: "" },
                { path: "/a", text: '"c"', type: "key" },
                { path: "", text: ":{", type: "" },
                { path: "/a/c", text: '"d"', type: "key" },
                { path: "", text: ":1}}}", type: "" }
            ]);
        });

        it("should highlight correctly multiple keys in deep object", () => {
            assert.deepEqual(parseMessage({ a: { c: [{ d: 1 }, { d: 2 }] }}, { highlightKeys: true }), [
                { path: "", text: "{", type: "" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "", text: ":{", type: "" },
                { path: "/a", text: '"c"', type: "key" },
                { path: "", text: ":[{", type: "" },
                { path: "/a/c/0", text: "", type: "" },
                { path: "/a/c/1", text: '"d"', type: "key" },
                { path: "/a/c/0", text: "", type: "" },
                { path: "", text: ":1},{", type: "" },
                { path: "/a/c/0", text: "", type: "" },
                { path: "/a/c/1", text: '"d"', type: "key" },
                { path: "/a/c/0", text: "", type: "" },
                { path: "", text: ":2}]}}", type: "" }
            ]);
        });

        it.skip("should correctly highlight changes in modified object", () => {
            const prevObject = { a: 2, c: { e: 1 }};
            assert.deepEqual(parseMessage({ a: 1, c: { e: 1 }}, { highlightKeys: false, showDifferences: true }, prevObject), [
                { path: "", text: '{"a":', type: "" },
                { path: "/a", text: "1", type: "changed" },
                { path: "/a", text: ',"c":{"e":1}}', type: "" }
            ]);
        });

        it("should correctly highlight multiple changes", () => {
            const prevObject = {
                a: 1,
                b: "2",
                c: []
            };
            const current = {
                a: 4,
                b: "5",
                c: [{ a: 6 }, { a: 7 }]
            };
            assert.deepEqual(parseMessage(current, { highlightKeys: false, showDifferences: true }, prevObject), [
                { path: "", text: '{"a":', type: "" },
                { path: "/a", text: "4", type: "changed" },
                { path: "", text: ',"b":', type: "" },
                { path: "/b", text: '"5"', type: "changed" },
                { path: "", text: ',"c":[', type: "" },
                { path: "/c/0", text: '{"a":6}', type: "added" },
                { path: "", text: ",", type: "" },
                { path: "/c/1", text: '{"a":7}', type: "added" },
                { path: "", text: "]}", type: "" }
            ]);
        });
    });
});