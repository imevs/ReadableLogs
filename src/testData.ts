import { DataObject } from "./PrettyLogs";

export const logs: { prevObject: DataObject; current: DataObject; } = {
    prevObject: {
        a: 1,
        b: "2",
        c: []
    },
    current: {
        a: 2,
        b: "3",
        c: ["4"]
    },
};
