import { parseMessage, safeParse } from "./index";
import { logs } from "./testData";
import {
    highlightTextInHtml,
    removeHtmlEntities,
    formatForLoggingInBrowser,
    formatMultiLineTextAsHTML
} from "./formattingUtils";

function executeFormatter(data: typeof logs) {
    console.log("JSON message 1", data.prevObject);
    console.log("JSON message 2", data.current);

    const multiline = !!(document.querySelector("#multiline") as HTMLInputElement)?.checked ?? false;
    const yaml = !!(document.querySelector("#yaml") as HTMLInputElement)?.checked ?? false;

    const result = parseMessage(
        data.current,
        yaml ? { yaml: true } : { showDiffWithObject: data.prevObject, multiline: multiline, isDebug: true },
    );
    console.info(...formatForLoggingInBrowser("Formatted message 2: ", result));

    if (yaml) {
        document.querySelector("#demo_input_prevMessage")!.innerHTML = highlightTextInHtml(result);
    } else {
        document.querySelector("#demo_input_currentMessage")!.innerHTML = highlightTextInHtml(result);
        document.querySelector("#demo_input_prevMessage")!.innerHTML = data.prevObject ?
            formatMultiLineTextAsHTML(JSON.stringify(data.prevObject, null, "  ")) : "";
    }
}

function onClick() {
    console.clear();
    const currentLoggableMessage =
        removeHtmlEntities(document.querySelector<HTMLElement>("#demo_input_currentMessage")!.innerText ?? "");
    const prevMessage =
        removeHtmlEntities(document.querySelector("#demo_input_prevMessage")!.textContent ?? "");
    const preserveFormatting = !!(document.querySelector("#preserveFormatting") as HTMLInputElement)?.checked ?? false;

    try {
        executeFormatter({
            prevObject: safeParse(prevMessage),
            current: preserveFormatting ? currentLoggableMessage : safeParse(currentLoggableMessage),
        });
        document.querySelector("#error")!.innerHTML = "";
    } catch (ex) {
        document.querySelector("#error")!.innerHTML = JSON.stringify(ex.message);
    }
}

executeFormatter(logs);

["#run", "#yaml", "#multiline", "#preserveFormatting"].map(selector =>
    document.querySelector(selector)!.addEventListener("click", onClick));
