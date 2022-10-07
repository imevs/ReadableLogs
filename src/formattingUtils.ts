import { FormattingType, LogItem } from "./types";

type Hex = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "A" | "B" | "C" | "D" | "E" | "F";

type ValidateHex<T extends Hex> = T;
// @ts-expect-error "is declared but its value is never read."
type ValidateColor<T extends string> = T extends `#${ValidateHex<infer D1>}${ValidateHex<infer D2>}${ValidateHex<infer D3>}${ValidateHex<infer D4>}${ValidateHex<infer D5>}${ValidateHex<infer D6>}` ? T : never;

function color<T extends string>(s: ValidateColor<T>): T {
    return s;
}

export const typeToColorMap: Record<FormattingType, string> = {
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

function getStyle(type: FormattingType): string {
    return typeToColorMap[type];
}

/**
 * Formats output for console.log
 * Returns data for console log with specified color, uses next browser API
 *      https://developer.mozilla.org/en-US/docs/Web/API/console#outputting_text_to_the_console
 */
export function formatForLoggingInBrowser(
    prefix: string, result: LogItem[], prefixColors: string[] = [],
    typeToStyleMap?: Partial<Record<FormattingType, string>>,
): string[] {
    const getStyle = (type: FormattingType): string => typeToStyleMap?.[type] ?? typeToColorMap[type];
    const removedItems = result.filter(item => item.type === "removed");
    const notRemovedItems = result.filter(item => item.type !== "removed");
    return [
        prefix +
        notRemovedItems.map(item => "%c" + item.text).join("") +
        (removedItems.length > 0 ? "%c Removed: %c" : "") +
        removedItems.map(item => item.path + ":" + item.text)
            .join(",").split("/").join("."), // replace "/" path separator as it is treated by dev tools as part of url
        ...prefixColors,
        ...notRemovedItems.map(item => item.type !== "specialSymbols" ? `${getStyle(item.type)};` : ""),
        ...(removedItems.length > 0 ? ["", `${getStyle("removed")};`] : [])
    ];
}

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

export function formatMultiLineTextAsHTML(content: string): string {
    return content.split(" ").join("&nbsp;").split("\n").join("<br />");
}
export function removeHtmlEntities(content: string): string {
    return content.split(String.fromCharCode(160)).join(" ").split("<br />").join("\n");
}

/**
 * Formats output for html representation
 */
export function highlightTextInHtml(messages: LogItem[] | LogItem[][]): string {
    const formattedMessages = ((Array.isArray(messages[0]) ? messages : [messages]) as LogItem[][]).map(message => {
        return message
            .filter(part => part.type !== "removed") /* TODO: show removed part separately to do not break structure of JSON */
            .map(part => `<span style="${getStyle(part.type)};">${formatMultiLineTextAsHTML(part.text)}</span>`)
            .join("");
    });
    if (!Array.isArray(messages[0])) {
        return formattedMessages[0]!;
    }
    return "[<br>" + formattedMessages.join(",<br>") + "<br>]";
}

export function safeParse(data: any) {
    try {
        return data === "" ? undefined : JSON.parse(data);
    } catch (ex) {
        return undefined;
    }
}