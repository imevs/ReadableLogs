import chai from "chai";
const assert = chai.assert;
import { highlightErrorsInJson, highlightJsonParts, parseMessage } from "./index";

describe("PrettyLogs", () => {
    describe("parseMessage", () => {
        it("should build valid JSON stringified content", () => {
            const message = { "a": 1, c: { b: "2" } };
            const result = parseMessage(message);
            assert.equal(result.map(i => i.text).join(""), JSON.stringify(message));
        });

        it("should parse JSON object", () => {
            assert.deepEqual(parseMessage({ "a": 1 }), [
                { path: "", text: "{", type: "" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "/a", text: ":1}", type: "" }
            ]);
        });

        it("should parse JSON object with changed attr", () => {
            const prevObject = { a: 2 };
            assert.deepEqual(parseMessage({ "a": 1 }, { showDifferences: true }, prevObject), [
                { path: "", text: "{", type: "" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "/a", text: ":", type: "" },
                { path: "/a", text: "1", type: "changed" },
                { path: "/a", text: "}", type: "" }
            ]);
        });

        it("should parse JSON object with added attr", () => {
            const prevObject = {};
            assert.deepEqual(parseMessage({ "a": 1 }, { showDifferences: true }, prevObject), [
                { text: "{", type: "", path: "" },
                { text: '"a"', path: "/a", type: "added" },
                { text: ":1}", path: "/a", type: "added" }
            ]);
        });

        it("should parse JSON object with added items in array", () => {
            const prevObject = { a: [] };
            const result = parseMessage({ a: [{b: 1}, { b: 2 }] }, { showDifferences: true }, prevObject);
            assert.deepEqual(result, [
                { text: "{", type: "", path: "" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":[{", type: "", path: "/a" },
                { text: '"b"', path: "/a/0/b", type: "added" },
                { text: ":1},{", type: "added", path: "/a/0/b" },
                { text: '"b"', path: "/a/1/b", type: "added" },
                { text: ":2}]}", type: "added", path: "/a/1/b" }
            ]);
        });

        it("should parse JSON object with changed sub object", () => {
            const prevObject = { a: { c: 1 }};
            assert.deepEqual(parseMessage({ "a": { c: 2 } }, { showDifferences: true }, prevObject), [
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
            assert.deepEqual(parseMessage({ "a": { c: 2 } }, { showDifferences: true }, prevObject), [
                { text: "{", type: "", path: "" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":{", type: "", path: "/a" },
                { text: '"c"', path: "/a/c", type: "added" },
                { text: ":2}}", path: "/a/c", type: "added" }
            ]);
        });

        it("should highlight correctly keys in not changed object", () => {
            const prevObject = { e: "2", a: { c: { d: 1 } }};
            assert.deepEqual(parseMessage({ e: "2", a: { c: { d: 1 } }}, { showDifferences: true }, prevObject), [
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
            assert.deepEqual(parseMessage({ a: { c: [{ d: 1 }, { d: 2 }] }}), [
                { text: "{", type: "", path: "" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":{", type: "", path: "/a" },
                { text: '"c"', type: "key", path: "/a/c" },
                { text: ":[{", type: "", path: "/a/c" },
                { text: '"d"', type: "key", path: "/a/c/0/d" },
                { text: ":1},{", type: "", path: "/a/c/0/d" },
                { text: '"d"', type: "key", path: "/a/c/1/d" },
                { text: ":2}]}}", type: "", path: "/a/c/1/d" }
            ]);
        });

        it("should correctly highlight changes in modified object", () => {
            const prevObject = { a: 2, c: { e: 1 }};
            assert.deepEqual(parseMessage({ a: 1, c: { e: 1 }}, { showDifferences: true }, prevObject), [
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
            assert.deepEqual(parseMessage(current, { showDifferences: true }, prevObject), [
                { text: "{", type: "", path: "" },
                { text: '"a"', path: "/a", type: "key" },
                { text: ":", type: "", path: "/a" },
                { text: "4", type: "changed", path: "/a" },
                { text: ",", type: "", path: "/a" },
                { text: '"b"', type: "key", path: "/b" },
                { text: ":", type: "", path: "/b" },
                { text: '"5"', type: "changed", path: "/b" },
                { text: ",", type: "", path: "/b" },
                { text: '"c"', type: "key", path: "/c" },
                { text: ":[{", type: "", path: "/c" },
                { text: '"a"', path: "/c/0/a", type: "added" },
                { text: ":6},{", path: "/c/0/a", type: "added" },
                { text: '"a"', path: "/c/1/a", type: "added" },
                { text: ":7}]}", path: "/c/1/a", type: "added" }
            ]);
        });

        it("should search for removed parts in simple object", () => {
            const prevObject = {
                a: 4,
                b: "2",
            };
            const current = {
                a: 4,
            };
            const result = parseMessage(current, { showDifferences: true }, prevObject);
            assert.deepEqual(result, [
                { text: "{", type: "", path: "" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":4}", type: "", path: "/a" },
                { type: "removed", path: "/b", text: '"2"' }
            ]);
        });

        it("should search for removed parts in deep object", () => {
            const prevObject = { b: { c: { a: 1 } } };
            const current = { b: { c: {} } };
            const result = parseMessage(current, { showDifferences: true }, prevObject);
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
            const result = parseMessage(current, { showDifferences: true }, prevObject);
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

    describe("highlightJsonParts", () => {
        it("should highlight part of message by path", () => {
            const result = highlightJsonParts({
                a: { b: { c: 1 } },
                d: 2,
            }, "/a/b/c", { isDebug: true });

            assert.deepEqual(result, [
                { text: "{", type: "", path: "" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":{", type: "", path: "/a" },
                { text: '"b"', type: "key", path: "/a/b" },
                { text: ":{", type: "", path: "/a/b" },
                { text: '"c"', path: "/a/b/c", type: "added" },
                { text: ":1}},", path: "/a/b/c", type: "added" },
                { text: '"d"', type: "key", path: "/d" },
                { text: ":2}", type: "", path: "/d" }
            ]);
        });
    });

    describe("highlightErrorsInJson", () => {
        it("should add comments in multiline JSON", () => {
            const result = highlightErrorsInJson({ a: { b: { c: 2, d: 3 }}}, [
                { text: "should be string", path: "/a/b/c" },
                { text: "should be boolean", path: "/a/b/d" }
            ], { formatMultiline: true, isDebug: false });
            assert.deepEqual(result, [
                { text: "{\n  ", type: "", path: "" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ": {\n    ", type: "", path: "/a" },
                { text: '"b"', type: "key", path: "/a/b" },
                { text: ": {\n      ", type: "", path: "/a/b" },
                { text: '"c"', path: "/a/b/c", type: "error" },
                { text: ": 2,", path: "/a/b/c", type: "error" },
                { text: " // should be string\n", path: "/a/b/c", type: "commented" },
                { text: "\n      ", path: "/a/b/c", type: "error" },
                { text: '"d"', path: "/a/b/d", type: "error" },
                { text: ": 3", path: "/a/b/d", type: "error" },
                { text: " // should be boolean\n", path: "/a/b/d", type: "commented" },
                { text: "\n    }\n  }\n}", path: "/a/b/d", type: "error" }
            ]);
        });

        it("should add comments in not multiline JSON", () => {
            const result = highlightErrorsInJson({ a: { b: { c: 2, d: 3 }}}, [
                { text: "should be string", path: "/a/b/c" },
                { text: "should be boolean", path: "/a/b/d" }
            ], { formatMultiline: false, isDebug: false });
            assert.deepEqual(result, [
                { text: "{", type: "", path: "" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":{", type: "", path: "/a" },
                { text: '"b"', type: "key", path: "/a/b" },
                { text: ":{", type: "", path: "/a/b" },
                { text: '"c"', path: "/a/b/c", type: "error" },
                { text: ":2,", path: "/a/b/c", type: "error" },
                { text: " /* should be string */ ", path: "/a/b/c", type: "commented" },
                { text: '"d"', path: "/a/b/d", type: "error" },
                { text: ":3}}}", path: "/a/b/d", type: "error" },
                { text: " /* should be boolean */ ", path: "/a/b/d", type: "commented" }
            ]);
        });
    });
});