import { highlightPartsOfMessage, formatForLoggingInBrowser } from "./index";
import { DataObject, DataObjectValues } from "./types";

type FormattingOptions = {
    mode: "overrideConsole" | "overrideWebsocket";
    /**
     * Adds prefix for logged value, useful for filtering only needed entries in console
     */
    prefix: string;
    /**
     * getMessageType identifies objects of same type, it allows to track changes in objects
     * if undefined is returned - message will not be formatted
     */
    getMessageType(input: DataObject, wholeLogMessage: any[]): undefined | string;
};

/**
 * formattingOptions are to be provided in tamperMonkey script to customize behaviour of user script,
 * see example at /userScripts/overrideConsoleLogging.js
 */
const passedFormattingOptions = (window as any).formattingOptions as Partial<FormattingOptions>;

function enhanceLogger(logFunction: typeof console.log, options: FormattingOptions, oldMessages: Record<string, DataObject>) {
    return (args: DataObjectValues[]) => {
        const newArgs = args.map(logPart => {
            if (logPart !== null && typeof logPart === "object") {
                const id = options.getMessageType(logPart as DataObject, args);
                if (id !== undefined) {
                    const result = highlightPartsOfMessage(logPart as DataObject,
                        oldMessages[id] !== undefined ? { showDiffWithObject: oldMessages[id] } : { multiline: true });
                    oldMessages[id] = logPart as DataObject;
                    logFunction(...formatForLoggingInBrowser(options.prefix, result));
                }
            }
            return logPart;
        });
        return logFunction(...newArgs);
    };
}

const formattingOptions: FormattingOptions = {
    mode: passedFormattingOptions.mode ?? "overrideConsole",
    getMessageType: passedFormattingOptions.getMessageType ?? (logPart => Object.keys(logPart)[0]),
    prefix: passedFormattingOptions.prefix ?? "formatted json: "
};

if (formattingOptions.mode === "overrideConsole") {
    console.log("Logger methods replaced");
    const messagesHistory: Record<string, DataObject> = {};
    window.console.log = enhanceLogger(console.log.bind(console), formattingOptions, messagesHistory);
    window.console.info = enhanceLogger(console.info.bind(console), formattingOptions, messagesHistory);
} else if (formattingOptions.mode === "overrideWebsocket") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (wsHook) { // wsHook is provided by https://cdn.rawgit.com/skepticfx/wshook/master/wsHook.js
        const outgoingMessagesHistory: Record<string, DataObject> = {};
        const incomingMessagesHistory: Record<string, DataObject> = {};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        wsHook.before = function (data: string) {
            let json = undefined;
            try { json = JSON.parse(data); } catch (ex) { /* not a json message */ }
            if (json !== undefined) {
                enhanceLogger(
                    console.log.bind(console),
                    { ...formattingOptions, prefix: "outgoing: " },
                    outgoingMessagesHistory,
                )([json]);
            }
            return data;
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        wsHook.after = function (data: { data: string; }) {
            let json = undefined;
            try { json = JSON.parse(data.data); } catch (ex) { /* not a json message */ }
            if (json !== undefined) {
                enhanceLogger(
                    console.log.bind(console),
                    { ...formattingOptions, prefix: "incoming: " },
                    incomingMessagesHistory,
                )([json]);
            }
            return data;
        };

        console.log("WebSocket methods replaced");
    } else {
        console.log("WebSocket methods are not replaced");
    }
}
