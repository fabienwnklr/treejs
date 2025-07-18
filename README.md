# TreeJS

TreeJS est un composant JavaScript léger pour afficher et manipuler des arbres de données dans le DOM. Il supporte la sélection, l’expansion/repliement, le chargement dynamique, les plugins (checkbox, menu contextuel), et la personnalisation via des options.

## Installation

```bash
npm install treejs
```

## Utilisation de base

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

| Option         | Type                                      | Description                                                                                 | Par défaut |
| -------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------- | ---------- |
| `showPath`     | `boolean`                                 | Affiche le chemin complet dans les classes                                                  | `false`    |
| `icons`        | `{ folder?: string; file?: string; chevron?: string; folderOpen?: string }` | Icônes personnalisées pour les dossiers, fichiers, chevrons, etc. (HTML ou SVG)            | `{}`       |
| `plugins`      | `string[]`                                | Plugins à activer (`'checkbox'`, `'context-menu'`, etc.)                                    | `[]`       |
| `openOnDblClick` | `boolean`                               | Ouvre/ferme les dossiers au double-clic au lieu du simple clic                             | `false`    |

## Typage

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

## Événements

TreeJS émet plusieurs événements auxquels tu peux réagir :

| Événement  | Description                                                                                 | Payload (exemple)                |
|------------|--------------------------------------------------------------------------------------------|----------------------------------|
| `select`   | Lorsqu’un élément feuille est sélectionné                                                  | `{ target: $li, name: string }`  |
| `open`     | Lorsqu’un dossier est ouvert                                                               | `{ target: $li, name: string }`  |
| `close`    | Lorsqu’un dossier est fermé                                                                | `{ target: $li, name: string }`  |
| `fetch`    | Avant le chargement dynamique d’un dossier                                                 | `{ target: $li, name: string, uri: string }` |
| `fetched`  | Après le chargement dynamique d’un dossier                                                 | `{ target: $li, name: string, response: Response }` |

Pour écouter un événement :

```typescript
tree.on('select', (payload) => {
  console.log('Sélectionné :', payload.name, payload.target);
});
```

## Chargement dynamique

Vous pouvez charger des données dynamiquement via une URL :

```html
<li data-treejs-fetch-url="/api/children.json">Chargement dynamique</li>
```

## Plugins

Activez des plugins via l’option `plugins` :

```typescript
const tree = new TreeJS('#my-tree', {
  plugins: ['checkbox', 'context-menu'],
});
```

## API

- `tree.open(name: string)`: déplie un nœud.
- `tree.close(name: string)`: replie un nœud.
- `tree.toggle(name: string)`: ouvre ou ferme un nœud.
- `tree.getState(name: string)`: retourne l’état (`'open'` ou `'closed'`) d’un nœud.
- `tree.getSelected()`: retourne le nœud sélectionné.
- `tree.getChecked()`: retourne les nœuds cochés (si plugin checkbox).
- `tree.toJSON()`: retourne l’arbre sous forme de données JSON.

## Exemple de données JSON

```json
[
  {
    "label": "Racine",
    "children": [
      { "label": "Enfant 1", "children": [] },
      { "label": "Enfant 2", "children": [] }
    ]
  }
]
```

## Générer un arbre depuis du JSON

```typescript
import { JSONToHTML } from 'treejs';

const data = [ /* ... */ ];
const fragment = JSONToHTML(data);
document.getElementById('my-tree').appendChild(fragment);
```

