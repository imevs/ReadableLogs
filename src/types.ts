export type FormattingType = "key" | "added" | "changed" | "removed" | "value" | "commented" | "error" | "";
export type LogItem = {
    text: string;
    type: FormattingType;
    /**
     * JSON path to the position of element inside the analyzed object
     */
    path: string;
};

export type ValueType = string | number | boolean | undefined | null;
export type DataObjectValues = ValueType | DataObject | DataObject[] | ValueType[];
export interface DataObject {
    [key: string]: DataObjectValues;
}
