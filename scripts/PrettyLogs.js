define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showLogsInBrowserConsole = exports.formatLogs = void 0;
    const colors = [
        "blue",
        "purple",
        "orange",
        "green"
    ];
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    function getColor() {
        return colors[getRandomIntInclusive(0, colors.length - 1)];
    }
    function isDifferent(obj1, obj2) {
        return JSON.stringify(obj1) !== JSON.stringify(obj2);
    }
    function highlightPartsOfMessage(keys, message, prevMessage, options) {
        let res = [{
                text: options.formatMultiline ?
                    JSON.stringify(message, null, '  ') :
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
                        res = highlightSubObject(subMessage, prevMessage[key], res, color, path);
                    }
                    else {
                        res = highlightSubMessage(JSON.stringify(subMessage), res, color, true, path);
                    }
                }
            }
        });
        return res;
    }
    function highlightSubObject(subObject, prevObject, loggedParts, color, path) {
        let res = loggedParts;
        Object.keys(subObject).forEach((key) => {
            const updatedPath = path + `/${key}`;
            if (prevObject[key] !== undefined) {
                if (isDifferent(subObject[key], prevObject[key])) {
                    if (typeof subObject[key] === "object" && subObject[key] !== null) {
                        res = highlightSubObject(subObject[key], prevObject[key], loggedParts, color, updatedPath);
                    }
                    else {
                        res = highlightSubMessage(JSON.stringify(subObject[key]), loggedParts, color, true, updatedPath);
                    }
                }
            }
            else {
                res = highlightSubMessage(JSON.stringify(subObject[key]), loggedParts, color, true, updatedPath);
            }
        });
        return res;
    }
    function highlightSubMessage(partMsgString, loggedParts, color, isDifference, path) {
        if (isDifference) {
            console.debug({ path, partMsgString, loggedParts });
        }
        return loggedParts.reduce((acc, item, i) => {
            const parts = item.text.split(partMsgString);
            const SPLIT_MESSAGE_LENGTH = 2;
            if (parts.length === SPLIT_MESSAGE_LENGTH && (!isDifference || path.startsWith(item.path))) {
                acc.push({ text: parts[0], color: "", path: item.path }, { text: partMsgString, color: color, path: path }, { text: parts[1], color: "", path: path });
            }
            else {
                acc.push(loggedParts[i]);
            }
            return acc;
        }, []);
    }
    function formatForLoggingInBrowser(prefix, result) {
        return [prefix + result.map(item => "%c" + item.text).join(""),
            ...(result.map(item => `color: ${item.color};`))];
    }
    function formatLogs(data) {
        const res = [];
        const messages = (Array.isArray(data) ? data : [data]);
        messages.forEach((message, i) => {
            const result = highlightPartsOfMessage(Object.keys(message), message, i === 0 ? undefined : (messages[i - 1]), { highlightKeys: true, showDifferences: true, formatMultiline: true });
            res.push(result);
        });
        if (!Array.isArray(data)) {
            return res[0];
        }
        return res;
    }
    exports.formatLogs = formatLogs;
    function showLogsInBrowserConsole(result) {
        (Array.isArray(result[0]) ? result : [result]).forEach(r => {
            console.info(...formatForLoggingInBrowser("Message: ", r));
        });
    }
    exports.showLogsInBrowserConsole = showLogsInBrowserConsole;
});
