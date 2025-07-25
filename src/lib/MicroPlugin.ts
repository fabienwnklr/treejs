/**
 * microplugin.js
 * Copyright (c) 2013 Brian Reavis & contributors
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
 * @author Brian Reavis <brian@thirdroute.com>
 */

type TSettings = {
  [key: string]: any;
};

type TPlugins = {
  names: string[];
  settings: TSettings;
  requested: Record<string, boolean>;
  loaded: Record<string, any>;
  data: Record<string, any>;
};

export type TPluginItem = { name: string; options: object };
export type TPluginHash = Record<string, object>;

export default function MicroPlugin(Interface: any) {
  Interface.plugins = {};

  return class extends Interface {
    public plugins: TPlugins = {
      data: {},
      loaded: {},
      names: [],
      requested: {},
      settings: {},
    };

    /**
     * Registers a plugin.
     *
     * @param {function} fn
     */
    static define(name: string, fn: (this: any, settings: TSettings) => any) {
      Interface.plugins[name] = {
        fn: fn,
        name: name,
      };
    }

    /**
     * Initializes the listed plugins (with options).
     * Acceptable formats:
     *
     * List (without options):
     *   ['a', 'b', 'c']
     *
     * List (with options):
     *   [{'name': 'a', options: {}}, {'name': 'b', options: {}}]
     *
     * Hash (with options):
     *   {'a': { ... }, 'b': { ... }, 'c': { ... }}
     *
     * @param {array|object} plugins
     */
    initializePlugins(plugins: string[] | TPluginItem[] | TPluginHash) {
      let key, name;
      const queue: string[] = [];

      if (Array.isArray(plugins)) {
        plugins.forEach((plugin: string | TPluginItem) => {
          if (typeof plugin === 'string') {
            queue.push(plugin);
          } else {
            this.plugins.settings[plugin.name] = plugin.options;
            queue.push(plugin.name);
          }
        });
      } else if (plugins) {
        for (key in plugins) {
          if (Object.hasOwn(plugins, key)) {
            this.plugins.settings[key] = plugins[key];
            queue.push(key);
          }
        }
      }

      // eslint-disable-next-line no-cond-assign
      while ((name = queue.shift())) {
        self.require(name);
      }
    }

    loadPlugin(name: string) {
      const plugins = this.plugins;
      const plugin = Interface.plugins[name];

      if (!Object.hasOwn(Interface.plugins, name)) {
        throw new Error('Unable to find "' + name + '" plugin');
      }

      plugins.requested[name] = true;
      plugins.loaded[name] = plugin.fn.apply(this, [this.plugins.settings[name] || {}]);
      plugins.names.push(name);
    }

    /**
     * Initializes a plugin.
     *
     */
    require(name: string) {
      const plugins = this.plugins;

      if (!Object.hasOwn(this.plugins.loaded, name)) {
        if (plugins.requested[name]) {
          throw new Error('Plugin has circular dependency ("' + name + '")');
        }
        this.loadPlugin(name);
      }

      return plugins.loaded[name];
    }
  };
}
