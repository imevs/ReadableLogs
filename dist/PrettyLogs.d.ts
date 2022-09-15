import { DataObject, LogItem } from "./types";
export declare type Options = {
    isDebug?: boolean;
    showDiffWithObject?: DataObject;
    multiline?: false;
} | {
    isDebug?: boolean;
    multiline?: true;
    showDiffWithObject?: undefined;
};
export declare const pathSeparator = "/";
export declare function highlightPartsOfMessage<T extends DataObject>(message: T, options: Options): LogItem[];
export declare function highlightPartByPath<T extends DataObject>(message: T, path: string, options: Options): LogItem[];
export declare function highlightErrorsInJson(data: DataObject, errors: {
    path: string;
    text: string;
}[], options?: {
    formatMultiline?: boolean;
    isDebug?: boolean;
}): LogItem[];
