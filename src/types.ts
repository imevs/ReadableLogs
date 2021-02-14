export type LOG = {
    text: string;
    type: FormattingType;
    path: string;
}[];
export type FormattingType = "key" | "added" | "changed" | "removed" | "";

export type ValueType = string | number | boolean | undefined | null;
export type DataObjectValues = ValueType | DataObject | DataObject[] | ValueType[];
export interface DataObject {
    [key: string]: DataObjectValues;
}
