define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.convertJsonToYaml = void 0;
    const space = "  ";
    function wrapLog(s, path, newLine = true) {
        return {
            text: s + (newLine ? "\n" : ""),
            type: "",
            path: path,
        };
    }
    function wrapKey(s, path, newLine) {
        return {
            text: s + (newLine ? "\n" : ""),
            type: "key",
            path: path,
        };
    }
    function normalizeString(str) {
        if (str.match(/^[\w]+$/)) {
            return str;
        }
        else {
            return '"' + escape(str)
                .replace(/%u/g, "\\u")
                .replace(/%U/g, "\\U")
                .replace(/%/g, "\\x")
                + '"';
        }
    }
    function concatString(...args) {
        return args.join("");
    }
    function isSimpleType(ele) {
        return typeof ele == "string" || ele == null || typeof ele == "number" || typeof ele == "boolean";
    }
    function convertJsonToYaml(obj, path = "") {
        if (obj instanceof Array) {
            return convertArray(obj, path);
        }
        else if (isSimpleType(obj)) {
            return [convertSimpleTypes(obj, path)];
        }
        else {
            return convertObject(obj, path);
        }
    }
    exports.convertJsonToYaml = convertJsonToYaml;
    function assertNull(_param) { }
    function convertSimpleTypes(obj, path) {
        if (typeof obj == "string") {
            return wrapLog(normalizeString(obj), path);
        }
        else if (typeof obj == "boolean") {
            return wrapLog(concatString(obj ? "true" : "false"), path);
        }
        else if (typeof obj == "number") {
            return wrapLog(concatString(obj.toString()), path);
        }
        assertNull(obj);
        return wrapLog(concatString("null"), path);
    }
    function convertArray(obj, path) {
        if (obj.length === 0) {
            return [wrapLog(concatString("[]"), path)];
        }
        const result = [];
        obj.forEach((item, i) => {
            const newPath = concatString(path, ".", i.toString());
            convertJsonToYaml(item, newPath).forEach((recurseItem, j) => {
                result.push(wrapLog(concatString((j == 0 ? "- " : space)), newPath, false));
                result.push(recurseItem);
            });
        });
        return result;
    }
    function convertObject(obj, path) {
        const result = [];
        Object.keys(obj).forEach(k => {
            const ele = obj[k];
            const propName = normalizeString(k);
            const newPath = concatString(path, ".", k);
            if (isSimpleType(ele)) {
                result.push(wrapKey(concatString(propName, ": "), newPath, false));
                result.push(convertSimpleTypes(ele, newPath));
            }
            else {
                result.push(wrapKey(concatString(propName, ": "), newPath, true));
                convertJsonToYaml(ele, newPath).forEach(recurseItem => {
                    result.push(wrapLog(concatString(space), recurseItem.path, false));
                    result.push(recurseItem);
                });
            }
        });
        return result;
    }
});
