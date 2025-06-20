export class TreeJSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TreeJSError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TreeJSError);
    }
  }
}
