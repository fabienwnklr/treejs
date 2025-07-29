# TreeJS plugins

## Create plugin

 1. Run script `node script/createPlugin.js my_plugin` or `node script/createPlugin.js my_plugin --style` for create `.scss` file too
 2. Write the plugin code..
 3. Add plugin method(s) into your plugin type file like
 ```typescript
 declare module '@/TreeJS' {
  interface TreeJS {
    // Add method(s) and others..
  }
}
``
