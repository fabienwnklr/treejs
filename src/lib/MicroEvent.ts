/**
 * MicroEvent - to make any js object an event emitter
 *
 * - Highly typed - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediatly, no mistery, no magic involved
 *
 * @author Winkler Fabien (https://github.com/fabienwnklr)
 */

export default class MicroEvent<TEvents extends Record<string, (...args: any[]) => any>> {
  private _events: { [K in keyof TEvents]?: TEvents[K][] } = {};

  constructor() {
    this._events = {};
  }

  on<K extends keyof TEvents>(event: K, fct: TEvents[K]) {
    const event_array = this._events[event] || [];
    event_array.push(fct);
    this._events[event] = event_array;
  }

  off<K extends keyof TEvents>(event: K, fct?: TEvents[K]) {
    if (event === undefined) {
      this._events = {};
      return;
    }
    if (!fct) {
      delete this._events[event];
      return;
    }
    const event_array = this._events[event];
    if (!event_array) return;
    this._events[event] = event_array.filter(cb => cb !== fct);
  }

  trigger<K extends keyof TEvents>(event: K, ...args: Parameters<TEvents[K]>) {
    const event_array = this._events[event];
    if (!event_array) return;
    event_array.forEach(fct => fct(...args));
  }
}
