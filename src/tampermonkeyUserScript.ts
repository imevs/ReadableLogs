import { highlightPartsOfMessage, formatForLoggingInBrowser } from "./index";
import { DataObject, DataObjectValues } from "./types";

const oldMessages: Record<string, DataObject> = {};

const formattingOptions = (window as any).formattingOptions as { prefix: string; } ?? { prefix: "formatted json: " };

function overrideLog(oldLog: typeof console.log, args: (DataObjectValues)[]) {
    const newArgs = args.map(logPart => {
        if (logPart !== null && typeof logPart === "object" && Object.keys(logPart).length > 0) {
            const id = Object.keys(logPart)[0] ?? "";
            const result = highlightPartsOfMessage(logPart as DataObject,
                oldMessages[id] !== undefined ? { showDiffWithObject: oldMessages[id] } : { multiline: true });
            oldMessages[id] = logPart as DataObject;
            oldLog(...formatForLoggingInBrowser(formattingOptions.prefix, result));
        }
        return logPart;
    });
    return oldLog(...newArgs);
}
window.console.log = (oldLog => {
    return (...args: any[]) => overrideLog(oldLog, args);
})(console.log.bind(console));

window.console.info = (oldLog => {
    return (...args: any[]) => overrideLog(oldLog, args);
})(console.info.bind(console));