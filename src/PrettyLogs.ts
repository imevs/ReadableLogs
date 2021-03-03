import { DataObject, DataObjectValues, LOG } from "./types";

function isDifferent<T extends DataObjectValues>(obj1: T, obj2: T) {
    return JSON.stringify(obj1) !== JSON.stringify(obj2);
}

/**
 * It is not possible enable both showDifferences and formatMultiline
 */
export type Options = {
    isDebug?: boolean;
    showDifferences?: true;
    formatMultiline?: false;
} | {
    isDebug?: boolean;
    formatMultiline?: true;
    showDifferences?: false;
};

export const pathSeparator = "/";
function getNewPath(oldPath: string, key: string) {
    return oldPath + pathSeparator + key;
}

function serializeData(message: DataObjectValues, options: Options) {
    if (options.formatMultiline) {
        return JSON.stringify(message, null, "  ");
    } else {
        return JSON.stringify(message);
    }
}

export function highlightPartsOfMessage<T extends DataObject>(message: T, prevMessage: undefined | T, options: Options): LOG {
    let res: LOG = [{ text: serializeData(message, options), type: "", path: "" }];
    res = highlightJSONSyntax(message, res, "", options);
    res.forEach((item, index) => {
        if (item.path === "" && index > 0) {
            item.path = res[index - 1]!.path;
        }
    });
    if (options.showDifferences && prevMessage !== undefined) {
        res = highlightSubObject(message, prevMessage, res, "", options);
        res = searchForRemovedData(message, prevMessage, res, "", options);
    }
    return res;
}

export function highlightPartByPath<T extends DataObject>(message: T, path: string, options: Options): LOG {
    const res = highlightPartsOfMessage(message, undefined, options);
    return highlightAddedSubMessage(res, path, options);
}

function highlightSubObject<T extends DataObject>(
    subObject: T, prevObject: T, loggedParts: LOG, path: string, options: Options): LOG {
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
    subObject: T, prevObject: T, loggedParts: LOG, path: string, options: Options): LOG {
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

function highlightJSONSyntax<T extends DataObject>(subObject: T, loggedParts: LOG, path: string, options: Options): LOG {
    let result = [...loggedParts];
    Object.keys(subObject).forEach((key) => {
        const newPath = getNewPath(path, key);
        const subMessageValue = subObject[key];
        result = highlightSubMessage(`"${key}"`, result, "key", false, newPath, options);
        if (typeof subMessageValue === "object" && subMessageValue !== null) {
            result = highlightJSONSyntax(subMessageValue as DataObject, result, newPath, options);
        } else {
            result = highlightSubMessage(
                serializeData(subMessageValue, options), result, "value", false, newPath, options);
        }
    });
    return result;
}

function highlightAddedSubMessage(
    loggedParts: LOG,
    path: string,
    options: Options
): LOG {
    const result = loggedParts.reduce((acc, item) => {
        if (item.path.startsWith(path) && item.type !== "") {
            acc.push({ text: item.text, path: item.path, type: "added" });
        } else {
            acc.push(item);
        }
        return acc;
    }, [] as LOG);
    if (options.isDebug) {
        console.debug("highlightAddedSubMessage", { path, loggedParts, result });
    }
    return result;
}

function highlightSubMessage(
    partMsgString: string,
    loggedParts: LOG,
    type: "value" | "key" | "changed" | "removed" | "",
    isDifference: boolean,
    path: string,
    options: Options
): LOG {
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
    }, [] as LOG);
    if (options.isDebug) {
        console.debug("highlightSubMessage", { path, type, partMsgString, loggedParts, result });
    }
    return result;
}

function highlightErrorInMessage(
    loggedParts: LOG,
    path: string,
    options: Options,
    comment: string,
): LOG {
    const numberOfParts = loggedParts.filter(part => part.path.startsWith(path)).length;
    let i = 0;
    const result = loggedParts.reduce((acc, item) => {
        if (item.path.startsWith(path)) {
            i++;
            if (comment !== "" && numberOfParts === i) {
                if (options.formatMultiline) {
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
    }, [] as LOG);
    if (options.isDebug) {
        console.debug("highlightErrorInMessage", { path, loggedParts, result });
    }
    return result;
}

export function highlightErrorsInJson(data: DataObject, errors: {
    path: string; text: string;
}[], options: { formatMultiline?: boolean, isDebug?: boolean; } = {}): LOG {
    let result = highlightPartsOfMessage(data, undefined, options);
    errors.forEach(error => {
        result = highlightErrorInMessage(result, error.path, options,
            options.formatMultiline ? " // " + error.text : ` /* ${error.text} */ `);
    });

    if (options?.isDebug) {
        console.debug("highlightJsonParts", result);
    }
    return result;
}
