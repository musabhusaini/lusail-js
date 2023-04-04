/**
 * Represents a function that takes a URL as an input and returns a Promise that resolves to the
 * fetched string content.
 */
export type FetchFunction = (url: string) => Promise<string>;

/**
 * Defines a logger with various log level methods for logging messages and errors during Lusail
 * operations.
 */
export interface LusailLogger {
  /**
   * Logs a message at the "log" level.
   */
  log(message: string, ...params: any[]): void;

  /**
   * Logs a message at the "error" level.
   */
  error(message: string, ...params: any[]): void;

  /**
   * Logs a message at the "warn" level.
   */
  warn(message: string, ...params: any[]): void;

  /**
   * Logs a message at the "info" level.
   */
  info(message: string, ...params: any[]): void;

  /**
   * Logs a message at the "debug" level.
   */
  debug(message: string, ...params: any[]): void;
}

/**
 * Defines the configuration options for a Lusail instance.
 */
export interface LusailOptions {
  /**
   * An optional custom fetch function for fetching HTML content from a given URL. This must be
   * provided if Lusail is expected to fetch content from links within the HTML being parsed.
   */
  fetchFunction?: FetchFunction;

  /**
   * An optional reference date that can be used by transformations to process date-based
   * operations.
   */
  referenceDate?: Date;

  /**
   * An optional logger instance for logging messages during Lusail operations. By default, the
   * console is used for logging.
   */
  logger?: LusailLogger;
}
