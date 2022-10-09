import { DataObject } from "./types";

export const logs: { prevObject: DataObject; current: DataObject | string; } = {
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
        c: [{ a: 6, n: "2"}, { a: 7 }]
    },
};
