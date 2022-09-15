import { FormattingType, LogItem } from "./types";
export declare function formatForLoggingInBrowser(prefix: string, result: LogItem[], prefixColors?: string[], typeToStyleMap?: Record<FormattingType, string>): string[];
export declare function formatMultiLineTextAsHTML(content: string): string;
export declare function removeHtmlEntities(content: string): string;
export declare function highlightTextInHtml(messages: LogItem[] | LogItem[][]): string;
