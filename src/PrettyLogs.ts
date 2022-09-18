import { DataObject, DataObjectValues, LogItem } from "./types";

function isDifferent<T extends DataObjectValues>(obj1: T, obj2: T) {
    return JSON.stringify(obj1) !== JSON.stringify(obj2);
}

export type Options = {
    isDebug?: boolean;
    showDiffWithObject?: DataObject;
    /**
     * It is not possible enable both showDiffWithObject and formatMultiline
     */
    multiline?: false;
} | {
    isDebug?: boolean;
    multiline?: true;
    showDiffWithObject?: undefined;
};

export const pathSeparator = "/";
function getNewPath(oldPath: string, key: string) {
    return oldPath + pathSeparator + key;
}

function serializeData(message: DataObjectValues, options: Options) {
    if (options.multiline) {
        return JSON.stringify(message, null, "  ");
    } else {
        return JSON.stringify(message);
    }
}

/**
 * Method analyzes provided message and builds its representation as array of sub-elements of different types
 *
 * Example:
 *  { "a": 1 } -> [
 *                 { path: "", text: "{", type: "specialSymbols" },
 *                 { path: "/a", text: '"a"', type: "key" },
 *                 { path: "/a", text: ":", type: "specialSymbols" },
 *                 { path: "/a", text: "1", type: "value" },
 *                 { path: "/a", text: "}", type: "specialSymbols" }
 *             ]
 **/
export function highlightPartsOfMessage<T extends DataObject>(message: T, options: Options): LogItem[] {
    let result: LogItem[] = [{ text: serializeData(message, options), type: "unknown", path: "" }];
    result = highlightSubObjectKeys(message, result, "", options);
    result.forEach((item, index) => {
        if (item.path === "" && index > 0) {
            item.path = result[index - 1]!.path;
        }
    });
    if (options.showDiffWithObject !== undefined) {
        result = highlightSubObject(message, options.showDiffWithObject, result, "", options);
        result = searchForRemovedData(message, options.showDiffWithObject, result, "", options);
    }
    return mergeLogItems(result);
}

function highlightSubObject<T extends DataObject>(
    subObject: T, prevObject: T, loggedParts: LogItem[], path: string, options: Options): LogItem[] {
    let result = [...loggedParts];
    Object.keys(subObject).forEach((key) => {
        if (prevObject === undefined) {
            return;
        } else {
            const subObjectPart = subObject[key];
            const updatedPath = getNewPath(path, key);
            if (prevObject[key] !== undefined) {
                if (isDifferent(subObjectPart, prevObject[key])) {
                    if (typeof subObjectPart === "object" && subObjectPart !== null) {
                        result = highlightSubObject(subObjectPart as DataObject,
                            prevObject[key] as DataObject, result, updatedPath, options);
                    } else {
                        result = highlightSubMessage(
                            serializeData(subObjectPart, options), result, "changed", true, updatedPath, options);
                    }
                }
            } else {
                result = highlightAddedSubMessage(result, updatedPath, options);
            }
        }
    });
    return result;
}

function searchForRemovedData<T extends DataObject>(
    subObject: T, prevObject: T, loggedParts: LogItem[], path: string, options: Options): LogItem[] {
    let result = [...loggedParts];
    Object.keys(prevObject).forEach(key => {
        const subMessage = subObject[key];
        const updatedPath = getNewPath(path, key);
        if (subMessage === undefined) {
            result.push({
                type: "removed",
                path: updatedPath,
                text: serializeData(prevObject[key], options),
            });
        } else if (typeof subMessage === "object" && subMessage !== null) {
            result = searchForRemovedData(subMessage as DataObject, prevObject[key] as DataObject, result, updatedPath, options);
        }
    });
    return result;
}

function highlightSubObjectKeys<T extends DataObject>(subObject: T, loggedParts: LogItem[], path: string, options: Options): LogItem[] {
    let result = [...loggedParts];
    Object.keys(subObject).forEach((key) => {
        const newPath = getNewPath(path, key);
        const subMessageValue = subObject[key];
        result = highlightSubMessage(`"${key}"`, result, "key", false, newPath, options);
        if (subMessageValue !== null) {
            if (typeof subMessageValue === "object") {
                result = highlightSubObjectKeys(subMessageValue as DataObject, result, newPath, options);
            } else {
                result = highlightSubMessage(`${subMessageValue}`, result, "value", false, newPath, options);
            }
        }
    });
    return result;
}

