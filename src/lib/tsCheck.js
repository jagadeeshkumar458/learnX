/* TypeScript type checking in the browser, with the same compiler the labs already load.
   Standard library declarations come from /vendor/ts-lib-*.json (loaded once, on demand); small
   hand-written declarations stand in for react, react-dom, express and node. */

import { loadCompiler, vendorUrl } from "./reactLab.js";

let esLibs = null, domLibs = null;
async function loadLibs(dom) {
  if (!esLibs) esLibs = fetch(vendorUrl("ts-lib-es-6.0.3.json")).then((r) => { if (!r.ok) throw new Error("Couldn't load the TypeScript library files."); return r.json(); });
  if (dom && !domLibs) domLibs = fetch(vendorUrl("ts-lib-dom-6.0.3.json")).then((r) => r.json());
  return { ...(await esLibs), ...(dom ? await domLibs : {}) };
}

/* ── minimal type declarations for the packages the labs provide ── */
const REACT_D = `declare module "react" {
  export type Key = string | number | bigint;
  export interface ReactElement<P = any> { type: any; props: P; key: string | null }
  export type ReactNode = ReactElement | string | number | bigint | boolean | null | undefined | Iterable<ReactNode>;
  export type JSXElementConstructor<P> = (props: P) => ReactNode;
  export type PropsWithChildren<P = unknown> = P & { children?: ReactNode };
  export type FC<P = {}> = (props: P) => ReactNode;
  export type ComponentProps<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> =
    T extends JSXElementConstructor<infer P> ? P : T extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T] : {};
  export type ComponentPropsWithoutRef<T extends keyof JSX.IntrinsicElements> = Omit<JSX.IntrinsicElements[T], "ref">;
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prevState: S) => S);
  export type DependencyList = readonly unknown[];
  export type EffectCallback = () => void | (() => void);
  export interface RefObject<T> { current: T }
  export interface Context<T> { Provider: (props: { value: T; children?: ReactNode }) => ReactNode; Consumer: any }
  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
  export function useEffect(effect: EffectCallback, deps?: DependencyList): void;
  export function useLayoutEffect(effect: EffectCallback, deps?: DependencyList): void;
  export function useRef<T>(initialValue: T): RefObject<T>;
  export function useRef<T>(initialValue: T | null): RefObject<T | null>;
  export function useRef<T = undefined>(): RefObject<T | undefined>;
  export function useMemo<T>(factory: () => T, deps: DependencyList): T;
  export function useCallback<T extends Function>(callback: T, deps: DependencyList): T;
  export function useContext<T>(context: Context<T>): T;
  export function createContext<T>(defaultValue: T): Context<T>;
  export function useId(): string;
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, Dispatch<A>];
  export function memo<P>(component: (props: P) => ReactNode): (props: P) => ReactNode;
  export function lazy<P>(load: () => Promise<{ default: (props: P) => ReactNode }>): (props: P) => ReactNode;
  export const Fragment: (props: { children?: ReactNode; key?: Key }) => ReactNode;
  export const StrictMode: (props: { children?: ReactNode }) => ReactNode;
  export const Suspense: (props: { children?: ReactNode; fallback?: ReactNode }) => ReactNode;
  export interface SyntheticEvent<T = Element> { currentTarget: T; target: EventTarget & T; preventDefault(): void; stopPropagation(): void; type: string }
  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {}
  export interface FormEvent<T = Element> extends SyntheticEvent<T> {}
  export interface MouseEvent<T = Element> extends SyntheticEvent<T> { clientX: number; clientY: number; button: number }
  export interface KeyboardEvent<T = Element> extends SyntheticEvent<T> { key: string; code: string; shiftKey: boolean }
  export interface FocusEvent<T = Element> extends SyntheticEvent<T> {}
  export type ChangeEventHandler<T = Element> = (event: ChangeEvent<T>) => void;
  export type FormEventHandler<T = Element> = (event: FormEvent<T>) => void;
  export type MouseEventHandler<T = Element> = (event: MouseEvent<T>) => void;
  export type CSSProperties = { [key: string]: string | number | undefined };
  interface DOMAttributes<T> {
    children?: ReactNode; key?: Key; ref?: any;
    onClick?: MouseEventHandler<T>; onChange?: ChangeEventHandler<T>; onSubmit?: FormEventHandler<T>;
    onInput?: FormEventHandler<T>; onKeyDown?: (event: KeyboardEvent<T>) => void; onKeyUp?: (event: KeyboardEvent<T>) => void;
    onFocus?: (event: FocusEvent<T>) => void; onBlur?: (event: FocusEvent<T>) => void;
    onMouseEnter?: MouseEventHandler<T>; onMouseLeave?: MouseEventHandler<T>;
  }
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    className?: string; id?: string; style?: CSSProperties; title?: string; role?: string; tabIndex?: number; hidden?: boolean; lang?: string;
    [aria: \`aria-\${string}\`]: string | number | boolean | undefined;
    [data: \`data-\${string}\`]: string | number | boolean | undefined;
  }
  interface AllHTMLAttributes<T> extends HTMLAttributes<T> {
    href?: string; target?: string; rel?: string; src?: string; alt?: string; width?: number | string; height?: number | string;
    type?: string; name?: string; value?: string | number | readonly string[]; defaultValue?: string | number; checked?: boolean; defaultChecked?: boolean;
    disabled?: boolean; placeholder?: string; required?: boolean; readOnly?: boolean; min?: number | string; max?: number | string; step?: number | string;
    maxLength?: number; autoComplete?: string; autoFocus?: boolean; htmlFor?: string; method?: string; action?: string | ((formData: FormData) => void);
    rows?: number; cols?: number; multiple?: boolean; selected?: boolean; loading?: "lazy" | "eager"; viewBox?: string; fill?: string; stroke?: string;
  }
}
declare module "react/jsx-runtime" {
  import { ReactElement, ReactNode, Key, AllHTMLAttributes } from "react";
  export namespace JSX {
    interface Element extends ReactElement<any> {}
    interface ElementChildrenAttribute { children: {} }
    interface IntrinsicAttributes { key?: Key }
    type ElementType = string | ((props: any) => ReactNode);
    interface IntrinsicElements {
      [tag: string]: AllHTMLAttributes<any>;
    }
  }
  export function jsx(type: any, props: any, key?: Key): ReactElement;
  export function jsxs(type: any, props: any, key?: Key): ReactElement;
  export const Fragment: (props: { children?: ReactNode }) => ReactNode;
}
declare module "react-dom/client" {
  import { ReactNode } from "react";
  export function createRoot(container: Element | DocumentFragment): { render(children: ReactNode): void; unmount(): void };
}
declare namespace JSX {
  type Element = import("react/jsx-runtime").JSX.Element;
  interface IntrinsicElements extends import("react/jsx-runtime").JSX.IntrinsicElements {}
}
declare module "*.css";
declare module "*.svg" { const src: string; export default src; }
declare module "*.png" { const src: string; export default src; }
`;

