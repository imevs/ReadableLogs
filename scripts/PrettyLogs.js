define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergeLogItems = exports.annotateDataInJson = exports.highlightAddedSubMessage = exports.highlightPartsOfMessage = exports.pathSeparator = void 0;
    function isEqual(obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }
    exports.pathSeparator = "/";
    function getNewPath(oldPath, key) {
        return (oldPath === "root" ? "" : oldPath) + exports.pathSeparator + key;
    }
    function serializeData(message, options) {
        if (options.multiline) {
            return JSON.stringify(message, null, "  ");
        }
        else {
            return JSON.stringify(message);
        }
    }
    function getItemType(type, text) {
        if (type !== "value") {
            return type;
        }
        if (!Number.isNaN(Number(text))) {
            return "number";
        }
        if (text === "true" || text === "false") {
            return "boolean";
        }
        return "string";
    }
    function highlightPartsOfMessage(message, options) {
        let result = [{
                text: typeof message === "string" ? message : serializeData(message, options),
                type: "unknown",
                path: "root",
            }];
        const messageAsObject = typeof message === "string" ? JSON.parse(message) : message;
        result = highlightSubObjectKeysAndValues(messageAsObject, result, "root", options);
        result.forEach((item, index) => {
            if (item.path === "root" && index > 0) {
                item.path = result[index - 1].path;
            }
        });
        if (options.showDiffWithObject !== undefined) {
            result = highlightSubObject(messageAsObject, options.showDiffWithObject, result, "root", options);
            result = searchForRemovedData(messageAsObject, options.showDiffWithObject, result, "root", options);
        }
        const res = mergeLogItems(result).map(item => (Object.assign(Object.assign({}, item), { type: getItemType(item.type, item.text) })));
        if (options.isDebug) {
            const outputText = res.filter(i => i.type !== "removed").map(r => r.text).join("");
            if (JSON.stringify(message) !== outputText) {
                console.error("Console output does not match the input", JSON.stringify(message), outputText);
            }
        }
        return res;
    }
    exports.highlightPartsOfMessage = highlightPartsOfMessage;
    function highlightSubObject(subObject, prevObject, loggedParts, path, options) {
        let result = [...loggedParts];
        if (prevObject === undefined) {
            return result;
        }
        Object.keys(subObject).forEach((key) => {
            const subObjectPart = subObject[key];
            const updatedPath = getNewPath(path, key);
            if (prevObject[key] !== undefined) {
                if (!isEqual(subObjectPart, prevObject[key])) {
                    if (typeof subObjectPart === "object" && subObjectPart !== null) {
                        result = highlightSubObject(subObjectPart, prevObject[key], result, updatedPath, options);
                    }
                    else {
                        result = highlightSubMessage(serializeData(subObjectPart, options), result, "changed", updatedPath, options);
                    }
                }
            }
            else {
                result = highlightAddedSubMessage(result, updatedPath, options);
            }
        });
        return result;
    }
    function searchForRemovedData(subObject, prevObject, loggedParts, path, options) {
        let result = [...loggedParts];
        Object.keys(prevObject).forEach(key => {
            const subMessage = subObject[key];
            const updatedPath = getNewPath(path, key);
            if (subMessage === undefined) {
                result.push({
                    type: "removed",
                    path: updatedPath,
                    text: serializeData(prevObject[key], options),
                });
            }
            else if (typeof subMessage === "object" && subMessage !== null) {
                result = searchForRemovedData(subMessage, prevObject[key], result, updatedPath, options);
            }
        });
        return result;
    }
    function highlightSubObjectKeysAndValues(subObject, loggedParts, path, options) {
        let result = [...loggedParts];
        Object.keys(subObject).forEach((key) => {
            const newPath = getNewPath(path, key);
            const subMessageValue = subObject[key];
            if (!Array.isArray(subObject)) {
                result = highlightSubMessage(`"${key}"`, result, "key", newPath, options);
            }
            if (subMessageValue !== null) {
                if (typeof subMessageValue === "object") {
                    result = highlightSubObjectKeysAndValues(subMessageValue, result, newPath, options);
                }
                else {
                    result = highlightSubMessage(JSON.stringify(subMessageValue), result, "value", newPath, options);
                }
            }
        });
        return result;
    }
    function highlightAddedSubMessage(loggedParts, path, options) {
        const result = injectMetaDataToMessage(loggedParts, path, options, "", "added");
        if (options.isDebug) {
            console.debug("highlightAddedSubMessage", { path, loggedParts, result });
        }
        return mergeLogItems(result);
    }
    exports.highlightAddedSubMessage = highlightAddedSubMessage;
    function highlightSubMessage(partMsgString, loggedParts, type, path, options) {
        const result = loggedParts.reduce((acc, item) => {
            if (item.type === "key" || type === "value" && item.path !== "root" && item.path !== path && !item.path.startsWith(path)) {
                acc.push(item);
                return acc;
            }
            const parts = item.text.split(partMsgString);
            const entriesCount = parts.length - 1;
            if (type === "changed" && entriesCount === 1 && path.startsWith(item.path)) {
                const [first, ...rest] = parts;
                acc.push({ text: first, type: "specialSymbols", path: path }, { text: partMsgString, type: type, path: path }, { text: rest.join(partMsgString), type: "specialSymbols", path: path });
            }
            else if (type !== "changed" && entriesCount >= 1) {
                const [first, ...rest] = parts;
                acc.push({ text: first, type: "specialSymbols", path: item.path }, { text: partMsgString, type: type, path: path }, { text: rest.join(partMsgString), type: "specialSymbols", path: "root" });
            }
            else if (partMsgString === item.text) {
                acc.push({ text: item.text, path: item.path, type: type });
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
    function injectMetaDataToMessage(input, path, options, comment, typeOfMetadata) {
        const numberOfParts = input.filter(part => part.path.startsWith(path)).length;
        let i = 0;
        const result = input.reduce((acc, item) => {
            if (item.path.startsWith(path)) {
                i++;
                if (comment !== "" && numberOfParts === i) {
                    if (options.multiline) {
                        const separator = "\n";
                        const splitText = item.text.split(separator);
                        acc.push({ text: splitText[0], path: item.path, type: typeOfMetadata });
                        acc.push({ text: comment + separator, path: path, type: "annotation" });
                        acc.push({ text: separator + splitText.slice(1).join(separator), path: item.path, type: typeOfMetadata });
                    }
                    else {
                        acc.push({ text: item.text, path: item.path, type: typeOfMetadata });
                        acc.push({ text: comment, path: path, type: "annotation" });
                    }
                    return acc;
                }
                acc.push({ text: item.text, path: item.path, type: typeOfMetadata });
            }
            else {
                acc.push(item);
            }
            return acc;
        }, []);
        if (options.isDebug) {
            console.debug("injectMetaDataToMessage", { path, input, result });
        }
        return result;
    }
    function annotateDataInJson(data, annotations, options = {}) {
        let result = highlightPartsOfMessage(data, options);
        annotations.forEach(annotation => {
            result = injectMetaDataToMessage(result, annotation.path, options, annotation.text.length ? (options.multiline ? " // " + annotation.text : ` /* ${annotation.text} */ `) : "", annotation.type);
        });
        if (options === null || options === void 0 ? void 0 : options.isDebug) {
            console.debug("annotateDataInJson", JSON.stringify(result), mergeLogItems(result));
        }
        return mergeLogItems(result);
    }
    exports.annotateDataInJson = annotateDataInJson;
    function mergeLogItems(logParts) {
        return logParts.reduce((all, item) => {
            const prevItem = all[all.length - 1];
            if (all.length > 1 && prevItem && prevItem.type === item.type && prevItem.path === item.path) {
                prevItem.text += item.text;
            }
            else {
                all.push(Object.assign({}, item));
            }
            return all;
        }, []);
    }
    exports.mergeLogItems = mergeLogItems;
});
