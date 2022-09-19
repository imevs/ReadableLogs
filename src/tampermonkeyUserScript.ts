import { highlightPartsOfMessage, formatForLoggingInBrowser, safeParse } from "./index";
import { DataObject, DataObjectValues, FormattingType } from "./types";

type FormattingOptions = {
    mode: "overrideConsole" | "overrideWebsocket";
    /**
     * should override console output
     */
    replace: boolean;
    /**
     * format JSON as multiline for better readability (suits for small messages)
     */
    multiline: boolean;
    /**
     * limit max size of message to be formatted, is used to prevent possible performance issues with large documents
     */
    maxMessageSize: number;
    /**
     * customize colors for highlighting
     */
    colorsMap?: Partial<Record<FormattingType, string>>;
    /**
     * Adds prefix for logged value, useful for filtering only needed entries in console
     */
    prefix: string;
    /**
     * getMessageType identifies objects of same type, it allows to track changes in objects
     * if undefined is returned - message will not be formatted
     */
    getMessageType(input: DataObject, wholeLogMessage: any[], type: string): undefined | string;
};

/**
 * formattingOptions are to be provided in tamperMonkey script to customize behaviour of user script,
 * see example at /userScripts/overrideConsoleLogging.js
 */
const passedFormattingOptions = (window as any).formattingOptions as (undefined | Partial<FormattingOptions>);

function enhanceLogger(logFunction: typeof console.log, options: FormattingOptions, oldMessages: Record<string, DataObject>, type: string) {
    return (args: DataObjectValues[]) => {
        const newArgs = args.map(logPart => {
            if (logPart !== null && typeof logPart === "object") {
                const id = options.getMessageType(logPart as DataObject, args, type);
                if (id !== undefined) {
                    const result = highlightPartsOfMessage(logPart as DataObject,
                        { showDiffWithObject: oldMessages[id], multiline: options.multiline });
                    oldMessages[id] = logPart as DataObject;
                    logFunction(...formatForLoggingInBrowser(options.prefix, result, [], options.colorsMap));
                }
            }
            return logPart;
        });
        if (!options.replace) {
            return logFunction(...newArgs);
        }
    };
}

const formattingOptions: FormattingOptions = {
    colorsMap: passedFormattingOptions?.colorsMap ?? undefined,
    maxMessageSize: passedFormattingOptions?.maxMessageSize ?? 1000,
    replace: passedFormattingOptions?.replace ?? false,
    multiline: passedFormattingOptions?.multiline ?? false,
    mode: passedFormattingOptions?.mode ?? "overrideConsole",
    getMessageType: passedFormattingOptions?.getMessageType ?? (logPart => Object.keys(logPart)[0]),
    prefix: passedFormattingOptions?.prefix ?? "formatted json: "
};

if (formattingOptions.mode === "overrideConsole") {
    console.log("Logger methods replaced");
    const messagesHistory: Record<string, DataObject> = {};
    window.console.log = enhanceLogger(console.log.bind(console), formattingOptions, messagesHistory, "console.log");
    window.console.info = enhanceLogger(console.info.bind(console), formattingOptions, messagesHistory, "console.info");
} else if (formattingOptions.mode === "overrideWebsocket") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof wsHook !== undefined) { // wsHook is provided by https://raw.githubusercontent.com/imevs/wshook/master/wsHook.js
        const outgoingMessagesHistory: Record<string, DataObject> = {};
        const incomingMessagesHistory: Record<string, DataObject> = {};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        wsHook.before = function (data: string) {
            const prefix = "outgoing: ";
            if (data.length > formattingOptions.maxMessageSize) {
                console.log(prefix, data);
                return data;
            }
            const json = safeParse(data);
            if (json !== undefined) {
                enhanceLogger(
                    console.log.bind(console),
                    { ...formattingOptions, prefix: prefix, replace: true },
                    outgoingMessagesHistory,
                    "outgoing",
                )([json]);
            }
            return data;
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        wsHook.after = function (data: { data: string; }) {
            const prefix = formattingOptions.prefix;

            if (data.data.length > formattingOptions.maxMessageSize) {
                console.log(prefix, data);
                return data;
            }
            const json = safeParse(data.data);
            if (json !== undefined) {
                enhanceLogger(
                    console.log.bind(console),
                    { ...formattingOptions, replace: true },
                    incomingMessagesHistory,
                    "incoming",
                )([json]);
            }
            return data;
        };

        console.log("WebSocket methods replaced");
    } else {
        console.log("WebSocket methods are not replaced");
    }
}
