import { DataObject, LogItem } from "./types";
export declare type Options = {
    isDebug?: boolean;
    showDiffWithObject?: DataObject;
    multiline?: boolean;
};
export declare const pathSeparator = "/";
export declare function highlightPartsOfMessage<T extends DataObject>(message: T, options: Options): LogItem[];
export declare function highlightAddedSubMessage(loggedParts: LogItem[], path: string, options: Options): LogItem[];
export declare function annotateDataInJson(data: DataObject, annotations: LogItem[], options?: Options): LogItem[];
export declare function mergeLogItems(logParts: LogItem[]): LogItem[];
