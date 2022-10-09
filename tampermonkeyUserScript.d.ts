declare module "types" {
    type ValuesType = "number" | "string" | "boolean";
    export type FormattingType = "key" | "added" | "changed" | "removed" | "value" | "annotation" | "error" | "specialSymbols" | "unknown" | ValuesType;
    export type LogItem = {
        text: string;
        readonly type: FormattingType;
        path: string;
    };
    export type ValueType = string | number | boolean | undefined | null;
    export type DataObjectValues = ValueType | DataObject | DataObject[] | ValueType[];
    export interface DataObject {
        readonly [key: string]: DataObjectValues;
    }
}
declare module "yamlSupport" {
    import { DataObjectValues, LogItem } from "types";
    export function convertJsonToYaml(obj: DataObjectValues, path?: string): LogItem[];
}
declare module "PrettyLogs" {
    import { DataObject, LogItem } from "types";
    export type Options = {
        isDebug?: boolean;
        showDiffWithObject?: DataObject;
        multiline?: boolean;
    };
    export const pathSeparator = "/";
    export function highlightPartsOfMessage<T extends DataObject>(message: T | string, options: Options): LogItem[];
    export function highlightAddedSubMessage(loggedParts: LogItem[], path: string, options: Options): LogItem[];
    export function annotateDataInJson(data: DataObject, annotations: LogItem[], options?: Options): LogItem[];
    export function mergeLogItems(logParts: LogItem[]): LogItem[];
}
declare module "formattingUtils" {
    import { FormattingType, LogItem } from "types";
    export const typeToColorMap: Record<FormattingType, string>;
    export function formatForLoggingInBrowser(prefix: string, result: LogItem[], prefixColors?: string[], typeToStyleMap?: Partial<Record<FormattingType, string>>): string[];
    export function formatMultiLineTextAsHTML(content: string): string;
    export function removeHtmlEntities(content: string): string;
    export function highlightTextInHtml(messages: LogItem[] | LogItem[][]): string;
    export function safeParse(data: any): any;
}
declare module "index" {
    import { DataObject, LogItem } from "types";
    export * from "PrettyLogs";
    export * from "formattingUtils";
    export type ApiOptions = {
        yaml?: true;
    } | {
        isDebug?: true;
        showDiffWithObject?: DataObject;
        multiline?: boolean;
    };
    export function parseMessage(data: DataObject | string, options?: ApiOptions): LogItem[];
    export function highlightJsonParts(data: DataObject, path: string, options?: {
        formatMultiline?: boolean;
        isDebug?: boolean;
    }): LogItem[];
}
declare module "tampermonkeyUserScript" { }
