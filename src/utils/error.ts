export class TreeJSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TreeJSError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TreeJSError);
    }
  }
}

export class TreeJSTypeError extends TypeError {
  constructor(message: string) {
    super(message);
    this.name = 'TreeJSTypeError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TreeJSTypeError);
    }
  }
}
