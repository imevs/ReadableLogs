type LOG = {
    text: string;
    color: Color;
    path: string;
}[];
type Color = "red" | "blue" | "purple" | "orange" | "green" | "";

type ValueType = string | number | boolean | undefined | null;
type DataObjectValues = ValueType | DataObject | DataObject[] | ValueType[];
export interface DataObject {
    [key: string]: DataObjectValues;
}

const colors: Color[] = [
    "blue",
    "purple",
    "orange",
    "green"
];

function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getColor(): Color {
    return colors[getRandomIntInclusive(0, colors.length - 1)] as Color;
}

function isDifferent<T extends DataObjectValues>(obj1: T, obj2: T) {
    return JSON.stringify(obj1) !== JSON.stringify(obj2);
}

type Options = {
    highlightKeys: boolean;
    showDifferences: boolean;
    formatMultiline: boolean;
}

function highlightPartsOfMessage<T extends DataObject>(
    keys: (keyof T)[],
    message: T,
    prevMessage: undefined | T,
    options: Options,
): LOG {
    let res: LOG = [{
        text: options.formatMultiline ?
            JSON.stringify(message, null, ' ') :
            JSON.stringify(message),
        color: "",
        path: "",
    }];
    keys.forEach(key => {
        const path = `/${key}`;
        if (options.highlightKeys) {
            res = highlightSubMessage(`"${key}"`, res, "red", false, path);
        }
        if (options.showDifferences) {
            if (prevMessage !== undefined && prevMessage[key] !== undefined &&
                isDifferent(prevMessage[key], message[key])) {
                const subMessage = message[key];
                const color = getColor();
                if (typeof subMessage === "object" && subMessage !== null && subMessage !== undefined) {
                    res = highlightSubObject(subMessage as DataObject, prevMessage[key] as DataObject, res, color, path);
                } else {
                    res = highlightSubMessage(JSON.stringify(subMessage), res, color, true, path);
                }
            }
        }
    });
    return res;
}

function highlightSubObject<T extends DataObject>(subObject: T, prevObject: T, loggedParts: LOG, color: Color, path: string): LOG {
    let res = loggedParts;
    Object.keys(subObject).forEach((key) => {
        const updatedPath = path + `/${key}`;
        if (prevObject[key] !== undefined) {
            if (isDifferent(subObject[key], prevObject[key])) {
                if (typeof subObject[key] === "object" && subObject[key] !== null) {
                    res = highlightSubObject(subObject[key] as DataObject,
                        prevObject[key] as DataObject, loggedParts, color, updatedPath);
                } else {
                    res = highlightSubMessage(JSON.stringify(subObject[key]),
                        loggedParts, color, true, updatedPath);
                }
            }
        } else {
            res = highlightSubMessage(JSON.stringify(subObject[key]),
                loggedParts, color, true, updatedPath);
        }
    });
    return res;
}

function highlightSubMessage(
    partMsgString: string,
    loggedParts: LOG,
    color: Color,
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
                { text: parts[0] as string, color: "", path: item.path },
                { text: partMsgString, color: color, path: path },
                { text: parts[1] as string, color: "", path: path }
            );
        } else {
            acc.push(loggedParts[i]!);
        }
        return acc;
    }, [] as LOG);
}

function formatForLoggingInBrowser(prefix: string, result: LOG) {
    return [prefix + result.map(item => "%c" + item.text).join(""),
        ...(result.map(item => `color: ${item.color};`))];
}

export function showLog(data: DataObject[]) {
    data.forEach((event, i) => {
        const message = event;
        const result = highlightPartsOfMessage(
            Object.keys(message),
            message,
            i === 0 ? undefined : (data[i - 1]!),
            { highlightKeys: true, showDifferences: true, formatMultiline: true },
        );
        console.info(...formatForLoggingInBrowser("Message: ", result));
    });
}

