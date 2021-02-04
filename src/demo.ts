import { formatLogs } from "./PrettyLogs";
import { logs } from "./testData";
import { showLogsInBrowserConsole, highlightTextInHtml, removeHtmlEntities } from "./formattingUtils";

function executeFormatter(data: any) {
    if (Array.isArray(data)) {
        data.forEach((item: any) => {
            console.log("Default browser presentation", item);
        });
    }

    const res = formatLogs(data, { highlightKeys: true, showDifferences: true, formatMultiline: false });
    showLogsInBrowserConsole(res);

    const result2 = formatLogs(data, { highlightKeys: true, showDifferences: true, formatMultiline: true });
    document.querySelector("#demo_input")!.innerHTML = highlightTextInHtml(result2);
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
