// Script for generating a TreeJS plugin
// Usage: node createPlugin.js <pluginName> --style
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function camelize(str) {
  return str
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

// get --style argument
const styleArgIndex = process.argv.indexOf('--style');
const useStyle = styleArgIndex !== -1;

const pluginName = process.argv[2];
if (!pluginName) {
  console.error('Please provide a plugin name.');
  process.exit(1);
}

const pluginNameCamelCase = camelize(pluginName);

// check if plugin name exists
const pluginDir = path.join(__dirname, '..', 'src', 'plugins', pluginName);
if (fs.existsSync(pluginDir)) {
  // console error with red color
  console.error(`\x1b[31mPlugin ${pluginName} already exists. Please choose a different name.\x1b[0m`);
  process.exit(1);
}

const typesDir = path.join(pluginDir, '@types');

fs.mkdirSync(pluginDir);
fs.mkdirSync(typesDir);

// Create plugin.ts file
const pluginFilePath = path.join(pluginDir, 'plugin.ts');
const typesFilePath = path.join(typesDir, 'index.d.ts');

const pluginTemplate = `import { deepMerge } from '@utils/functions';
import { TreeJS } from '@/TreeJS';
import type { ${pluginNameCamelCase}Options } from './@types';

${useStyle ? "import './plugin.scss';\n" : ''}

/** * ${pluginNameCamelCase} plugin for TreeJS
 * @name ${pluginNameCamelCase}
 * @description Adds ${pluginName} functionality to the TreeJS instance.
 * @version 1.0.0
 * @author Your Name
 * @param {TreeJS} this - The TreeJS instance
 * @param {${pluginNameCamelCase}Options} options - Plugin options
 */
export default function(this: TreeJS, options: ${pluginNameCamelCase}Options) {
  // Default options
  const defaultOptions: ${pluginNameCamelCase}Options = {
    // Define default options here
  };

  // Merge default options with user options
  const mergedOptions = deepMerge(defaultOptions, options);

  // Your plugin code goes here

  this.on('initialize', () => {
    // Initialization code for the plugin
    console.log('${pluginNameCamelCase} plugin initialized with options:', mergedOptions);
  });
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
console.log(`\x1b[34mPlugin ${pluginName} created successfully to ${pluginFilePath} !\x1b[0m`);
