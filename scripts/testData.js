define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.logs = void 0;
    exports.logs = {
        prevObject: {
            a: 1,
            b: "2",
            e: { n: "2" },
            c: []
        },
        current: {
            a: 4,
            b: "5",
            e: { b: "2" },
            c: [{ a: 6, n: "2" }, { a: 7 }]
        },
    };
});
