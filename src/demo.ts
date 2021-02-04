import { formatLogs } from "./PrettyLogs";
import { logs } from "./testData";
import { showLogsInBrowserConsole, highlightTextInHtml, removeHtmlEntities } from "./formattingUtils";

function executeFormatter(data: any) {
    const res = formatLogs(data);
    showLogsInBrowserConsole(res);
    document.querySelector("#demo_input")!.innerHTML = highlightTextInHtml(res);
}
executeFormatter(logs);

document.querySelector("#run")!.addEventListener("click", () => {
    console.clear();
    const data = removeHtmlEntities(document.querySelector("#demo_input")!.textContent ?? "");
    try {
        const object = JSON.parse(data);
        executeFormatter(object);
        document.querySelector("#error")!.innerHTML = "";
    } catch (ex) {
        document.querySelector("#error")!.innerHTML = JSON.stringify(ex.message);
    }
});
