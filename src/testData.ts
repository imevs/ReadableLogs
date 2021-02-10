import { DataObject } from "./PrettyLogs";

export const logs: { prevObject: DataObject; current: DataObject; } = {
    prevObject: {
        a: 1,
        b: "2",
        c: []
    },
    current: {
        a: 4,
        b: "5",
        c: [{ a: 6}, { a: 7 }]
    },
};
