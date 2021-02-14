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

function highlightPartsOfMessage<T extends DataObject>(message: T, prevMessage: undefined | T, options: Options): LOG {
    let res: LOG = [{ text: serializeData(message, options), type: "", path: "" }];
    if (options.highlightKeys) {
        res = highlightSubObjectKeys(message, res, "", options);
        res.forEach((item, index) => {
            if (item.path === "" && index > 0) {
                item.path = res[index - 1]!.path;
            }
        });
    }
    if (options.showDifferences && prevMessage !== undefined) {
        res = highlightSubObject(message, prevMessage, res, "", options);
        res = searchForRemovedData(message, prevMessage, res, "", options);
    }
    return res;
}

function highlightSubObject<T extends DataObject>(
    subObject: T, prevObject: T, loggedParts: LOG, path: string, options: Options): LOG {
    let res = [...loggedParts];
    Object.keys(subObject).forEach((key) => {
        if (prevObject === undefined) {
            return;
        } else {
            const subObjectPart = subObject[key];
            const updatedPath = path + `/${key}`;
            if (prevObject[key] !== undefined) {
                if (isDifferent(subObjectPart, prevObject[key])) {
                    if (typeof subObjectPart === "object" && subObjectPart !== null) {
                        res = highlightSubObject(subObjectPart as DataObject,
                            prevObject[key] as DataObject, res, updatedPath, options);
                    } else {
                        res = highlightSubMessage(
                            serializeData(subObjectPart, options), res, "changed", true, updatedPath);
                    }
                }
            } else {
                res = highlightSubMessage(
                    serializeData(subObjectPart, options), res, "added", true, updatedPath);
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
        const updatedPath = path + `/${key}`;
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

function highlightSubObjectKeys<T extends DataObject>(subObject: T, loggedParts: LOG, path: string, options: Options): LOG {
    let result = [...loggedParts];
    Object.keys(subObject).forEach((key) => {
        const newPath = path + `/${key}`;
        const subMessageValue = subObject[key];
        result = highlightSubMessage(`"${key}"`, result, "key", false, newPath);
        if (typeof subMessageValue === "object" && subMessageValue !== null) {
            result = highlightSubObjectKeys(subMessageValue as DataObject, result, newPath, options);
        }
    });
    return result;
}

function highlightSubMessage(
    partMsgString: string,
    loggedParts: LOG,
    type: FormattingType,
    isDifference: boolean,
    path: string,
): LOG {
    const result = loggedParts.reduce((acc, item, i) => {
        const parts = item.text.split(partMsgString).filter(part => part !== "");
        const SPLIT_MESSAGE_LENGTH = 2;
        if (!isDifference && parts.length >= SPLIT_MESSAGE_LENGTH ||
            isDifference && path.startsWith(item.path) && parts.length === SPLIT_MESSAGE_LENGTH
        ) {
            acc.push(
                { text: parts[0] as string, type: "", path: item.path },
            );
            parts.forEach((part, i) => {
                if (i > 0) {
                    acc.push(
                        { text: partMsgString, type: type, path: path },
                        { text: part as string, type: "", path: isDifference ? path : "" }
                    );
                }
            });
        } else {
            acc.push(loggedParts[i]!);
        }
        return acc;
    }, [] as LOG);
    console.debug({ path, partMsgString, loggedParts, result });
    return result;
}

export function parseMessage(data: DataObject, options?: { highlightKeys: boolean; formatMultiline?: boolean; }, prevMessage?: undefined): LOG;
export function parseMessage(data: DataObject, options: Options, prevMessage: DataObject): LOG;
export function parseMessage(data: DataObject, options: undefined | Options, prevMessage: undefined | DataObject): LOG {
    return highlightPartsOfMessage(data, prevMessage, options ?? { highlightKeys: true });
}

