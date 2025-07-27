export class TreeJSConsole {
  static log(...args: any[]) {
    console.log(...args);
  }

  static warn(...args: any[]) {
    console.warn(`%cTreeJS: ${args.join(' ')}`, 'color: orange; font-weight: bold;');
  }

  static error(...args: any[]) {
    console.error(`%cTreeJS: ${args.join(' ')}`, 'color: red; font-weight: bold;');
  }

  static info(...args: any[]) {
    console.info(`%cTreeJS: ${args.join(' ')}`, 'color: blue; font-weight: bold;');
  }
}
