export enum ERROR_CODES {
  CLASS_NOT_REGISTERED_AS_INJECTABLE,
  UNKNOWN
}

// istanbul ignore next
// noinspection TsLint
const ERROR_MESSAGES: { [name: string]: (...args: string[]) => string; } = Object.freeze({
  [ERROR_CODES.UNKNOWN]: (...args: any[]) => `Unknown error: ${args.join(', ')}`,
  [ERROR_CODES.CLASS_NOT_REGISTERED_AS_INJECTABLE]: (className: string) => `Invalid injection, ${className} is not registered as Injectable`,
});

export class PuzzleError extends Error {
  constructor(ERROR_CODE: ERROR_CODES = ERROR_CODES.UNKNOWN, ...args: string[]) {
    super(ERROR_MESSAGES[ERROR_CODE].apply(null, args));
    Object.setPrototypeOf(this, PuzzleError.prototype);
  }
}

