export declare type FormattingType = "key" | "added" | "changed" | "removed" | "value" | "commented" | "error" | "";
export declare type LogItem = {
    text: string;
    type: FormattingType;
    path: string;
};
export declare type ValueType = string | number | boolean | undefined | null;
export declare type DataObjectValues = ValueType | DataObject | DataObject[] | ValueType[];
export interface DataObject {
    [key: string]: DataObjectValues;
}
