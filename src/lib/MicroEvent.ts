/**
 * MicroEvent - to make any js object an event emitter
 *
 * Copyright (c) 2024 Fabien Winkler & contributors
 *
 * - Highly typed - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediatly, no mistery, no magic involved
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * @author Winkler Fabien (https://github.com/fabienwnklr)
 */

import { TreeJSConsole } from "@/utils/console";

export default class MicroEvent<
  TEvents extends Record<string, (...args: any[]) => any>
> {
  private _events: { [K in keyof TEvents]?: TEvents[K][] } = {};

  constructor() {
    this._events = {};
  }

  on<K extends keyof TEvents>(event: K, fct: TEvents[K]) {
    if (!event) {
      TreeJSConsole.error("MicroEvent: No event provided to add a listener.");
      return;
    }

    if (typeof fct !== "function") {
      TreeJSConsole.error(
        `MicroEvent: The provided listener for event "${
          event as string
        }" is not a function.`
      );
      return;
    }

    const event_array = this._events[event] || [];
    event_array.push(fct);
    this._events[event] = event_array;
  }

  off<K extends keyof TEvents>(event: K, fct?: TEvents[K]) {
    if (event === undefined) {
      this._events = {};
      TreeJSConsole.warn(
        "MicroEvent: No event provided to remove all listeners."
      );
      return;
    }
    if (!fct) {
      TreeJSConsole.warn(
        `MicroEvent: No function provided to remove for event "${
          event as string
        }".`
      );
      // If no function is provided, remove all listeners for the event
      delete this._events[event];
      return;
    }
    const event_array = this._events[event];
    if (!event_array) return;
    this._events[event] = event_array.filter((cb) => cb !== fct);
  }

  trigger<K extends keyof TEvents>(event: K, ...args: Parameters<TEvents[K]>) {
    if (!event) {
      TreeJSConsole.error("MicroEvent: No event provided to trigger.");
      return;
    }
    if (!this._events[event]) {
      TreeJSConsole.warn(
        `MicroEvent: No listeners registered for event "${event as string}".`
      );
      return;
    }
    const event_array = this._events[event];
    if (!event_array) return;
    event_array.forEach((fct) => fct(...args));
  }
}
