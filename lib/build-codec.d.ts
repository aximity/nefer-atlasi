export function encodeBuild(build:Record<string,unknown>):string;
export function decodeBuild(value:string):Record<string,unknown>;
export function sanitizeBuild<T=Record<string,unknown>>(raw:Record<string,unknown>,rules:Record<string,unknown>):T|null;
