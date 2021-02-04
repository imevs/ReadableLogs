export declare type LOG = {
    text: string;
    type: FormattingType;
    path: string;
}[];
export declare type FormattingType = "key" | "added" | "changed" | "removed" | "";
declare type ValueType = string | number | boolean | undefined | null;
declare type DataObjectValues = ValueType | DataObject | DataObject[] | ValueType[];
export interface DataObject {
    [key: string]: DataObjectValues;
}
export declare function formatLogs(data: DataObject | DataObject[]): LOG | LOG[];
export {};
