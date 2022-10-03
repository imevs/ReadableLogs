import { FormattingType, LogItem } from "./types";
declare type Color = "red" | "blue" | "pink" | "orange" | "green" | "lightgreen" | "";
export declare const typeToColorMap: Record<FormattingType, Color>;
export declare function formatForLoggingInBrowser(prefix: string, result: LogItem[], prefixColors?: string[], typeToStyleMap?: Partial<Record<FormattingType, string>>): string[];
export declare function formatMultiLineTextAsHTML(content: string): string;
export declare function removeHtmlEntities(content: string): string;
export declare function highlightTextInHtml(messages: LogItem[] | LogItem[][]): string;
export declare function safeParse(data: any): any;
export {};
