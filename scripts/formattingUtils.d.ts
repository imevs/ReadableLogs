import { LOG } from "./PrettyLogs";
export declare function formatForLoggingInBrowser(prefix: string, result: LOG): string[];
export declare function formatMultiLineTextAsHTML(content: string): string;
export declare function removeHtmlEntities(content: string): string;
export declare function highlightTextInHtml(messages: LOG | LOG[]): string;
