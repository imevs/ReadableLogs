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
 *                 { path: "", text: "{", type: "" },
 *                 { path: "/a", text: '"a"', type: "key" },
 *                 { path: "/a", text: ":1}", type: "" }
 *             ]
 **/
export function highlightPartsOfMessage<T extends DataObject>(message: T, options: Options): LogItem[] {
    let res: LogItem[] = [{ text: serializeData(message, options), type: "", path: "" }];
    res = highlightSubObjectKeys(message, res, "", options);
    res.forEach((item, index) => {
        if (item.path === "" && index > 0) {
            item.path = res[index - 1]!.path;
        }
    });
    if (options.showDiffWithObject !== undefined) {
        res = highlightSubObject(message, options.showDiffWithObject, res, "", options);
        res = searchForRemovedData(message, options.showDiffWithObject, res, "", options);
    }
    return res;
}

export function highlightPartByPath<T extends DataObject>(message: T, path: string, options: Options): LogItem[] {
    const res = highlightPartsOfMessage(message, options);
    return highlightAddedSubMessage(res, path, options);
}

function highlightSubObject<T extends DataObject>(
    subObject: T, prevObject: T, loggedParts: LogItem[], path: string, options: Options): LogItem[] {
    let res = [...loggedParts];
    Object.keys(subObject).forEach((key) => {
        if (prevObject === undefined) {
            return;
        } else {
            const subObjectPart = subObject[key];
            const updatedPath = getNewPath(path, key);
            if (prevObject[key] !== undefined) {
                if (isDifferent(subObjectPart, prevObject[key])) {
                    if (typeof subObjectPart === "object" && subObjectPart !== null) {
                        res = highlightSubObject(subObjectPart as DataObject,
                            prevObject[key] as DataObject, res, updatedPath, options);
                    } else {
                        res = highlightSubMessage(
                            serializeData(subObjectPart, options), res, "changed", true, updatedPath, options);
                    }
                }
            } else {
                res = highlightAddedSubMessage(res, updatedPath, options);
            }
        }
    });
    return res;
}

function searchForRemovedData<T extends DataObject>(
    subObject: T, prevObject: T, loggedParts: LogItem[], path: string, options: Options): LogItem[] {
    let res = [...loggedParts];
    Object.keys(prevObject).forEach(key => {
        const subMessage = subObject[key];
        const updatedPath = getNewPath(path, key);
        if (subMessage === undefined) {
            res.push({
                type: "removed",
                path: updatedPath,
                text: serializeData(prevObject[key], options),
            });
        } else if (typeof subMessage === "object" && subMessage !== null) {
            res = searchForRemovedData(subMessage as DataObject, prevObject[key] as DataObject, res, updatedPath, options);
        }
    });
    return res;
}

function highlightSubObjectKeys<T extends DataObject>(subObject: T, loggedParts: LogItem[], path: string, options: Options): LogItem[] {
    let result = [...loggedParts];
    Object.keys(subObject).forEach((key) => {
        const newPath = getNewPath(path, key);
        const subMessageValue = subObject[key];
        result = highlightSubMessage(`"${key}"`, result, "key", false, newPath, options);
        if (typeof subMessageValue === "object" && subMessageValue !== null) {
            result = highlightSubObjectKeys(subMessageValue as DataObject, result, newPath, options);
        }
    });
    return result;
}

function highlightAddedSubMessage(
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
    return result;
}

function highlightSubMessage(
    partMsgString: string,
    loggedParts: LogItem[],
    type: "key" | "changed" | "removed" | "",
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
                { text: parts[0] as string, type: "", path: item.path },
            );
            acc.push(
                { text: partMsgString, type: type, path: path },
                { text: parts.slice(1).join(partMsgString) as string,
                    type: "", path: isDifference ? path : "" }
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
}[], options: { formatMultiline?: boolean, isDebug?: boolean; } = {}): LogItem[] {
    let result = highlightPartsOfMessage(data, options);
    errors.forEach(error => {
        result = highlightErrorInMessage(result, error.path, options,
            options.formatMultiline ? " // " + error.text : ` /* ${error.text} */ `);
    });

    if (options?.isDebug) {
        console.debug("highlightErrorsInJson", result);
    }
    return result;
}
