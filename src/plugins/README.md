# TreeJS plugins

## Create plugin

> [!NOTE]  
> You can refer to already existing [Checkbox plugin](https://github.com/fabienwnklr/treejs/tree/master/src/plugins/checkbox)

1.  Run script `node script/createPlugin.js my_plugin` or `node script/createPlugin.js my_plugin --style` for create `.scss` file too
2.  Write the plugin code..
3.  Add plugin method(s) into your plugin type file like

```typescript
declare module "@/TreeJS" {
  interface TreeJS {
    // Add method(s) and others..
  }
}
```

4.  Add plugin event(s) into you plugin type file like

```typescript
declare module "@/@types" {
  interface TreeJSEvents {
    "checkbox-change": (payload: {
      /**
       * Whether the checkbox is checked or not.
       */
      checked: boolean;
      /**
       * Whether the checkbox has child checkboxes.
       */
      hasChild: boolean;
      /**
       * The name of the checkbox.
       */
      name: string;
      /**
       * The target HTMLInputElement of the checkbox.
       */
      target: HTMLInputElement;
    }) => void;
  }
}
```
