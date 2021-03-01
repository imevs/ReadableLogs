import { DataObject, LOG } from "./types";
import { convertJsonToYaml } from "./yamlSupport";
import { highlightPartByPath, highlightPartsOfMessage, Options } from "./PrettyLogs";

export * from "./PrettyLogs";
export * from "./formattingUtils";

export function parseMessage(data: DataObject, options: undefined, prevMessage: undefined, yaml: true): LOG;
export function parseMessage(
    data: DataObject, options?: { formatMultiline?: boolean; }, prevMessage?: undefined, yaml?: false
): LOG;
export function parseMessage(data: DataObject, options: Options, prevMessage: DataObject, yaml?: false): LOG;
export function parseMessage(
    data: DataObject,
    options: undefined | Options,
    prevMessage: undefined | DataObject,
    yaml: undefined | boolean
): LOG {
    if (yaml) {
        return convertJsonToYaml(data);
    }
    const result = highlightPartsOfMessage(data, prevMessage, options ?? { });
    if (options?.isDebug) {
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