# TreeJS

TreeJS is a lightweight JavaScript component for displaying and manipulating data trees in the DOM. It supports selection, expand/collapse, dynamic loading, plugins (checkbox, context menu), and customization via options.

TreeJS is strongly typed and performs thorough data validation to make usage as clear and safe as possible, reducing complexity and clarifying expectations.

## Installation

```bash
npm install treejs
```

## Basic Usage

```html
<ul id="my-tree">
  <li>Node 1
    <ul>
      <li>Child 1</li>
      <li>Child 2</li>
    </ul>
  </li>
  <li>Node 2</li>
</ul>
```

```typescript
import { TreeJS } from 'treejs';

const tree = new TreeJS('#my-tree', {
  showPath: true,
  icons: {
    folder: '<svg>...</svg>',
    file: '<svg>...</svg>',
    chevron: '<svg>...</svg>',
    folderOpen: '<svg>...</svg>',
  },
  plugins: ['checkbox', 'context-menu'],
  openOnDblClick: false,
});
```

## Options

| Option           | Type                                      | Description                                                                                 | Default    |
| ---------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------- | ---------- |
| `showPath`       | `boolean`                                 | Shows the full path in the classes                                                          | `false`    |
| `icons`          | `{ folder?: string; file?: string; chevron?: string; folderOpen?: string }` | Custom icons for folders, files, chevrons, etc. (HTML or SVG)                               | `{}`       |
| `plugins`        | `string[]`                                | Plugins to enable (`'checkbox'`, `'context-menu'`, etc.)                                    | `[]`       |
| `openOnDblClick` | `boolean`                                 | Opens/closes folders on double-click instead of single-click                                | `false`    |

## Typing

```typescript
export interface TreeJSOptions {
  showPath?: boolean;
  icons?: {
    folder?: string;
    file?: string;
    chevron?: string;
    folderOpen?: string;
  };
  plugins?: string[];
  openOnDblClick?: boolean;
}
```

## Events

TreeJS emits several events you can listen to:

| Event      | Description                                                                                 | Payload (example)                |
|------------|--------------------------------------------------------------------------------------------|----------------------------------|
| `select`   | When a leaf node is selected                                                               | `{ target: $li, name: string }`  |
| `open`     | When a folder is opened                                                                    | `{ target: $li, name: string }`  |
| `close`    | When a folder is closed                                                                    | `{ target: $li, name: string }`  |
| `fetch`    | Before dynamically loading a folder                                                        | `{ target: $li, name: string, uri: string }` |
| `fetched`  | After dynamically loading a folder                                                         | `{ target: $li, name: string, response: Response }` |

To listen to an event:

```typescript
tree.on('select', (payload) => {
  console.log('Selected:', payload.name, payload.target);
});
```

## Dynamic Loading

You can load data dynamically via a URL:

1. JSON format

```json
[
  {
    "label": "...", // Label
    "children": [
      {
        "label": "...", // Label
        "children": [], // Optionnal childen
      },
      {
        "label": "...", // Label
        "children": [], // Optionnal childen
      },
      {
        "label": "...", // Label
        "children": [], // Optionnal childen
      }
    ]
  },
  {
    "label": "...", // Label
    "children": []
  }
]
```

2. HTML format

```html
<li data-treejs-fetch-url="/api/children.{html/json}">Dynamic loading</li>
```

## Plugins

Enable plugins via the `plugins` option:

```typescript
const tree = new TreeJS('#my-tree', {
  plugins: ['checkbox', 'context-menu'],
});

// or with options
const tree = new TreeJS('#my-tree', {
  plugins: [{
    name: 'checkbox',
    options: { ... }
  }],
});
```

## API

- `tree.open(name: string)`: expands a node.
- `tree.close(name: string)`: collapses a node.
- `tree.toggle(name: string)`: opens or closes a node.
- `tree.getState(name: string)`: returns the state (`'open'` or `'closed'`) of a node.
- `tree.getSelected()`: returns the selected node.
- `tree.getChecked()`: returns checked nodes (if checkbox plugin is enabled).
- `tree.toJSON()`: returns the tree as JSON data.

## Example JSON Data

```json
[
  {
    "label": "Root",
    "children": [
      { "label": "Child 1", "children": [] },
      { "label": "Child 2", "children": [] }
    ]
  }
]
```

## Generate a Tree from JSON

```typescript
import { JSONToHTML } from 'treejs';

const data = [ /* ... */ ];
const fragment = JSONToHTML(data);
document.getElementById('my-tree').appendChild(fragment);
```

