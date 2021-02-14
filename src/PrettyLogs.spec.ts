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
                { path: "/a", text: ":1}", type: "" }
            ]);
        });

        it("should parse JSON object with changed attr", () => {
            const prevObject = { a: 2 };
            assert.deepEqual(parseMessage({ "a": 1 }, { highlightKeys: true, showDifferences: true }, prevObject), [
                { path: "", text: "{", type: "" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "/a", text: ":", type: "" },
                { path: "/a", text: "1", type: "changed" },
                { path: "/a", text: "}", type: "" }
            ]);
        });

        it("should parse JSON object with added attr", () => {
            const prevObject = {};
            assert.deepEqual(parseMessage({ "a": 1 }, { highlightKeys: true, showDifferences: true }, prevObject), [
                { path: "", text: "{", type: "" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "/a", text: ":", type: "" },
                { path: "/a", text: "1", type: "added" },
                { path: "/a", text: "}", type: "" }
            ]);
        });

        it("should parse JSON object with changed sub object", () => {
            const prevObject = { a: { c: 1 }};
            assert.deepEqual(parseMessage({ "a": { c: 2 } }, { highlightKeys: true, showDifferences: true }, prevObject), [
                { path: "", text: "{", type: "" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "/a", text: ":{", type: "" },
                { path: "/a/c", text: '"c"', type: "key" },
                { path: "/a/c", text: ":", type: "" },
                { path: "/a/c", text: "2", type: "changed" },
                { path: "/a/c", text: "}}", type: "" }
            ]);
        });

        it("should parse JSON object with added attribute in sub object", () => {
            const prevObject = { a: { }};
            assert.deepEqual(parseMessage({ "a": { c: 2 } }, { highlightKeys: true, showDifferences: true }, prevObject), [
                { path: "", text: "{", type: "" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "/a", text: ":{", type: "" },
                { path: "/a/c", text: '"c"', type: "key" },
                { path: "/a/c", text: ":", type: "" },
                { path: "/a/c", text: "2", type: "added" },
                { path: "/a/c", text: "}}", type: "" }
            ]);
        });

        it("should highlight correctly keys in not changed object", () => {
            const prevObject = { e: "2", a: { c: { d: 1 } }};
            assert.deepEqual(parseMessage({ e: "2", a: { c: { d: 1 } }}, { highlightKeys: true, showDifferences: true }, prevObject), [
                { path: "", text: "{", type: "" },
                { path: "/e", text: '"e"', type: "key" },
                { path: "/e", text: ':"2",', type: "" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "/a", text: ":{", type: "" },
                { path: "/a/c", text: '"c"', type: "key" },
                { path: "/a/c", text: ":{", type: "" },
                { path: "/a/c/d", text: '"d"', type: "key" },
                { path: "/a/c/d", text: ":1}}}", type: "" }
            ]);
        });

        it("should highlight correctly multiple keys in deep object", () => {
            assert.deepEqual(parseMessage({ a: { c: [{ d: 1 }, { d: 2 }] }}, { highlightKeys: true }), [
                { text: "{", type: "", path: "" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":{", type: "", path: "/a" },
                { text: '"c"', type: "key", path: "/a/c" },
                { text: ":[{", type: "", path: "/a/c" },
                { text: '"d"', type: "key", path: "/a/c/0/d" },
                { text: ":1},{", type: "", path: "/a/c/0/d" },
                { text: '"d"', type: "key", path: "/a/c/0/d" },
                { text: ":2}]}}", type: "", path: "/a/c/0/d" }
            ]);
        });

        it("should correctly highlight changes in modified object", () => {
            const prevObject = { a: 2, c: { e: 1 }};
            assert.deepEqual(parseMessage({ a: 1, c: { e: 1 }}, { highlightKeys: true, showDifferences: true }, prevObject), [
                { text: "{", type: "", path: "" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":", type: "", path: "/a" },
                { text: "1", type: "changed", path: "/a" },
                { text: ",", type: "", path: "/a" },
                { text: '"c"', type: "key", path: "/c" },
                { text: ":{", type: "", path: "/c" },
                { text: '"e"', type: "key", path: "/c/e" },
                { text: ":1}}", type: "", path: "/c/e" }
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
                { text: '{"a":', type: "", path: "" },
                { text: "4", type: "changed", path: "/a" },
                { text: ',"b":"5","c":[{"a":6},{"a":7}]}', type: "", path: "/a" }
            ]);
        });

        it("should search for removed parts in simple object", () => {
            const prevObject = {
                b: "2",
            };
            const current = {
                a: 4,
            };
            const result = parseMessage(current, { highlightKeys: true, showDifferences: true }, prevObject);
            assert.deepEqual(result, [
                { text: "{", type: "", path: "" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":", type: "", path: "/a" },
                { text: "4", type: "added", path: "/a" },
                { text: "}", type: "", path: "/a" },
                { type: "removed", path: "/b", text: '"2"' }
            ]);
        });

        it("should search for removed parts in deep object", () => {
            const prevObject = { b: { c: { a: 1 } } };
            const current = { b: { c: {} } };
            const result = parseMessage(current, { highlightKeys: true, showDifferences: true }, prevObject);
            console.log(result);
            assert.deepEqual(result, [
                { text: "{", type: "", path: "" },
                { text: '"b"', type: "key", path: "/b" },
                { text: ":{", type: "", path: "/b" },
                { text: '"c"', type: "key", path: "/b/c" },
                { text: ":{}}}", type: "", path: "/b/c" },
                { type: "removed", path: "/b/c/a", text: "1" }
            ]);
        });

        it("should search for removed parts in arrays", () => {
            const prevObject = { b: [{ a: 1}, {a: 2}] };
            const current = { b: [{ a: 1} ] };
            const result = parseMessage(current, { highlightKeys: true, showDifferences: true }, prevObject);
            console.log(result);
            assert.deepEqual(result, [
                { text: "{", type: "", path: "" },
                { text: '"b"', type: "key", path: "/b" },
                { text: ":[{", type: "", path: "/b" },
                { text: '"a"', type: "key", path: "/b/0/a" },
                { text: ":1}]}", type: "", path: "/b/0/a" },
                { type: "removed", path: "/b/1", text: '{"a":2}' }
            ]);
        });
    });
});