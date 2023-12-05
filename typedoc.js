const fs = require('fs');
const path = require('path');
const TypeDoc = require('typedoc');
const json = require('./typedoc.json');

const workspaceDirs = ['packages', 'plugins'];
const entryPath = './src/index.ts';

async function main() {
  // Application.bootstrap also exists, which will not load plugins
  // Also accepts an array of option readers if you want to disable
  // TypeDoc's tsconfig.json/package.json/typedoc.json option readers
  const entryPoints = [];
  workspaceDirs.forEach(dir => {
    const files = fs.readdirSync(dir);
    for (let i = files.length - 1; i >= 0; i--) {
      const file = files[i];
      const fullPath = `${dir}/${file}`;
      const stat = fs.lstatSync(fullPath);
      if (stat.isDirectory()) {
        const entry = path.resolve(fullPath, entryPath);
        if (fs.existsSync(entry)) {
          entryPoints.push(entry);
        }
      }
    }
  });
  const app = await TypeDoc.Application.bootstrapWithPlugins({
    entryPoints,
  });

  const project = await app.convert();

  if (project) {
    // Project may not have converted correctly
    const outputDir = json.out;

    // Rendered docs
    await app.generateDocs(project, outputDir);
    // Alternatively generate JSON output
    // await app.generateJson(project, outputDir + "/documentation.json");
  }
}

main().catch(console.error);
