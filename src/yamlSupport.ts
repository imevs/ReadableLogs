import { DataObject, DataObjectValues, FormattingType, LOG, ValueType } from "./types";

const space = "  ";

function wrapLog(s: string, nextLine = true) {
    return {
        text: s + (nextLine ? "\n" : ""),
        type: "" as FormattingType,
        path: "",
        toString() {
            return s;
        }
    };
}

function wrapKey(s: string, nextLine = false) {
    return {
        text: s + (nextLine ? "\n" : ""),
        type: "key" as FormattingType,
        path: "",
        toString() {
            return s;
        }
    };
}

function convert(obj: DataObjectValues, result: LOG) {
    if (obj instanceof Array) {
        convertArray(obj, result);
    } else if (typeof obj == "string") {
        result.push(wrapLog(normalizeString(obj)));
    } else if (typeof obj == "boolean") {
        result.push(wrapLog(obj ? "true" : "false"));
    } else if (typeof obj == "number") {
        result.push(wrapLog(obj.toString()));
    } else if (typeof obj == "undefined" || obj === null) {
        result.push(wrapLog("null"));
    } else {
        convertObject(obj, result);
    }
}

function convertArray(obj: DataObject[] | ValueType[], result: LOG) {
    if (obj.length === 0) {
        result.push(wrapLog("[]"));
    }
    obj.forEach((item: DataObject | ValueType) => {
        const recurse: LOG = [];
        convert(item, recurse);
        recurse.forEach((recurseItem, j) => {
            result.push(wrapLog(j == 0 ? "- " : space, false));
            result.push(recurseItem);
        });
    });
}

function convertObject(obj: DataObject, result: LOG) {
    Object.keys(obj).forEach(k => {
        const recurse: LOG = [];
        const ele = obj[k];
        convert(ele, recurse);
        if (typeof ele == "string" || ele == null || typeof ele == "number" || typeof ele == "boolean") {
            result.push(wrapKey(normalizeString(k) + ": "));
            result.push(wrapLog("" + recurse[0]));
        } else {
            result.push(wrapKey(normalizeString(k) + ": ", true));
            recurse.forEach(recurseItem => {
                result.push(wrapLog(space, false));
                result.push(recurseItem);
            });
        }
    });
}

function normalizeString(str: string) {
    if (str.match(/^[\w]+$/)) {
        return str;
    } else {
        return '"' + escape(str)
            .replace(/%u/g, "\\u")
            .replace(/%U/g, "\\U")
            .replace(/%/g, "\\x")
            + '"';
    }
}

export const convertJsonToYaml = (obj: DataObject): LOG => {
    const result: LOG = [];
    convert(obj, result);
    return result;
};
