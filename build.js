define("PrettyLogs", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showLog = void 0;
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
        let res = [{ text: JSON.stringify(message), color: "", path: "" }];
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
    function showLog(data) {
        data.forEach((event, i) => {
            const message = event.args;
            const result = highlightPartsOfMessage(Object.keys(message), message, i === 0 ? undefined : (data[i - 1]).args, { highlightKeys: true, showDifferences: true });
            console.log(result);
            console.warn(...formatForLoggingInBrowser("Message: ", result));
        });
    }
    exports.showLog = showLog;
});
define("testData", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.logs = void 0;
    exports.logs = [
        {
            args: {
                a: 1,
                b: "2",
                c: []
            },
        },
        {
            args: {
                a: 2,
                b: "3",
                c: ["4"]
            },
        },
    ];
});
define("demo", ["require", "exports", "PrettyLogs", "testData"], function (require, exports, PrettyLogs_1, testData_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    PrettyLogs_1.showLog(testData_1.logs);
});
