import { FormattingType, LOG } from "./types";

type Color = "red" | "blue" | "pink" | "orange" | "green" | "";

const typeToColorMap: { [K in FormattingType]: Color; } = {
    "": "",
    key: "orange",
    added: "blue",
    changed: "green",
    removed: "red",
};

function getColor(type: FormattingType): Color {
    return typeToColorMap[type];
}

export function formatForLoggingInBrowser(prefix: string, result: LOG): string[] {
    return [
        prefix +
        result.filter(item => item.type !== "removed").map(item => "%c" + item.text).join("") +
        (result.filter(item => item.type === "removed").length > 0 ? " Removed: %c" : "") +
        result.filter(item => item.type === "removed").map(item => item.path + ":" + item.text)
            .join(",").split("/").join("."), // replace "/" path separator as it is treated by dev tools as part of url
        ...result.filter(item => item.type !== "removed").map(item => item.type !== "" ? `color: ${getColor(item.type)};` : ""),
        ...(result.filter(item => item.type === "removed").length > 0 ? [`color: ${getColor("removed")};`] : [])
    ];
}

export function formatMultiLineTextAsHTML(content: string): string {
    return content.split(" ").join("&nbsp;").split("\n").join("<br />");
}
export function removeHtmlEntities(content: string): string {
    return content.split(String.fromCharCode(160)).join(" ").split("<br />").join("\n");
}
export function highlightTextInHtml(messages: LOG | LOG[]): string {
    const formattedMessages = ((Array.isArray(messages[0]) ? messages : [messages]) as LOG[]).map(message => {
        return message
            .map(part => `<span style="color: ${getColor(part.type)}">${formatMultiLineTextAsHTML(part.text)}</span>`)
            .join("");
    });
    if (!Array.isArray(messages[0])) {
        return formattedMessages[0]!;
    }
    return "[<br>" + formattedMessages.join(",<br>") + "<br>]";
}
