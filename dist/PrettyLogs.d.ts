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
export declare type Options = {
    highlightKeys: boolean;
    showDifferences?: boolean;
    formatMultiline?: boolean;
};
export declare function parseMessage(data: DataObject, options: Omit<Options, "showDifferences">, prevMessage?: undefined): LOG;
export declare function parseMessage(data: DataObject, options: Options, prevMessage: DataObject): LOG;
export {};
