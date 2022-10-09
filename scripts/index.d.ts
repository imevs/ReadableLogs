import { DataObject, LogItem } from "./types";
export * from "./PrettyLogs";
export * from "./formattingUtils";
export declare type ApiOptions = {
    yaml?: true;
} | {
    isDebug?: true;
    showDiffWithObject?: DataObject;
    multiline?: boolean;
};
export declare function parseMessage(data: DataObject | string, options?: ApiOptions): LogItem[];
export declare function highlightJsonParts(data: DataObject, path: string, options?: {
    formatMultiline?: boolean;
    isDebug?: boolean;
}): LogItem[];