export function highlightAddedSubMessage(
    loggedParts: LogItem[],
    path: string,
    options: Options
): LogItem[] {
    const result = loggedParts.reduce((acc, item) => {
        if (item.path.startsWith(path)) {
            acc.push({ text: item.text, path: item.path, type: "added" });
        } else {
            acc.push(item);
        }
        return acc;
    }, [] as LogItem[]);
    if (options.isDebug) {
        console.debug("highlightAddedSubMessage", { path, loggedParts, result });
    }
    return mergeLogItems(result);
}

function highlightSubMessage(
    partMsgString: string,
    loggedParts: LogItem[],
    type: "key" | "changed" | "removed" | "specialSymbols" | "value",
    isDifference: boolean,
    path: string,
    options: Options
): LogItem[] {
    const result = loggedParts.reduce((acc, item) => {
        const SPLIT_MESSAGE_LENGTH = 2;
        const parts = item.text.split(partMsgString).filter(part => part !== "");
        if (!isDifference && parts.length >= SPLIT_MESSAGE_LENGTH ||
            isDifference && path.startsWith(item.path) && parts.length === SPLIT_MESSAGE_LENGTH
        ) {
            acc.push(
                { text: parts[0] as string, type: "specialSymbols", path: item.path },
            );
            acc.push(
                { text: partMsgString, type: type, path: path },
                { text: parts.slice(1).join(partMsgString) as string,
                    type: "specialSymbols", path: isDifference ? path : "" }
            );
        } else if (partMsgString === item.text) {
            acc.push({
                text: item.text,
                path: item.path,
                type: type,
            });
        } else {
            acc.push(item);
        }
        return acc;
    }, [] as LogItem[]);
    if (options.isDebug) {
        console.debug("highlightSubMessage", { path, type, partMsgString, loggedParts, result });
    }
    return result;
}

function highlightErrorInMessage(
    loggedParts: LogItem[],
    path: string,
    options: Options,
    comment: string,
): LogItem[] {
    const numberOfParts = loggedParts.filter(part => part.path.startsWith(path)).length;
    let i = 0;
    const result = loggedParts.reduce((acc, item) => {
        if (item.path.startsWith(path)) {
            i++;
            if (comment !== "" && numberOfParts === i) {
                if (options.multiline) {
                    const separator = "\n";
                    const splitText = item.text.split(separator);
                    acc.push({ text: splitText[0]!, path: item.path, type: "error" });
                    acc.push({ text: comment + separator, path: item.path, type: "commented" });
                    acc.push({ text: separator + splitText.slice(1).join(separator), path: item.path, type: "error" });
                } else {
                    acc.push({ text: item.text, path: item.path, type: "error" });
                    acc.push({ text: comment, path: item.path, type: "commented" });
                }
                return acc;
            }
            acc.push({ text: item.text, path: item.path, type: "error" });
        } else {
            acc.push(item);
        }
        return acc;
    }, [] as LogItem[]);
    if (options.isDebug) {
        console.debug("highlightErrorInMessage", { path, loggedParts, result });
    }
    return result;
}

export function highlightErrorsInJson(data: DataObject, errors: {
    path: string; text: string;
}[], options: { multiline?: boolean, isDebug?: boolean; } = {}): LogItem[] {
    let result = highlightPartsOfMessage(data, options);
    errors.forEach(error => {
        result = highlightErrorInMessage(result, error.path, options,
            options.multiline ? " // " + error.text : ` /* ${error.text} */ `);
    });

    if (options?.isDebug) {
        console.debug("highlightErrorsInJson", mergeLogItems(result));
    }
    return mergeLogItems(result);
}

/**
 * merge text content for consequent elements with same type and path
 * @param logParts
 */
function mergeLogItems(logParts: LogItem[]): LogItem[] {
    return logParts.reduce<LogItem[]>((all, item) => {
        if (all.length > 1 &&
            all[all.length - 1]!.type === item.type &&
            all[all.length - 1]!.path === item.path
        ) {
            all[all.length - 1]!.text += item.text;
        } else {
            all.push(item);
        }
        return all;
    }, []);
}
