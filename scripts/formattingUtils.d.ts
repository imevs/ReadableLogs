import { FormattingType, LogItem } from "./types";
export declare const typeToColorMap: Record<FormattingType, string>;
export declare function formatForLoggingInBrowser(prefix: string, result: LogItem[], prefixColors?: string[], typeToStyleMap?: Partial<Record<FormattingType, string>>): string[];
export declare function formatMultiLineTextAsHTML(content: string): string;
export declare function removeHtmlEntities(content: string): string;
export declare function highlightTextInHtml(messages: LogItem[] | LogItem[][]): string;
export declare function safeParse(data: any): any;
