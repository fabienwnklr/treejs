// Script for generating a TreeJS plugin
// Usage: node createPlugin.js <pluginName> --style
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const pluginName = process.argv[2];

function hasFilesRecursive(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isFile()) {
      return true; // trouvé un fichier → stop direct
    }

    if (entry.isDirectory()) {
      const found = hasFilesRecursive(fullPath);
      if (found) return true;
    }
  }

  return false; // aucun fichier trouvé
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {

  function camelize(str) {
    return str
      .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, (_, c) => c.toUpperCase());
  }

  // get --style argument
  const styleArgIndex = process.argv.indexOf('--style');
  const useStyle = styleArgIndex !== -1;


  if (!pluginName) {
    console.error('Please provide a plugin name.');
    process.exit(1);
  }

  const pluginNameCamelCase = camelize(pluginName);

  // check if plugin name exists
  const pluginDir = path.join(__dirname, '..', 'src', 'plugins', pluginName);
  if (fs.existsSync(pluginDir)) {
    // if no files exist in the directory, remove it
    if (hasFilesRecursive(pluginDir) == false) {
      fs.rmSync(pluginDir, { recursive: true });
    } else {
      console.error(`\x1b[31mPlugin ${pluginName} already exists. Please choose a different name.\x1b[0m`);
      process.exit(1);
    }
  }

  const typesDir = path.join(pluginDir, '@types');

  fs.mkdirSync(pluginDir);
  fs.mkdirSync(typesDir);

  // Create plugin.ts file
  const pluginFilePath = path.join(pluginDir, 'plugin.ts');
  const typesFilePath = path.join(typesDir, 'index.d.ts');

  const pluginTemplate = `import { deepMerge } from '@/utils/functions';
import { TreeJS } from '@/TreeJS';
import type { ${pluginNameCamelCase}Options } from './@types';

${useStyle ? "import './plugin.scss';\n" : ''}
/**
 * ${pluginNameCamelCase} plugin for TreeJS
 * @name ${pluginNameCamelCase}
 * @description Adds ${pluginName} functionality to the TreeJS instance.
 * @version 1.0.0
 * @author Your Name
 * @param {TreeJS} this - The TreeJS instance
 * @param {${pluginNameCamelCase}Options} options - Plugin options
 */
export default function (this: TreeJS, options: ${pluginNameCamelCase}Options) {
  // Default options
  const defaultOptions: ${pluginNameCamelCase}Options = {
    // Define default options here
  };

  // Merge default options with user options
  const mergedOptions = deepMerge(defaultOptions, options);

  function init(this: TreeJS) {
    // Your plugin code goes here
    console.log('${pluginNameCamelCase} plugin initialized with options:', mergedOptions);
    
    this.off('initialize', binded);
  }

  const binded = init.bind(this);
  this.on('initialize', binded);

  // Return an object with plugin methods of others, or empty object if no methods
  return {};
}
`;

  fs.writeFileSync(pluginFilePath, pluginTemplate);

  // Create @types/index.d.ts file
  const typesTemplate = `import type { TreeJS } from '@/TreeJS';
export type ${pluginNameCamelCase}Options = {
  // Define your plugin options here
  prop1?: string; // Example option
};`;

  fs.writeFileSync(typesFilePath, typesTemplate);

  if (useStyle) {
    // Create plugin.scss file
    const styleFilePath = path.join(pluginDir, 'plugin.scss');
    const styleTemplate = `@use '../../scss/variables' as *;`;
    fs.writeFileSync(styleFilePath, styleTemplate);
  }

  // Create test file
  const testDir = path.join(pluginDir, 'tests');
  const testFilePath = path.join(testDir, 'plugin.test.ts');
  const testTemplate = `import { describe, expect, it } from 'vitest';
import { TreeJS } from '@/TreeJS';
import ${pluginNameCamelCase} from '../plugin';

describe('Plugin - ${pluginNameCamelCase}', () => {
      document.body.innerHTML = \`
  <ul id="tree">
    <li id="first">
      First
      <ul>
        <li>First child</li>
        <li>Second child</li>
      </ul>
    </li>
    <li id="second">Second</li>
    <li id="third" data-treejs-fetch-url="https://gist.githack.com/fabienwnklr/4561e87ad6c94070544470a7bf930a8d/raw/144478e6210a8a87df4ce48ebc099f4b09a4a332/treejs.json">
      Third
  </ul>\`;

  const Tree = new TreeJS('tree', { plugins: ['${pluginName}'] });

  it('should do something', () => {
    expect(${pluginNameCamelCase}).toBeDefined();
    expect(Tree).toBeDefined();
    // Add more tests for your plugin here
  });
});
`;
  fs.mkdirSync(testDir);
  fs.writeFileSync(testFilePath, testTemplate);

  // Add plugin to TreeJS
  const treeJSFilePath = path.join(__dirname, '..', 'src', 'TreeJS.ts');
  const treeJSContent = fs.readFileSync(treeJSFilePath, 'utf8');
  const pluginImport = `import ${pluginNameCamelCase} from '@/plugins/${pluginName}/plugin';\n`;
  // Check if the import already exists
  if (!treeJSContent.includes(pluginImport)) {
    const importRegex = /^(import[\s\S]+?from\s+['"][^'"]+['"];?|import\s+['"][^'"]+['"];?)$/gm;

    let match;
    let lastImportEnd = 0;

    while ((match = importRegex.exec(treeJSContent)) !== null) {
      lastImportEnd = importRegex.lastIndex;
    }
    const updatedCode =
      treeJSContent.slice(0, lastImportEnd) + "\n" +
      pluginImport +
      treeJSContent.slice(lastImportEnd);

    fs.writeFileSync(treeJSFilePath, updatedCode);
  }
  const updatedTreeJSContent = fs.readFileSync(treeJSFilePath, 'utf8');
  const pluginDefinition = `TreeJS.define('${pluginName}', ${pluginNameCamelCase});\n`;
  // Add pluginDefinition content on end of TreeJS file
  fs.writeFileSync(treeJSFilePath, updatedTreeJSContent + pluginDefinition);

  // Update AvailablePlugins in src/@types/index.d.ts
  const typesIndexFilePath = path.join(__dirname, '..', 'src', '@types', 'index.d.ts');
  let typesIndexContent = fs.readFileSync(typesIndexFilePath, 'utf8');
  // create regex to match with "export type AvailablePlugins = 'context-menu' | 'checkbox' | 'drag-drop' | 'search' | 'sort' | 'filter';"
  const availablePluginsRegex = /export\s+type\s+AvailablePlugins\s*=\s*((?:'[^']+'\s*\|\s*)*'[^']+')/;
  const match = typesIndexContent.match(availablePluginsRegex);
  if (match) {
    const existingPlugins = match[1].trim();
    const newPlugin = `'${pluginName}'`;
    const updatedPlugins = existingPlugins ? `${existingPlugins} | ${newPlugin}` : newPlugin;
    typesIndexContent = typesIndexContent.replace(availablePluginsRegex, `export type AvailablePlugins = ${updatedPlugins};`);
  } else {
    typesIndexContent += `\nexport type AvailablePlugins = '${pluginName}';\n`;
  }
  fs.writeFileSync(typesIndexFilePath, typesIndexContent);

  // create README.md
  const readmeFilePath = path.join(pluginDir, 'README.md');
  const readmeContent = `# TreeJS - ${pluginName}`;

  fs.writeFileSync(readmeFilePath, readmeContent);

  console.log(`\x1b[34mPlugin ${pluginName} created successfully to ${pluginFilePath} !\x1b[0m`);

} catch (error) {
  console.error(`\x1b[31mError creating plugin: ${error.message}\x1b[0m`);
  // Remove created directories and files if any
  const pluginDir = path.join(__dirname, '..', 'src', 'plugins', pluginName);
  if (fs.existsSync(pluginDir)) {
    fs.rmSync(pluginDir, { recursive: true });
  }

  process.exit(1);
}
