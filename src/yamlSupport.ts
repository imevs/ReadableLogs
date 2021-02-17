import { DataObject, DataObjectValues, FormattingType, LOG, LogItem, ValueType } from "./types";

const space = "  ";

function wrapLog(s: SafeString, path: string, newLine = true): LogItem {
    return {
        text: s + (newLine ? "\n" : ""),
        type: "" as FormattingType,
        path: path,
    };
}

function wrapKey(s: SafeString, path: string, newLine: boolean): LogItem {
    return {
        text: s + (newLine ? "\n" : ""),
        type: "key" as FormattingType,
        path: path,
    };
}

function normalizeString(str: string): SafeString {
    if (str.match(/^[\w]+$/)) {
        return str as SafeString;
    } else {
        return '"' + escape(str)
            .replace(/%u/g, "\\u")
            .replace(/%U/g, "\\U")
            .replace(/%/g, "\\x")
            + '"' as SafeString;
    }
}

type SafeString = string & { __brand: "safestring"; };
/* is needed to prevent cases of "" + {} */
function concatString(...args: string[]): SafeString {
    return args.join("") as SafeString;
}

function isSimpleType(ele: DataObjectValues): ele is ValueType {
    return typeof ele == "string" || ele == null || typeof ele == "number" || typeof ele == "boolean";
}

export function convertJsonToYaml(obj: DataObjectValues, path = ""): LOG {
    if (obj instanceof Array) {
        return convertArray(obj, path);
    } else if (isSimpleType(obj)) {
        return [convertSimpleTypes(obj, path)];
    } else {
        return convertObject(obj, path);
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
function assertNull( _param: undefined | null ) { }
function convertSimpleTypes(obj: ValueType, path: string): LogItem {
    if (typeof obj == "string") {
        return wrapLog(normalizeString(obj), path);
    } else if (typeof obj == "boolean") {
        return wrapLog(concatString(obj ? "true" : "false"), path);
    } else if (typeof obj == "number") {
        return wrapLog(concatString(obj.toString()), path);
    }
    assertNull(obj);
    return wrapLog(concatString("null"), path);
}

function convertArray(obj: (DataObject | ValueType)[], path: string) {
    if (obj.length === 0) {
        return [wrapLog(concatString("[]"), path)];
    }

    const result: LOG = [];
    obj.forEach((item, i) => {
        const newPath = concatString(path, ".", i.toString());
        convertJsonToYaml(item, newPath).forEach((recurseItem, j) => {
            result.push(wrapLog(concatString((j == 0 ? "- " : space)), newPath, false));
            result.push(recurseItem);
        });
    });
    return result;
}

function convertObject(obj: DataObject, path: string) {
    const result: LOG = [];
    Object.keys(obj).forEach(k => {
        const ele = obj[k];
        const propName = normalizeString(k);
        const newPath = concatString(path, ".", k);
        if (isSimpleType(ele)) {
            result.push(wrapKey(concatString(propName, ": "), newPath, false));
            result.push(convertSimpleTypes(ele, newPath));
        } else {
            result.push(wrapKey(concatString(propName, ": "), newPath, true));
            convertJsonToYaml(ele, newPath).forEach(recurseItem => {
                result.push(wrapLog(concatString(space), recurseItem.path, false));
                result.push(recurseItem);
            });
        }
    });
    return result;
}
