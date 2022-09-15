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

    const result = parseMessage(data.current, { showDiffWithObject: data.prevObject });
    console.info(...formatForLoggingInBrowser("Formatted message 2: ", result));

    const result2 = parseMessage(data.current, data.prevObject ? { showDiffWithObject: data.prevObject } : { multiline: true });
    document.querySelector("#demo_input_currentMessage")!.innerHTML = highlightTextInHtml(result2);
    document.querySelector("#demo_input_prevMessage")!.innerHTML = data.prevObject ?
        formatMultiLineTextAsHTML(JSON.stringify(data.prevObject, null, "  ")) : "";
}
executeFormatter(logs);

document.querySelector("#run")!.addEventListener("click", () => {
    console.clear();
    const currentLoggableMessage =
        removeHtmlEntities(document.querySelector("#demo_input_currentMessage")!.textContent ?? "");
    const prevMessage =
        removeHtmlEntities(document.querySelector("#demo_input_prevMessage")!.textContent ?? "");
    try {
        executeFormatter({
            prevObject: safeParse(prevMessage),
            current: safeParse(currentLoggableMessage),
        });
        document.querySelector("#error")!.innerHTML = "";
    } catch (ex) {
        document.querySelector("#error")!.innerHTML = JSON.stringify(ex.message);
    }
});
