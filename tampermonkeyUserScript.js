var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
define("types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("yamlSupport", ["require", "exports"], function (require, exports) {
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
define("PrettyLogs", ["require", "exports"], function (require, exports) {
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
define("formattingUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.safeParse = exports.highlightTextInHtml = exports.removeHtmlEntities = exports.formatMultiLineTextAsHTML = exports.formatForLoggingInBrowser = exports.typeToColorMap = void 0;
    function color(s) {
        return s;
    }
    exports.typeToColorMap = {
        unknown: "",
        specialSymbols: "",
        value: "color: " + "lightgreen",
        string: "color: " + color("#008000"),
        number: "color: " + color("#0000FF"),
        boolean: "color: " + color("#08FFF5"),
        key: "color: " + color("#660E6A"),
        added: "color: " + "blue;background: grey",
        changed: "color: " + "lightgreen;text-decoration: underline",
        removed: "color: " + "red",
        error: "color: " + "red",
        annotation: "color: " + color("#808080"),
    };
    function getStyle(type) {
        return exports.typeToColorMap[type];
    }
    function formatForLoggingInBrowser(prefix, result, prefixColors = [], typeToStyleMap) {
        const getStyle = (type) => { var _a; return (_a = typeToStyleMap === null || typeToStyleMap === void 0 ? void 0 : typeToStyleMap[type]) !== null && _a !== void 0 ? _a : exports.typeToColorMap[type]; };
        const removedItems = result.filter(item => item.type === "removed");
        const notRemovedItems = result.filter(item => item.type !== "removed");
        return [
            prefix +
                notRemovedItems.map(item => "%c" + item.text).join("") +
                (removedItems.length > 0 ? "%c Removed: %c" : "") +
                removedItems.map(item => item.path + ":" + item.text)
                    .join(",").split("/").join("."),
            ...prefixColors,
            ...notRemovedItems.map(item => item.type !== "specialSymbols" ? `${getStyle(item.type)};` : ""),
            ...(removedItems.length > 0 ? ["", `${getStyle("removed")};`] : [])
        ];
    }
    exports.formatForLoggingInBrowser = formatForLoggingInBrowser;
    function showLegendForSyntaxHighlighting() {
        console.log(...formatForLoggingInBrowser("", [
            {
                type: "annotation",
                path: "root",
                text: "You are using ReadableLogs library, it sets specific styles to make logs more readable (you can specify your own colors in configuration):\n "
            },
            { type: "added", path: "root", text: "Added text" },
            { type: "annotation", path: "root", text: "   " },
            { type: "changed", path: "root", text: "Changed text" },
            { type: "annotation", path: "root", text: "   " },
            { type: "key", path: "root", text: '"keyOfObject"' },
            { type: "annotation", path: "root", text: "   String: " },
            { type: "string", path: "root", text: '"String of text"' },
            { type: "annotation", path: "root", text: "   Number: " },
            { type: "number", path: "root", text: "1234.567" },
            { type: "annotation", path: "root", text: "   Boolean: " },
            { type: "boolean", path: "root", text: "false" },
            { type: "annotation", path: "root", text: "   " },
            { type: "removed", path: "root", text: "removed text" }
        ]));
    }
    showLegendForSyntaxHighlighting();
    function formatMultiLineTextAsHTML(content) {
        return content.split(" ").join("&nbsp;").split("\n").join("<br />");
    }
    exports.formatMultiLineTextAsHTML = formatMultiLineTextAsHTML;
    function removeHtmlEntities(content) {
        return content.split(String.fromCharCode(160)).join(" ").split("<br />").join("\n");
    }
    exports.removeHtmlEntities = removeHtmlEntities;
    function highlightTextInHtml(messages) {
        const formattedMessages = (Array.isArray(messages[0]) ? messages : [messages]).map(message => {
            return message
                .filter(part => part.type !== "removed")
                .map(part => `<span style="${getStyle(part.type)};">${formatMultiLineTextAsHTML(part.text)}</span>`)
                .join("");
        });
        if (!Array.isArray(messages[0])) {
            return formattedMessages[0];
        }
        return "[<br>" + formattedMessages.join(",<br>") + "<br>]";
    }
    exports.highlightTextInHtml = highlightTextInHtml;
    function safeParse(data) {
        try {
            return data === "" ? undefined : JSON.parse(data);
        }
        catch (ex) {
            return undefined;
        }
    }
    exports.safeParse = safeParse;
});
define("index", ["require", "exports", "yamlSupport", "PrettyLogs", "PrettyLogs", "formattingUtils"], function (require, exports, yamlSupport_1, PrettyLogs_1, PrettyLogs_2, formattingUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.highlightJsonParts = exports.parseMessage = void 0;
    __exportStar(PrettyLogs_2, exports);
    __exportStar(formattingUtils_1, exports);
    function parseMessage(data, options = {}) {
        if (options.yaml) {
            return yamlSupport_1.convertJsonToYaml(data);
        }
        const result = PrettyLogs_1.highlightPartsOfMessage(data, options);
        if (options.isDebug) {
            console.debug("parseMessage", result);
        }
        return result;
    }
    exports.parseMessage = parseMessage;
    function highlightJsonParts(data, path, options = {}) {
        const result = PrettyLogs_1.highlightAddedSubMessage(PrettyLogs_1.highlightPartsOfMessage(data, options), path, options);
        if (options === null || options === void 0 ? void 0 : options.isDebug) {
            console.debug("highlightJsonParts", result);
        }
        return result;
    }
    exports.highlightJsonParts = highlightJsonParts;
});
define("tampermonkeyUserScript", ["require", "exports", "index"], function (require, exports, index_1) {
    "use strict";
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    Object.defineProperty(exports, "__esModule", { value: true });
    const passedFormattingOptions = window.formattingOptions;
    function enhanceLogger(logFunction, options, oldMessages, type) {
        return (args) => {
            const newArgs = args.map(logPart => {
                if (logPart !== null && typeof logPart === "object") {
                    const id = options.getMessageType(logPart, args, type);
                    if (id !== undefined) {
                        const annotations = options.validate(logPart);
                        const result = index_1.annotateDataInJson(logPart, annotations, {
                            showDiffWithObject: annotations.length ? undefined : oldMessages[id],
                            multiline: options.multiline,
                            isDebug: options.debug,
                        });
                        const filteredResult = options.excludeDataPathsFromMessage.length
                            ? result.filter(part => options.excludeDataPathsFromMessage.indexOf(part.path) === -1)
                            : result;
                        oldMessages[id] = logPart;
                        logFunction(...index_1.formatForLoggingInBrowser(options.prefix, filteredResult, [], options.colorsMap));
                    }
                }
                return logPart;
            });
            if (!options.replace) {
                return logFunction(...newArgs);
            }
        };
    }
    const formattingOptions = {
        colorsMap: (_a = passedFormattingOptions === null || passedFormattingOptions === void 0 ? void 0 : passedFormattingOptions.colorsMap) !== null && _a !== void 0 ? _a : undefined,
        maxMessageSize: (_b = passedFormattingOptions === null || passedFormattingOptions === void 0 ? void 0 : passedFormattingOptions.maxMessageSize) !== null && _b !== void 0 ? _b : 1000,
        replace: (_c = passedFormattingOptions === null || passedFormattingOptions === void 0 ? void 0 : passedFormattingOptions.replace) !== null && _c !== void 0 ? _c : false,
        debug: (_d = passedFormattingOptions === null || passedFormattingOptions === void 0 ? void 0 : passedFormattingOptions.debug) !== null && _d !== void 0 ? _d : false,
        multiline: (_e = passedFormattingOptions === null || passedFormattingOptions === void 0 ? void 0 : passedFormattingOptions.multiline) !== null && _e !== void 0 ? _e : false,
        mode: (_f = passedFormattingOptions === null || passedFormattingOptions === void 0 ? void 0 : passedFormattingOptions.mode) !== null && _f !== void 0 ? _f : "overrideConsole",
        getMessageType: (_g = passedFormattingOptions === null || passedFormattingOptions === void 0 ? void 0 : passedFormattingOptions.getMessageType) !== null && _g !== void 0 ? _g : (logPart => Object.keys(logPart)[0]),
        validate: (_h = passedFormattingOptions === null || passedFormattingOptions === void 0 ? void 0 : passedFormattingOptions.validate) !== null && _h !== void 0 ? _h : (() => ([])),
        excludeDataPathsFromMessage: (_j = passedFormattingOptions === null || passedFormattingOptions === void 0 ? void 0 : passedFormattingOptions.excludeDataPathsFromMessage) !== null && _j !== void 0 ? _j : [],
        prefix: (_k = passedFormattingOptions === null || passedFormattingOptions === void 0 ? void 0 : passedFormattingOptions.prefix) !== null && _k !== void 0 ? _k : "formatted json: "
    };
    if (formattingOptions.mode === "overrideConsole") {
        console.log("Logger methods replaced");
        const messagesHistory = {};
        window.console.log = enhanceLogger(console.log.bind(console), formattingOptions, messagesHistory, "console.log");
        window.console.info = enhanceLogger(console.info.bind(console), formattingOptions, messagesHistory, "console.info");
    }
    else if (formattingOptions.mode === "overrideWebsocket") {
        if (typeof wsHook !== undefined) {
            const outgoingMessagesHistory = {};
            const incomingMessagesHistory = {};
            wsHook.before = function (data) {
                const prefix = "outgoing: ";
                if (data.length > formattingOptions.maxMessageSize) {
                    console.log(prefix, data);
                    return data;
                }
                const json = index_1.safeParse(data);
                if (json !== undefined) {
                    enhanceLogger(console.log.bind(console), Object.assign(Object.assign({}, formattingOptions), { prefix: prefix, replace: true }), outgoingMessagesHistory, "outgoing")([json]);
                }
                return data;
            };
            wsHook.after = function (data) {
                const prefix = formattingOptions.prefix;
                if (data.data.length > formattingOptions.maxMessageSize) {
                    console.log(prefix, data.data);
                    return data;
                }
                const json = index_1.safeParse(data.data);
                if (json !== undefined) {
                    enhanceLogger(console.log.bind(console), Object.assign(Object.assign({}, formattingOptions), { replace: true }), incomingMessagesHistory, "incoming")([json]);
                }
                return data;
            };
            console.log("WebSocket methods replaced");
        }
        else {
            console.log("WebSocket methods are not replaced");
        }
    }
    window.annotateDataInJson = index_1.annotateDataInJson;
    window.formatForLoggingInBrowser = index_1.formatForLoggingInBrowser;
});
