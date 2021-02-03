export declare type LOG = {
    text: string;
    color: Color;
    path: string;
}[];
declare type Color = "red" | "blue" | "purple" | "orange" | "green" | "";
declare type ValueType = string | number | boolean | undefined | null;
declare type DataObjectValues = ValueType | DataObject | DataObject[] | ValueType[];
export interface DataObject {
    [key: string]: DataObjectValues;
}
export declare function formatLogs(data: DataObject | DataObject[]): LOG | LOG[];
export declare function showLogsInBrowserConsole(result: LOG | LOG[]): void;
export {};