const CONSOLE_D = `declare var console: { log(...data: any[]): void; error(...data: any[]): void; warn(...data: any[]): void; info(...data: any[]): void; table(data: any): void; time(label?: string): void; timeEnd(label?: string): void };
declare function setTimeout(handler: (...args: any[]) => void, timeout?: number, ...args: any[]): number;
declare function clearTimeout(id: number | undefined): void;
declare function setInterval(handler: (...args: any[]) => void, timeout?: number): number;
declare function clearInterval(id: number | undefined): void;
declare function structuredClone<T>(value: T): T;
`;

const NODE_D = `declare var process: { env: Record<string, string | undefined>; argv: string[]; exit(code?: number): never; cwd(): string };
declare var __dirname: string;
interface ImportMeta { dirname: string; filename: string; url: string }
declare module "node:path" { export function join(...p: string[]): string; export function resolve(...p: string[]): string; export function extname(p: string): string; export function basename(p: string, ext?: string): string; const path: { join: typeof join; resolve: typeof resolve; extname: typeof extname; basename: typeof basename }; export default path; }
declare module "path" { export * from "node:path"; export { default } from "node:path"; }
declare module "node:crypto" { export function randomUUID(): string; }
declare module "crypto" { export function randomUUID(): string; }
declare module "node:fs/promises" { export function readFile(path: string, encoding: "utf8" | "utf-8"): Promise<string>; export function writeFile(path: string, data: string, encoding?: string): Promise<void>; }
`;

