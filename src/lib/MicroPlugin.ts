/**
 * MicroPlugin.ts
 * 
 * MicroPlugin is a mixin that allows classes to define and manage plugins.
 * It provides methods to define, initialize, and require plugins with options.
 * Copyright (c) 2024 Fabien Winkler & contributors
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
 * @author Fabien Winkler <fabien.winkler@outlook.fr>
 */

import { TreeJSError } from '@utils/error';
import { PluginTypes, TPluginHash, TPluginItem, TPlugins, TSettings } from '@/@types';

export default function MicroPlugin<TBase extends new (...args: any[]) => object>(
  Interface: TBase & { plugins?: Record<string, any> }
) {
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
      if (!Interface.plugins) {
        Interface.plugins = {};
      }
      if (Interface.plugins[name]) {
        throw new TreeJSError(`Plugin "${name}" already defined`);
      }
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
      const queue = this.buildPluginQueue(plugins, this.plugins.settings);
      let name;
      while ((name = queue.shift())) {
        this.require(name as keyof PluginTypes);
      }
    }

    /**
     *
     * @param plugins
     * @param settings
     * @returns
     */
    private buildPluginQueue(plugins: string[] | TPluginItem[] | TPluginHash, settings: TSettings): string[] {
      const queue: string[] = [];
      if (Array.isArray(plugins)) {
        plugins.forEach((plugin: string | TPluginItem) => {
          if (typeof plugin === 'string') {
            queue.push(plugin);
          } else {
            settings[plugin.name] = plugin.options;
            queue.push(plugin.name);
          }
        });
      } else if (plugins) {
        for (const key in plugins) {
          if (Object.hasOwn(plugins, key)) {
            settings[key] = plugins[key];
            queue.push(key);
          }
        }
      }
      return queue;
    }

    loadPlugin<K extends keyof PluginTypes>(name: K) {
      const plugins = this.plugins;
      if (!Interface.plugins) {
        throw new Error('Plugins registry is not initialized');
      }

      if (!Object.hasOwn(Interface.plugins, name)) {
        throw new Error('Unable to find "' + name + '" plugin');
      }

      plugins.requested[name] = true;
      const result = Interface.plugins[name].fn.apply(this, [this.plugins.settings[name] || {}]) as PluginTypes[K];
      plugins.loaded[name] = result;
      plugins.names.push(name);
    }

    /**
     * Initializes a plugin.
     *
     */
    require<K extends keyof PluginTypes>(name: K) {
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
