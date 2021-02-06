import chai from 'chai';
const assert = chai.assert;
import { parseMessage } from "./PrettyLogs";

describe('PrettyLogs', () => {
    describe('parseMessage', () => {
        it('should parse JSON object', () => {
            assert.deepEqual(parseMessage({ "a": 1 }, { highlightKeys: true }), [
                {
                    "path": "",
                    "text": "{",
                    "type": ""
                },
                {
                    "path": "/a",
                    "text": `"a"`,
                    "type": "key"
                },
                {
                    "path": "/a",
                    "text": ":1}",
                    "type": ""
                }
            ]);
        });

        it('should parse JSON object with changed attr', () => {
            const prevObject = { a: 2 };
            assert.deepEqual(parseMessage({ "a": 1 }, { highlightKeys: true, showDifferences: true }, prevObject), [
                {
                    "path": "",
                    "text": "{",
                    "type": ""
                },
                {
                    "path": "/a",
                    "text": "\"a\"",
                    "type": "key"
                },
                {
                    "path": "/a",
                    "text": ":",
                    "type": ""
                },
                {
                    "path": "/a",
                    "text": "1",
                    "type": "changed"
                },
                {
                    "path": "/a",
                    "text": "}",
                    "type": ""
                }
            ]);
        });

        it('should parse JSON object with added attr', () => {
            const prevObject = {};
            assert.deepEqual(parseMessage({ "a": 1 }, { highlightKeys: true, showDifferences: true }, prevObject), [
                {
                    "path": "",
                    "text": "{",
                    "type": ""
                },
                {
                    "path": "/a",
                    "text": "\"a\"",
                    "type": "key"
                },
                {
                    "path": "/a",
                    "text": ":",
                    "type": ""
                },
                {
                    "path": "/a",
                    "text": "1",
                    "type": "added"
                },
                {
                    "path": "/a",
                    "text": "}",
                    "type": ""
                }
            ]);
        });

        it('should parse JSON object with changed sub object', () => {
            const prevObject = { a: { c: 1 }};
            assert.deepEqual(parseMessage({ "a": { c: 2 } }, { highlightKeys: true, showDifferences: true }, prevObject), [
                {
                    "path": "",
                    "text": "{",
                    "type": ""
                },
                {
                    "path": "/a",
                    "text": "\"a\"",
                    "type": "key"
                },
                {
                    "path": "/a",
                    "text": ":{\"c\":",
                    "type": ""
                },
                {
                    "path": "/a/c",
                    "text": "2",
                    "type": "changed"
                },
                {
                    "path": "/a/c",
                    "text": "}}",
                    "type": ""
                }
            ]);
        });

        it('should parse JSON object with added attribute in sub object', () => {
            const prevObject = { a: { }};
            assert.deepEqual(parseMessage({ "a": { c: 2 } }, { highlightKeys: true, showDifferences: true }, prevObject), [
                {
                    "path": "",
                    "text": "{",
                    "type": ""
                },
                {
                    "path": "/a",
                    "text": "\"a\"",
                    "type": "key"
                },
                {
                    "path": "/a",
                    "text": ":{\"c\":",
                    "type": ""
                },
                {
                    "path": "/a/c",
                    "text": "2",
                    "type": "added"
                },
                {
                    "path": "/a/c",
                    "text": "}}",
                    "type": ""
                }
            ]);
        });
    });
});