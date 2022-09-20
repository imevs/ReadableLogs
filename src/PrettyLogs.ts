import { DataObject, DataObjectValues, FormattingType, LogItem } from "./types";

function isDifferent<T extends DataObjectValues>(obj1: T, obj2: T) {
    return JSON.stringify(obj1) !== JSON.stringify(obj2);
}

export type Options = {
    isDebug?: boolean;
    showDiffWithObject?: DataObject;
    multiline?: boolean;
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
    const result = injectMetaDataToMessage(loggedParts, path, options, "", "added");
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

function injectMetaDataToMessage(
    input: LogItem[],
    path: string,
    options: Options,
    comment: string,
    typeOfMetadata: FormattingType,
): LogItem[] {
    const numberOfParts = input.filter(part => part.path.startsWith(path)).length;
    let i = 0;
    const result = input.reduce((acc, item) => {
        if (item.path.startsWith(path)) {
            i++;
            if (comment !== "" && numberOfParts === i) {
                if (options.multiline) {
                    const separator = "\n";
                    const splitText = item.text.split(separator);
                    acc.push({ text: splitText[0]!, path: item.path, type: typeOfMetadata });
                    acc.push({ text: comment + separator, path: path, type: "annotation" });
                    acc.push({ text: separator + splitText.slice(1).join(separator), path: item.path, type: typeOfMetadata });
                } else {
                    acc.push({ text: item.text, path: item.path, type: typeOfMetadata });
                    acc.push({ text: comment, path: path, type: "annotation" });
                }
                return acc;
            }
            acc.push({ text: item.text, path: item.path, type: typeOfMetadata });
        } else {
            acc.push(item);
        }
        return acc;
    }, [] as LogItem[]);
    if (options.isDebug) {
        console.debug("injectMetaDataToMessage", { path, input, result });
    }
    return result;
}

/**
 * Method adds extra information in data object representation,
 * e.g. could be used to mark some part of message as an error,
 * additionally it could be annotated with text comment,
 * This method is used for showing errors in JSON document when it is not satisfying to its JSON schema
 **/
export function annotateDataInJson(data: DataObject, annotations: LogItem[], options: Options = {}): LogItem[] {
    let result = highlightPartsOfMessage(data, options);
    annotations.forEach(annotation => {
        result = injectMetaDataToMessage(
            result,
            annotation.path,
            options,
            annotation.text.length ? (options.multiline ? " // " + annotation.text : ` /* ${annotation.text} */ `) : "",
            annotation.type
        );
    });

    if (options?.isDebug) {
        console.debug("annotateDataInJson", JSON.stringify(result), mergeLogItems(result));
    }
    return mergeLogItems(result);
}

/**
 * merge text content for consequent elements with same type and path
 * @param logParts
 */
export function mergeLogItems(logParts: LogItem[]): LogItem[] {
    return logParts.reduce<LogItem[]>((all, item) => {
        const prevItem = all[all.length - 1];
        if (all.length > 1 && prevItem && prevItem.type === item.type && prevItem.path === item.path) {
            prevItem.text += item.text;
        } else {
            all.push({...item });
        }
        return all;
    }, []);
}
