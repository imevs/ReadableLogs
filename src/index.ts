import { DataObject, LogItem } from "./types";
import { convertJsonToYaml } from "./yamlSupport";
import { highlightPartByPath, highlightPartsOfMessage } from "./PrettyLogs";

export * from "./PrettyLogs";
export * from "./formattingUtils";

export type ApiOptions = {
    yaml?: true;
} | {
    isDebug?: true;
    showDiffWithObject?: DataObject;
} | {
    isDebug?: true;
    multiline?: true;
};

type KeysOfUnion<T> = T extends T ? keyof T: never;
type AllOptions = { [K in KeysOfUnion<ApiOptions>]?: undefined; };

export function parseMessage(data: DataObject, options: ApiOptions = {}): LogItem[] {
    if ((options as AllOptions).yaml) {
        return convertJsonToYaml(data);
    }
    const result = highlightPartsOfMessage(data, (options as AllOptions));
    if ((options as AllOptions).isDebug) {
        console.debug("parseMessage", result);
    }
    return result;
}

/**
 *
 * @param data
 * @param path format /a/b/c
 * @param options
 */
export function highlightJsonParts(data: DataObject, path: string, options: { formatMultiline?: boolean; isDebug?: boolean; } = {}) {
    const result = highlightPartByPath(data, path, options);
    if (options?.isDebug) {
        console.debug("highlightJsonParts", result);
    }
    return result;
}