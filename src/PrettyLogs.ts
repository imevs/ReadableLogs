export type LOG = {
    text: string;
    type: FormattingType;
    path: string;
}[];
export type FormattingType = "key" | "added" | "changed" | "removed" | "";

type ValueType = string | number | boolean | undefined | null;
type DataObjectValues = ValueType | DataObject | DataObject[] | ValueType[];
export interface DataObject {
    [key: string]: DataObjectValues;
}

function isDifferent<T extends DataObjectValues>(obj1: T, obj2: T) {
    return JSON.stringify(obj1) !== JSON.stringify(obj2);
}

/**
 * It is not possible enable both showDifferences and formatMultiline
 */
export type Options = {
    highlightKeys: boolean;
    showDifferences?: true;
    formatMultiline?: false;
} | {
    highlightKeys: boolean;
    formatMultiline?: true;
    showDifferences?: false;
};

function serializeData(message: DataObjectValues | DataObject, options: Options) {
    if (options.formatMultiline) {
        return JSON.stringify(message, null, "  ");
    } else {
        return JSON.stringify(message);
    }
}

function highlightPartsOfMessage<T extends DataObject>(
    keys: (keyof T)[],
    message: T,
    prevMessage: undefined | T,
    options: Options,
): LOG {
    let res: LOG = [{
        text: serializeData(message, options),
        type: "",
        path: "",
    }];
    keys.forEach(key => {
        const path = `/${key}`;
        if (options.highlightKeys) {
            res = highlightSubMessage(`"${key}"`, res, "key", false, path);
        }
        const subMessage = message[key];
        if (options.showDifferences && prevMessage !== undefined) {

            if (prevMessage[key] !== undefined) {
                if (isDifferent(prevMessage[key], subMessage)) {
                    if (typeof subMessage === "object" && subMessage !== null && subMessage !== undefined) {
                        res = highlightSubObject(subMessage as DataObject, prevMessage[key] as DataObject, res, path, options);
                    } else {
                        res = highlightSubMessage(serializeData(subMessage, options), res, "changed", true, path);
                    }
                } else {
                    if (typeof subMessage === "object" && subMessage !== null && subMessage !== undefined) {
                        res = highlightSubObject(subMessage as DataObject, undefined, res, path, options);
                    }
                }
            } else {
                if (subMessage !== undefined) {
                    res = highlightSubMessage(serializeData(subMessage, options), res, "added", true, path);
                }
            }
        } else {
            if (typeof subMessage === "object" && subMessage !== null && subMessage !== undefined) {
                res = highlightSubObject(subMessage as DataObject, undefined, res, path, options);
            }
        }
    });
    return res;
}

function highlightSubObject<T extends DataObject>(
    subObject: T, prevObject: undefined | T, loggedParts: LOG, path: string, options: Options): LOG {
    let res = [...loggedParts];
    Object.keys(subObject).forEach((key) => {
        const subObjectPart = subObject[key];
        const updatedPath = path + `/${key}`;
        if (options.highlightKeys) {
            res = highlightSubMessage(`"${key}"`, res, "key", false, path);
        }
        if (prevObject === undefined) {
            if (typeof subObjectPart === "object" && subObjectPart !== null) {
                res = highlightSubObject(subObjectPart as DataObject,
                    undefined, res, updatedPath, options);
            }
        } else {
            if (prevObject[key] !== undefined) {
                if (isDifferent(subObjectPart, prevObject[key])) {
                    if (typeof subObjectPart === "object" && subObjectPart !== null) {
                        res = highlightSubObject(subObjectPart as DataObject,
                            prevObject[key] as DataObject, res, updatedPath, options);
                    } else {
                        res = highlightSubMessage(serializeData(subObjectPart, options),
                            res, "changed", true, updatedPath);
                    }
                }
            } else {
                res = highlightSubMessage(serializeData(subObjectPart, options),
                    res, "added", true, updatedPath);
            }
        }
    });
    return res;
}

function highlightSubMessage(
    partMsgString: string,
    loggedParts: LOG,
    type: FormattingType,
    isDifference: boolean,
    path: string,
): LOG {
    const result = loggedParts.reduce((acc, item, i) => {
        const parts = item.text.split(partMsgString);
        const SPLIT_MESSAGE_LENGTH = 2;
        if (parts.length >= SPLIT_MESSAGE_LENGTH && (!isDifference || path.startsWith(item.path))) {
            acc.push(
                { text: parts[0] as string, type: "", path: item.path },
            );
            parts.forEach((part, i) => {
                if (i > 0) {
                    acc.push(
                        { text: partMsgString, type: type, path: path },
                        { text: part as string, type: "", path: item.path }
                    );
                }
            });
        } else {
            acc.push(loggedParts[i]!);
        }
        return acc;
    }, [] as LOG);
    if (isDifference) {
        console.debug({ path, partMsgString, loggedParts, result });
    }
    return result;
}

export function parseMessage(data: DataObject, options?: { highlightKeys: boolean; formatMultiline?: boolean; }, prevMessage?: undefined): LOG;
export function parseMessage(data: DataObject, options: Options, prevMessage: DataObject): LOG;
export function parseMessage(data: DataObject, options: undefined | Options, prevMessage: undefined | DataObject): LOG {
    return highlightPartsOfMessage(Object.keys(data), data, prevMessage, options ?? { highlightKeys: true });
}

