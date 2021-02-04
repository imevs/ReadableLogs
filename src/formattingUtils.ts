import { FormattingType, LOG } from "./PrettyLogs";

type Color = "red" | "blue" | "purple" | "orange" | "green" | "";

const typeToColorMap: { [K in FormattingType]: Color; } = {
    "": "",
    key: "red",
    added: "blue",
    changed: "green",
    removed: "orange",
};

function getColor(type: FormattingType): Color {
    return typeToColorMap[type];
}

export function formatForLoggingInBrowser(prefix: string, result: LOG) {
    return [prefix + result.map(item => "%c" + item.text).join(""),
        ...(result.map(item => `color: ${getColor(item.type)};`))];
}

export function formatMultiLineTextAsHTML(content: string) {
    return content.split(' ').join('&nbsp;').split("\n").join("<br />");
}
export function removeHtmlEntities(content: string) {
    return content.split(String.fromCharCode(160)).join(' ').split("<br />").join("\n");
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
