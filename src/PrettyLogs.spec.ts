import chai from "chai";
const assert = chai.assert;
import { annotateDataInJson, highlightJsonParts, mergeLogItems, parseMessage } from "./index";

describe("PrettyLogs", () => {
    describe("parseMessage", () => {
        it("should build valid JSON stringified content", () => {
            const message = { "a": 1, c: { b: "2" } };
            const result = parseMessage(message);
            assert.equal(result.map(i => i.text).join(""), JSON.stringify(message));
        });

        it("should not highlight values in keys", () => {
            assert.deepEqual(parseMessage({ "a42": 4 }), [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"a42"', type: "key", path: "/a42" },
                { text: ":", type: "specialSymbols", path: "/a42" },
                { text: "4", type: "number", path: "/a42" },
                { text: "}", type: "specialSymbols", path: "/a42" }
            ]);
        });

        it("should not highlight values in other values", () => {
            assert.deepEqual(parseMessage({ "a": "123", "b": "2" }), [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":", type: "specialSymbols", path: "/a" },
                { text: '"123"', type: "string", path: "/a" },
                { text: ",", type: "specialSymbols", path: "/a" },
                { text: '"b"', type: "key", path: "/b" },
                { text: ":", type: "specialSymbols", path: "/b" },
                { text: '"2"', type: "string", path: "/b" },
                { text: "}", type: "specialSymbols", path: "/b" }
            ]);
        });

        it("should not highlight values in other values (complex)", () => {
            assert.deepEqual(parseMessage({
                "d": {
                    "1": [{ "e": 1 }, { "e": 3 }, { "a": 3 }],
                    "2": [{ "b": 1 }, { "b": 3 }, { "b": 3 }]
                }, "t": 16343
            }), [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"d"', type: "key", path: "/d" },
                { text: ":{", type: "specialSymbols", path: "/d" },
                { text: '"1"', type: "key", path: "/d/1" },
                { text: ":[{", type: "specialSymbols", path: "/d/1" },
                { text: '"e"', type: "key", path: "/d/1/0/e" },
                { text: ":", type: "specialSymbols", path: "/d/1/0/e" },
                { text: "1", type: "number", path: "/d/1/0/e" },
                { text: "},{", type: "specialSymbols", path: "/d/1/0/e" },
                { text: '"e"', type: "key", path: "/d/1/1/e" },
                { text: ":", type: "specialSymbols", path: "/d/1/1/e" },
                { text: "3", type: "number", path: "/d/1/1/e" },
                { text: "},{", type: "specialSymbols", path: "/d/1/1/e" },
                { text: '"a"', type: "key", path: "/d/1/2/a" },
                { text: ":", type: "specialSymbols", path: "/d/1/2/a" },
                { text: "3", type: "number", path: "/d/1/2/a" },
                { text: "}],", type: "specialSymbols", path: "/d/1/2/a" },
                { text: '"2"', type: "key", path: "/d/2" },
                { text: ":[{", type: "specialSymbols", path: "/d/2" },
                { text: '"b"', type: "key", path: "/d/2/0/b" },
                { text: ":", type: "specialSymbols", path: "/d/2/0/b" },
                { text: "1", type: "number", path: "/d/2/0/b" },
                { text: "},{", type: "specialSymbols", path: "/d/2/0/b" },
                { text: '"b"', type: "key", path: "/d/2/1/b" },
                { text: ":", type: "specialSymbols", path: "/d/2/1/b" },
                { text: "3", type: "number", path: "/d/2/1/b" },
                { text: "},{", type: "specialSymbols", path: "/d/2/1/b" },
                { text: '"b"', type: "key", path: "/d/2/2/b" },
                { text: ":", type: "specialSymbols", path: "/d/2/2/b" },
                { text: "3", type: "number", path: "/d/2/2/b" },
                { text: "}]},", type: "specialSymbols", path: "/d/2/2/b" },
                { text: '"t"', type: "key", path: "/t" },
                { text: ":", type: "specialSymbols", path: "/t" },
                { text: "16343", type: "number", path: "/t" },
                { text: "}", type: "specialSymbols", path: "/t" }
            ]);
        });

        it("should parse JSON object", () => {
            assert.deepEqual(parseMessage({ "a": true }), [
                { path: "root", text: "{", type: "specialSymbols" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "/a", text: ":", type: "specialSymbols" },
                { path: "/a", text: "true", type: "boolean" },
                { path: "/a", text: "}", type: "specialSymbols" }
            ]);
        });

        it("should parse JSON object with changed attr", () => {
            const prevObject = { a: 2 };
            assert.deepEqual(parseMessage({ "a": 1 }, { showDiffWithObject: prevObject }), [
                { path: "root", text: "{", type: "specialSymbols" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "/a", text: ":", type: "specialSymbols" },
                { path: "/a", text: "1", type: "changed" },
                { path: "/a", text: "}", type: "specialSymbols" }
            ]);
        });

        it("should parse JSON object with added attr", () => {
            const prevObject = {};
            assert.deepEqual(parseMessage({ "a": 1 }, { showDiffWithObject: prevObject }), [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"a":1}', path: "/a", type: "added" },
            ]);
        });

        it("should parse JSON object with added items in array", () => {
            const prevObject = { a: [] };
            const result = parseMessage({ a: [{b: 1}, { b: 2 }] }, { showDiffWithObject: prevObject });
            assert.deepEqual(result, [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":[{", type: "specialSymbols", path: "/a" },
                { text: '"b":1},{', path: "/a/0/b", type: "added" },
                { text: '"b":2}]}', path: "/a/1/b", type: "added" },
            ]);
        });

        it("should parse JSON object with changed sub object", () => {
            const prevObject = { a: { c: 1 }};
            assert.deepEqual(parseMessage({ "a": { c: 2 } }, { showDiffWithObject: prevObject }), [
                { path: "root", text: "{", type: "specialSymbols" },
                { path: "/a", text: '"a"', type: "key" },
                { path: "/a", text: ":{", type: "specialSymbols" },
                { path: "/a/c", text: '"c"', type: "key" },
                { path: "/a/c", text: ":", type: "specialSymbols" },
                { path: "/a/c", text: "2", type: "changed" },
                { path: "/a/c", text: "}}", type: "specialSymbols" }
            ]);
        });

        it("should parse JSON object with added attribute in sub object", () => {
            const prevObject = { a: { }};
            assert.deepEqual(parseMessage({ "a": { c: 2 } }, { showDiffWithObject: prevObject }), [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":{", type: "specialSymbols", path: "/a" },
                { text: '"c":2}}', path: "/a/c", type: "added" },
            ]);
        });

        it("should highlight correctly keys in not changed object", () => {
            const prevObject = { e: "2", a: { c: { d: 1 } }};
            assert.deepEqual(parseMessage({ e: "2", a: { c: { d: 1 } }}, { showDiffWithObject: prevObject }), [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"e"', type: "key", path: "/e" },
                { text: ":", type: "specialSymbols", path: "/e" },
                { text: '"2"', type: "string", path: "/e" },
                { text: ",", type: "specialSymbols", path: "/e" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":{", type: "specialSymbols", path: "/a" },
                { text: '"c"', type: "key", path: "/a/c" },
                { text: ":{", type: "specialSymbols", path: "/a/c" },
                { text: '"d"', type: "key", path: "/a/c/d" },
                { text: ":", type: "specialSymbols", path: "/a/c/d" },
                { text: "1", type: "number", path: "/a/c/d" },
                { text: "}}}", type: "specialSymbols", path: "/a/c/d" }
            ]);
        });

        it("should highlight correctly multiple keys in deep object", () => {
            assert.deepEqual(parseMessage({ a: { c: [{ d: 1 }, { d: 2 }] }}), [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":{", type: "specialSymbols", path: "/a" },
                { text: '"c"', type: "key", path: "/a/c" },
                { text: ":[{", type: "specialSymbols", path: "/a/c" },
                { text: '"d"', path: "/a/c/0/d", type: "key" },
                { text: ":", type: "specialSymbols", path: "/a/c/0/d" },
                { text: "1", type: "number", path: "/a/c/0/d" },
                { text: "},{", type: "specialSymbols", path: "/a/c/0/d" },
                { text: '"d"', type: "key", path: "/a/c/1/d" },
                { text: ":", type: "specialSymbols", path: "/a/c/1/d" },
                { text: "2", type: "number", path: "/a/c/1/d" },
                { text: "}]}}", type: "specialSymbols", path: "/a/c/1/d" }
            ]);
        });

        it("should correctly highlight changes in modified object", () => {
            const prevObject = { a: 2, c: { e: 1 }};
            assert.deepEqual(parseMessage({ a: 1, c: { e: 1 }}, { showDiffWithObject: prevObject }), [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":", type: "specialSymbols", path: "/a" },
                { text: "1", path: "/a", type: "changed" },
                { text: ",", type: "specialSymbols", path: "/a" },
                { text: '"c"', type: "key", path: "/c" },
                { text: ":{", type: "specialSymbols", path: "/c" },
                { text: '"e"', type: "key", path: "/c/e" },
                { text: ":", type: "specialSymbols", path: "/c/e" },
                { text: "1", path: "/c/e", type: "changed" },
                { text: "}}", type: "specialSymbols", path: "/c/e" }
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
            assert.deepEqual(parseMessage(current, { showDiffWithObject: prevObject }), [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"a"', path: "/a", type: "key" },
                { text: ":", type: "specialSymbols", path: "/a" },
                { text: "4", path: "/a", type: "changed" },
                { text: ",", type: "specialSymbols", path: "/a" },
                { text: '"b"', type: "key", path: "/b" },
                { text: ":", type: "specialSymbols", path: "/b" },
                { text: '"5"', type: "changed", path: "/b" },
                { text: ",", type: "specialSymbols", path: "/b" },
                { text: '"c"', type: "key", path: "/c" },
                { text: ":[{", type: "specialSymbols", path: "/c" },
                { text: '"a":6},{', path: "/c/0/a", type: "added" },
                { text: '"a":7}]}', path: "/c/1/a", type: "added" }
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
            const result = parseMessage(current, { showDiffWithObject: prevObject });
            assert.deepEqual(result, [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":", type: "specialSymbols", path: "/a" },
                { text: "4", type: "number", path: "/a" },
                { text: "}", type: "specialSymbols", path: "/a" },
                { type: "removed", path: "/b", text: '"2"' }
            ]);
        });

        it("should search for removed parts in deep object", () => {
            const prevObject = { b: { c: { a: 1 } } };
            const current = { b: { c: {} } };
            const result = parseMessage(current, { showDiffWithObject: prevObject });
            assert.deepEqual(result, [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"b"', type: "key", path: "/b" },
                { text: ":{", type: "specialSymbols", path: "/b" },
                { text: '"c"', type: "key", path: "/b/c" },
                { text: ":{}}}", type: "specialSymbols", path: "/b/c" },
                { type: "removed", path: "/b/c/a", text: "1" }
            ]);
        });

        it("should search for removed parts in arrays", () => {
            const prevObject = { b: [{ a: 1}, {a: 2}] };
            const current = { b: [{ a: 1} ] };
            const result = parseMessage(current, { showDiffWithObject: prevObject });
            assert.deepEqual(result, [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"b"', type: "key", path: "/b" },
                { text: ":[{", type: "specialSymbols", path: "/b" },
                { text: '"a"', type: "key", path: "/b/0/a" },
                { text: ":", type: "specialSymbols", path: "/b/0/a" },
                { text: "1", type: "number", path: "/b/0/a" },
                { text: "}]}", type: "specialSymbols", path: "/b/0/a" },
                { type: "removed", path: "/b/1", text: '{"a":2}' }
            ]);
        });
    });

    describe("highlightJsonParts", () => {
        it("should highlight part of message by path", () => {
            const result = highlightJsonParts({
                a: { b: { c: 1 } },
                d: 2,
            }, "/a/b/c");

            assert.deepEqual(result, [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":{", type: "specialSymbols", path: "/a" },
                { text: '"b"', type: "key", path: "/a/b" },
                { text: ":{", type: "specialSymbols", path: "/a/b" },
                { text: '"c":1}},', path: "/a/b/c", type: "added" },
                { text: '"d"', type: "key", path: "/d" },
                { text: ":", type: "specialSymbols", path: "/d" },
                { text: "2", type: "number", path: "/d" },
                { text: "}", type: "specialSymbols", path: "/d" }
            ]);
        });
    });

    describe("annotateDataInJson", () => {
        it("should add comments in multiline JSON", () => {
            const result = annotateDataInJson({ a: { b: { c: 2, d: 3 }}}, [
                { text: "should be string", path: "/a/b/c", type: "error" },
                { text: "should be boolean", path: "/a/b/d", type: "error" }
            ], { multiline: true });
            assert.deepEqual(result, [
                { text: "{\n  ", type: "specialSymbols", path: "root" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ": {\n    ", type: "specialSymbols", path: "/a" },
                { text: '"b"', type: "key", path: "/a/b" },
                { text: ": {\n      ", type: "specialSymbols", path: "/a/b" },
                { text: '"c": 2,', path: "/a/b/c", type: "error" },
                { text: " // should be string\n", path: "/a/b/c", type: "annotation" },
                { text: "\n      ", path: "/a/b/c", type: "error" },
                { text: '"d": 3', path: "/a/b/d", type: "error" },
                { text: " // should be boolean\n", path: "/a/b/d", type: "annotation" },
                { text: "\n    }\n  }\n}", path: "/a/b/d", type: "error" }
            ]);
        });

        it("should add comments in not multiline JSON", () => {
            const result = annotateDataInJson({ a: { b: { c: 2, d: 3 }}}, [
                { text: "should be string", path: "/a/b/c", type: "error" },
                { text: "should be boolean", path: "/a/b/d", type: "error" }
            ], { multiline: false });
            assert.deepEqual(result, [
                { text: "{", type: "specialSymbols", path: "root" },
                { text: '"a"', type: "key", path: "/a" },
                { text: ":{", type: "specialSymbols", path: "/a" },
                { text: '"b"', type: "key", path: "/a/b" },
                { text: ":{", type: "specialSymbols", path: "/a/b" },
                { text: '"c":2,', path: "/a/b/c", type: "error" },
                { text: " /* should be string */ ", path: "/a/b/c", type: "annotation" },
                { text: '"d":3}}}', path: "/a/b/d", type: "error" },
                { text: " /* should be boolean */ ", path: "/a/b/d", type: "annotation" }
            ]);
        });
    });

    describe("mergeLogItems", () => {

        it("should merge text with same type and path", () => {
            assert.deepEqual(mergeLogItems([
                { "text": "{\n  ", "type": "specialSymbols", "path": "" },
                { "text": "\"foo\"", "type": "key", "path": "/foo" },
                { "text": ": ", "type": "specialSymbols", "path": "/foo" },
                { "text": "1", "type": "number", "path": "/foo" },
                { "text": ",\n  ", "type": "specialSymbols", "path": "/foo" },
                { "text": "\"bar\"", "path": "/bar", "type": "error" },
                { "text": ": ", "path": "/bar", "type": "error" },
                { "text": "4343", "path": "/bar", "type": "error" },
                { "text": "", "path": "/bar", "type": "error" },
                { "text": " // must be string\n", "path": "/bar", "type": "annotation" },
                { "text": "\n}", "path": "/bar", "type": "error" }
            ]), [
                { "path": "", "text": "{\n  ", "type": "specialSymbols" },
                { "path": "/foo", "text": "\"foo\"", "type": "key" },
                { "path": "/foo", "text": ": ", "type": "specialSymbols" },
                { "path": "/foo", "text": "1", "type": "number" },
                { "path": "/foo", "text": ",\n  ", "type": "specialSymbols" },
                { "path": "/bar", "text": "\"bar\": 4343", "type": "error" },
                { "path": "/bar", "text": " // must be string\n", "type": "annotation" },
                { "path": "/bar", "text": "\n}", "type": "error" }
            ]);
        });
    });
});