define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.highlightErrorsInJson = exports.highlightPartByPath = exports.highlightPartsOfMessage = exports.pathSeparator = void 0;
    function isDifferent(obj1, obj2) {
        return JSON.stringify(obj1) !== JSON.stringify(obj2);
    }
    exports.pathSeparator = "/";
    function getNewPath(oldPath, key) {
        return oldPath + exports.pathSeparator + key;
    }
    function serializeData(message, options) {
        if (options.multiline) {
            return JSON.stringify(message, null, "  ");
        }
        else {
            return JSON.stringify(message);
        }
    }
    function highlightPartsOfMessage(message, options) {
        let res = [{ text: serializeData(message, options), type: "", path: "" }];
        res = highlightSubObjectKeys(message, res, "", options);
        res.forEach((item, index) => {
            if (item.path === "" && index > 0) {
                item.path = res[index - 1].path;
            }
        });
        if (options.showDiffWithObject !== undefined) {
            res = highlightSubObject(message, options.showDiffWithObject, res, "", options);
            res = searchForRemovedData(message, options.showDiffWithObject, res, "", options);
        }
        return res;
    }
    exports.highlightPartsOfMessage = highlightPartsOfMessage;
    function highlightPartByPath(message, path, options) {
        const res = highlightPartsOfMessage(message, options);
        return highlightAddedSubMessage(res, path, options);
    }
    exports.highlightPartByPath = highlightPartByPath;
    function highlightSubObject(subObject, prevObject, loggedParts, path, options) {
        let res = [...loggedParts];
        Object.keys(subObject).forEach((key) => {
            if (prevObject === undefined) {
                return;
            }
            else {
                const subObjectPart = subObject[key];
                const updatedPath = getNewPath(path, key);
                if (prevObject[key] !== undefined) {
                    if (isDifferent(subObjectPart, prevObject[key])) {
                        if (typeof subObjectPart === "object" && subObjectPart !== null) {
                            res = highlightSubObject(subObjectPart, prevObject[key], res, updatedPath, options);
                        }
                        else {
                            res = highlightSubMessage(serializeData(subObjectPart, options), res, "changed", true, updatedPath, options);
                        }
                    }
                }
                else {
                    res = highlightAddedSubMessage(res, updatedPath, options);
                }
            }
        });
        return res;
    }
    function searchForRemovedData(subObject, prevObject, loggedParts, path, options) {
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
            }
            else if (typeof subMessage === "object" && subMessage !== null) {
                res = searchForRemovedData(subMessage, prevObject[key], res, updatedPath, options);
            }
        });
        return res;
    }
    function highlightSubObjectKeys(subObject, loggedParts, path, options) {
        let result = [...loggedParts];
        Object.keys(subObject).forEach((key) => {
            const newPath = getNewPath(path, key);
            const subMessageValue = subObject[key];
            result = highlightSubMessage(`"${key}"`, result, "key", false, newPath, options);
            if (typeof subMessageValue === "object" && subMessageValue !== null) {
                result = highlightSubObjectKeys(subMessageValue, result, newPath, options);
            }
        });
        return result;
    }
    function highlightAddedSubMessage(loggedParts, path, options) {
        const result = loggedParts.reduce((acc, item) => {
            if (item.path.startsWith(path)) {
                acc.push({ text: item.text, path: item.path, type: "added" });
            }
            else {
                acc.push(item);
            }
            return acc;
        }, []);
        if (options.isDebug) {
            console.debug("highlightAddedSubMessage", { path, loggedParts, result });
        }
        return result;
    }
    function highlightSubMessage(partMsgString, loggedParts, type, isDifference, path, options) {
        const result = loggedParts.reduce((acc, item) => {
            const SPLIT_MESSAGE_LENGTH = 2;
            const parts = item.text.split(partMsgString).filter(part => part !== "");
            if (!isDifference && parts.length >= SPLIT_MESSAGE_LENGTH ||
                isDifference && path.startsWith(item.path) && parts.length === SPLIT_MESSAGE_LENGTH) {
                acc.push({ text: parts[0], type: "", path: item.path });
                acc.push({ text: partMsgString, type: type, path: path }, { text: parts.slice(1).join(partMsgString), type: "", path: isDifference ? path : "" });
            }
            else if (partMsgString === item.text) {
                acc.push({
                    text: item.text,
                    path: item.path,
                    type: type,
                });
            }
            else {
                acc.push(item);
            }
            return acc;
        }, []);
        if (options.isDebug) {
            console.debug("highlightSubMessage", { path, type, partMsgString, loggedParts, result });
        }
        return result;
    }
    function highlightErrorInMessage(loggedParts, path, options, comment) {
        const numberOfParts = loggedParts.filter(part => part.path.startsWith(path)).length;
        let i = 0;
        const result = loggedParts.reduce((acc, item) => {
            if (item.path.startsWith(path)) {
                i++;
                if (comment !== "" && numberOfParts === i) {
                    if (options.multiline) {
                        const separator = "\n";
                        const splitText = item.text.split(separator);
                        acc.push({ text: splitText[0], path: item.path, type: "error" });
                        acc.push({ text: comment + separator, path: item.path, type: "commented" });
                        acc.push({ text: separator + splitText.slice(1).join(separator), path: item.path, type: "error" });
                    }
                    else {
                        acc.push({ text: item.text, path: item.path, type: "error" });
                        acc.push({ text: comment, path: item.path, type: "commented" });
                    }
                    return acc;
                }
                acc.push({ text: item.text, path: item.path, type: "error" });
            }
            else {
                acc.push(item);
            }
            return acc;
        }, []);
        if (options.isDebug) {
            console.debug("highlightErrorInMessage", { path, loggedParts, result });
        }
        return result;
    }
    function highlightErrorsInJson(data, errors, options = {}) {
        let result = highlightPartsOfMessage(data, options);
        errors.forEach(error => {
            result = highlightErrorInMessage(result, error.path, options, options.formatMultiline ? " // " + error.text : ` /* ${error.text} */ `);
        });
        if (options === null || options === void 0 ? void 0 : options.isDebug) {
            console.debug("highlightErrorsInJson", result);
        }
        return result;
    }
    exports.highlightErrorsInJson = highlightErrorsInJson;
});
