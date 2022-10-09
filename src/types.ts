type ValuesType = "number" | "string" | "boolean";

export type FormattingType = "key" | "added" | "changed" | "removed" | "value" | "annotation" | "error" | "specialSymbols" | "unknown" | ValuesType;
export type LogItem = {
    text: string;
    readonly type: FormattingType;
    /**
     * JSON path to the position of element inside the analyzed object
     */
    path: string;
};

export type ValueType = string | number | boolean | undefined | null;
export type DataObjectValues = ValueType | DataObject | DataObject[] | ValueType[];
export interface DataObject {
    readonly [key: string]: DataObjectValues;
}
