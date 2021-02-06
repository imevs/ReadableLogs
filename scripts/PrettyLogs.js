define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseMessage = void 0;
    function isDifferent(obj1, obj2) {
        return JSON.stringify(obj1) !== JSON.stringify(obj2);
    }
    function highlightPartsOfMessage(keys, message, prevMessage, options) {
        let res = [{
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
                        res = highlightSubObject(subMessage, prevMessage[key], res, path);
                    }
                    else {
                        res = highlightSubMessage(JSON.stringify(subMessage), res, "changed", true, path);
                    }
                }
                else if (prevMessage[key] === undefined && subMessage !== undefined) {
                    res = highlightSubMessage(JSON.stringify(subMessage), res, "added", true, path);
                }
            }
        });
        return res;
    }
    function highlightSubObject(subObject, prevObject, loggedParts, path) {
        let res = loggedParts;
        Object.keys(subObject).forEach((key) => {
            const updatedPath = path + `/${key}`;
            if (prevObject[key] !== undefined) {
                if (isDifferent(subObject[key], prevObject[key])) {
                    if (typeof subObject[key] === "object" && subObject[key] !== null) {
                        res = highlightSubObject(subObject[key], prevObject[key], loggedParts, updatedPath);
                    }
                    else {
                        res = highlightSubMessage(JSON.stringify(subObject[key]), loggedParts, "changed", true, updatedPath);
                    }
                }
            }
            else {
                res = highlightSubMessage(JSON.stringify(subObject[key]), loggedParts, "added", true, updatedPath);
            }
        });
        return res;
    }
    function highlightSubMessage(partMsgString, loggedParts, type, isDifference, path) {
        if (isDifference) {
            console.debug({ path, partMsgString, loggedParts });
        }
        return loggedParts.reduce((acc, item, i) => {
            const parts = item.text.split(partMsgString);
            const SPLIT_MESSAGE_LENGTH = 2;
            if (parts.length === SPLIT_MESSAGE_LENGTH && (!isDifference || path.startsWith(item.path))) {
                acc.push({ text: parts[0], type: "", path: item.path }, { text: partMsgString, type: type, path: path }, { text: parts[1], type: "", path: path });
            }
            else {
                acc.push(loggedParts[i]);
            }
            return acc;
        }, []);
    }
    function parseMessage(data, options, prevMessage) {
        return highlightPartsOfMessage(Object.keys(data), data, prevMessage, options);
    }
    exports.parseMessage = parseMessage;
});
