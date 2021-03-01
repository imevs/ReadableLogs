import { DataObject, LOG } from "./types";
import { Options } from "./PrettyLogs";
export * from "./PrettyLogs";
export * from "./formattingUtils";
export declare function parseMessage(data: DataObject, options: undefined, prevMessage: undefined, yaml: true): LOG;
export declare function parseMessage(data: DataObject, options?: {
    formatMultiline?: boolean;
}, prevMessage?: undefined, yaml?: false): LOG;
export declare function parseMessage(data: DataObject, options: Options, prevMessage: DataObject, yaml?: false): LOG;
export declare function highlightJsonParts(data: DataObject, path: string, options?: {
    formatMultiline?: boolean;
    isDebug?: boolean;
}): LOG;
