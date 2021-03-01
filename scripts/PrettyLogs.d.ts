import { DataObject, LOG } from "./types";
export declare type Options = {
    isDebug?: boolean;
    showDifferences?: true;
    formatMultiline?: false;
} | {
    isDebug?: boolean;
    formatMultiline?: true;
    showDifferences?: false;
};
export declare const pathSeparator = "/";
export declare function highlightPartsOfMessage<T extends DataObject>(message: T, prevMessage: undefined | T, options: Options): LOG;
export declare function highlightPartByPath<T extends DataObject>(message: T, path: string, options: Options): LOG;
export declare function highlightErrorsInJson(data: DataObject, errors: {
    path: string;
    text: string;
}[], options?: {
    formatMultiline?: boolean;
    isDebug?: boolean;
}): LOG;
