import { showLogsInBrowserConsole, formatLogs } from "./PrettyLogs";
import { logs } from "./testData";

const result = formatLogs(logs);
showLogsInBrowserConsole(result);