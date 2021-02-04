import { LOG } from "src/PrettyLogs";

function formatMultiLineTextAsHTML(content: string) {
    return content.split(' ').join('&nbsp;').split("\n").join("<br />");
}
export function removeHtmlEntities(content: string) {
    return content.split(String.fromCharCode(160)).join(' ').split("<br />").join("\n");
}
export function highlightTextInHtml(messages: LOG | LOG[]): string {
    const formattedMessages = ((Array.isArray(messages[0]) ? messages : [messages]) as LOG[]).map(message => {
        return message
            .map(part => `<span style="color: ${part.color}">${formatMultiLineTextAsHTML(part.text)}</span>`)
            .join("");
    });
    if (!Array.isArray(messages[0])) {
        return formattedMessages[0]!;
    }
    return "[<br>" + formattedMessages.join(",<br>") + "<br>]";
}
