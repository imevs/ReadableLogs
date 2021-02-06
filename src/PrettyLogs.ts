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

export type Options = {
    highlightKeys: boolean;
    showDifferences?: boolean;
    formatMultiline?: boolean;
}

function highlightPartsOfMessage<T extends DataObject>(
    keys: (keyof T)[],
    message: T,
    prevMessage: undefined | T,
    options: Options,
): LOG {
    let res: LOG = [{
        text: options.formatMultiline ?
            JSON.stringify(message, null, '  ') :
            JSON.stringify(message),
        type: "",
        path: "",
    }];
    keys.forEach(key => {
        const path = `/${key}`;
        if (options.highlightKeys) {
            res = highlightSubMessage(`"${key}"`, res, "key", false, path);
        }
        if (options.showDifferences && prevMessage !== undefined) {
            const subMessage = message[key];
            if (prevMessage[key] !== undefined && isDifferent(prevMessage[key], subMessage)) {
                if (typeof subMessage === "object" && subMessage !== null && subMessage !== undefined) {
                    res = highlightSubObject(subMessage as DataObject, prevMessage[key] as DataObject, res, path);
                } else {
                    res = highlightSubMessage(JSON.stringify(subMessage), res, "changed", true, path);
                }
            } else if (prevMessage[key] === undefined && subMessage !== undefined) {
                res = highlightSubMessage(JSON.stringify(subMessage), res, "added", true, path);
            }
        }
    });
    return res;
}

function highlightSubObject<T extends DataObject>(subObject: T, prevObject: T, loggedParts: LOG, path: string): LOG {
    let res = loggedParts;
    Object.keys(subObject).forEach((key) => {
        const updatedPath = path + `/${key}`;
        if (prevObject[key] !== undefined) {
            if (isDifferent(subObject[key], prevObject[key])) {
                if (typeof subObject[key] === "object" && subObject[key] !== null) {
                    res = highlightSubObject(subObject[key] as DataObject,
                        prevObject[key] as DataObject, loggedParts, updatedPath);
                } else {
                    res = highlightSubMessage(JSON.stringify(subObject[key]),
                        loggedParts, "changed", true, updatedPath);
                }
            }
        } else {
            res = highlightSubMessage(JSON.stringify(subObject[key]),
                loggedParts, "added", true, updatedPath);
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
    if (isDifference) {
        console.debug({ path, partMsgString, loggedParts });
    }
    return loggedParts.reduce((acc, item, i) => {
        const parts = item.text.split(partMsgString);
        const SPLIT_MESSAGE_LENGTH = 2;
        if (parts.length === SPLIT_MESSAGE_LENGTH && (!isDifference || path.startsWith(item.path))) {
            acc.push(
                { text: parts[0] as string, type: "", path: item.path },
                { text: partMsgString, type: type, path: path },
                { text: parts[1] as string, type: "", path: path }
            );
        } else {
            acc.push(loggedParts[i]!);
        }
        return acc;
    }, [] as LOG);
}

export function parseMessage(data: DataObject, options: Omit<Options, "showDifferences">, prevMessage?: undefined): LOG;
export function parseMessage(data: DataObject, options: Options, prevMessage: DataObject): LOG;
export function parseMessage(data: DataObject, options: Options, prevMessage: undefined | DataObject): LOG {
    return highlightPartsOfMessage(Object.keys(data), data, prevMessage, options);
}

