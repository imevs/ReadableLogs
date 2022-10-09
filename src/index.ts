import { DataObject, LogItem } from "./types";
import { convertJsonToYaml } from "./yamlSupport";
import { highlightAddedSubMessage, highlightPartsOfMessage } from "./PrettyLogs";

export * from "./PrettyLogs";
export * from "./formattingUtils";

export type ApiOptions = {
    yaml?: true;
} | {
    isDebug?: true;
    showDiffWithObject?: DataObject;
    multiline?: boolean;
};

type KeysOfUnion<T> = T extends T ? keyof T: never;
type AllOptions = { [K in KeysOfUnion<ApiOptions>]?: undefined; };

export function parseMessage(data: DataObject | string, options: ApiOptions = {}): LogItem[] {
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
 * Marks elements of provided object "data" with type "added" for given json path to elements
 * @param data
 * @param path format /a/b/c
 * @param options
 */
export function highlightJsonParts(data: DataObject, path: string, options: { formatMultiline?: boolean; isDebug?: boolean; } = {}) {
    const result = highlightAddedSubMessage(highlightPartsOfMessage(data, options), path, options);
    if (options?.isDebug) {
        console.debug("highlightJsonParts", result);
    }
    return result;
}