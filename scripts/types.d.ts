declare type ValuesType = "number" | "string" | "boolean";
export declare type FormattingType = "key" | "added" | "changed" | "removed" | "value" | "annotation" | "error" | "specialSymbols" | "unknown" | ValuesType;
export declare type LogItem = {
    text: string;
    readonly type: FormattingType;
    path: string;
};
export declare type ValueType = string | number | boolean | undefined | null;
export declare type DataObjectValues = ValueType | DataObject | DataObject[] | ValueType[];
export interface DataObject {
    readonly [key: string]: DataObjectValues;
}
export {};
