import { FormattingType, LOG } from "./types";
export declare function formatForLoggingInBrowser(prefix: string, result: LOG, prefixColors?: string[], typeToStyleMap?: Record<FormattingType, string>): string[];
export declare function formatMultiLineTextAsHTML(content: string): string;
export declare function removeHtmlEntities(content: string): string;
export declare function highlightTextInHtml(messages: LOG | LOG[]): string;
