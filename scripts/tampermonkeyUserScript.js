define(["require", "exports", "./index"], function (require, exports, index_1) {
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
