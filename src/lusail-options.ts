export type FetchFunction = (url: string) => Promise<string>;

export interface LusailLogger {
  log(message: string, ...params: any[]): void;
  error(message: string, ...params: any[]): void;
  warn(message: string, ...params: any[]): void;
  info(message: string, ...params: any[]): void;
  debug(message: string, ...params: any[]): void;
}

export interface LusailOptions {
  fetchFunction?: FetchFunction;
  referenceDate?: Date;
  logger?: LusailLogger;
}