const EXPRESS_D = `declare module "express" {
  export interface ParamsDictionary { [key: string]: string }
  export interface ParsedQs { [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[] }
  export interface Request<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs> {
    params: P; body: ReqBody; query: ReqQuery; method: string; path: string; url: string; originalUrl: string; ip?: string;
    headers: Record<string, string | string[] | undefined>; get(name: string): string | undefined;
  }
  export interface Response<ResBody = any> {
    status(code: number): this; json(body: ResBody): this; send(body?: ResBody | string): this; end(): this;
    set(field: string, value: string): this; type(type: string): this; redirect(url: string): void; sendStatus(code: number): this;
    locals: Record<string, any>; statusCode: number;
  }
  export type NextFunction = (err?: unknown) => void;
  export type RequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs> =
    (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => void | Promise<void>;
  export type ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => void;
  export interface Router {
    get<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs>(path: string, ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery>[]): this;
    post<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs>(path: string, ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery>[]): this;
    put<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs>(path: string, ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery>[]): this;
    patch<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs>(path: string, ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery>[]): this;
    delete<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs>(path: string, ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery>[]): this;
    use(...handlers: (RequestHandler<any, any, any, any> | ErrorRequestHandler | Router)[]): this;
    use(path: string, ...handlers: (RequestHandler<any, any, any, any> | ErrorRequestHandler | Router)[]): this;
  }
  export interface Express extends Router { listen(port: number | string, callback?: () => void): { close(): void } }
  interface ExpressStatic {
    (): Express;
    json(): RequestHandler; urlencoded(options?: { extended?: boolean }): RequestHandler; static(root: string): RequestHandler; Router(): Router;
  }
  const express: ExpressStatic;
  export function Router(): Router;
  export function json(): RequestHandler;
  export default express;
}
declare module "cors" { import { RequestHandler } from "express"; export default function cors(options?: { origin?: string | string[] | boolean }): RequestHandler; }
`;

const TYPES = { react: { "/node_modules/@types/lab/react.d.ts": REACT_D }, node: { "/node_modules/@types/lab/node.d.ts": NODE_D }, express: { "/node_modules/@types/lab/express.d.ts": EXPRESS_D, "/node_modules/@types/lab/node.d.ts": NODE_D } };
const isTs = (f) => /\.(tsx?|mts|cts)$/.test(f);

/** Type-check files. Returns [{ file, line, col, msg, code, start, length }] (errors only). */
export async function typecheck(files, { dom = false, types = [], strict = true } = {}) {
  const [ts, libs] = await Promise.all([loadCompiler(), loadLibs(dom)]);
  const extra = Object.assign(dom ? {} : { "/node_modules/@types/lab/console.d.ts": CONSOLE_D }, ...types.map((t) => TYPES[t] || {}));
  const all = {};
  for (const [name, code] of Object.entries(files)) if (isTs(name)) all["/src/" + name] = code;
  Object.assign(all, extra);
  const options = {
    strict, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, allowImportingTsExtensions: true, skipLibCheck: true, types: [],
    lib: dom ? ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"] : ["lib.es2022.d.ts"],
    noUnusedLocals: false, allowJs: false,
  };
  const cache = {};
  const getText = (fileName) => {
    if (all[fileName] != null) return all[fileName];
    const base = fileName.replace(/^.*\//, "");
    if (/^\/lib\//.test(fileName) && libs[base] != null) return libs[base];
    return undefined;
  };
  const host = {
    getSourceFile: (fileName, lang) => {
      const text = getText(fileName);
      if (text == null) return undefined;
      if (/^\/lib\//.test(fileName) && cache[fileName]) return cache[fileName];
      const sf = ts.createSourceFile(fileName, text, lang, true);
      if (/^\/lib\//.test(fileName)) cache[fileName] = sf;
      return sf;
    },
    getDefaultLibFileName: () => "/lib/lib.d.ts",
    getDefaultLibLocation: () => "/lib",
    writeFile: () => {},
    getCurrentDirectory: () => "/src",
    getDirectories: () => [],
    getCanonicalFileName: (f) => f,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
    fileExists: (f) => getText(f) != null,
    readFile: (f) => getText(f),
    directoryExists: () => true,
  };
  const roots = Object.keys(all).filter((f) => f.startsWith("/src/") || f.startsWith("/node_modules/@types/lab/"));
  const program = ts.createProgram(roots, options, host);
  const diags = [...program.getSyntacticDiagnostics(), ...program.getSemanticDiagnostics()];
  return diags.filter((d) => d.category === ts.DiagnosticCategory.Error && (!d.file || d.file.fileName.startsWith("/src/"))).map((d) => {
    const pos = d.file && d.start != null ? d.file.getLineAndCharacterOfPosition(d.start) : { line: 0, character: 0 };
    return { file: d.file ? d.file.fileName.slice(5) : "", line: pos.line + 1, col: pos.character + 1, msg: ts.flattenDiagnosticMessageText(d.messageText, "\n"), code: d.code, start: d.start, length: d.length };
  });
}
export const fmtDiag = (d) => `${d.file}:${d.line}:${d.col}  TS${d.code}: ${d.msg}`;

/** Does `probe` (extra code appended to `file`) type-check without adding new errors? */
export async function probeCompiles(files, file, probe, opts) {
  const base = files[file] || "";
  const lines = base.split("\n").length;
  const d = await typecheck({ ...files, [file]: base + "\n" + probe }, opts);
  return !d.some((x) => x.file === file && x.line > lines);
}
