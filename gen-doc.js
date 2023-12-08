const fs = require('fs');
const path = require('path');
const { spawn } = require('node:child_process');
const TypeDoc = require('typedoc');
const json = require('./typedoc.json');

const workspaceDirs = ['packages', 'plugins'];
const ignorePackages = ['turbox-snippets'];
const entryPath = './src/index.ts';
const clEntryPath = './CHANGELOG.md';
const docEnv = process.env.DOC_ENV;

const DOC_ENV = {
  TYPEDOC: 'typedoc',
  CHANGELOG: 'changelog'
};

async function main() {
  const entryPoints = [];
  const clEntryPoints = [];
  workspaceDirs.forEach(dir => {
    const files = fs.readdirSync(dir);
    for (let i = files.length - 1; i >= 0; i--) {
      const file = files[i];
      const fullPath = `${dir}/${file}`;
      const stat = fs.lstatSync(fullPath);
      if (stat.isDirectory() && !ignorePackages.some(pkgName => fullPath.includes(pkgName))) {
        const entry = path.resolve(fullPath, entryPath);
        const clEntry = path.resolve(fullPath, clEntryPath);
        if (fs.existsSync(entry)) {
          entryPoints.push(entry);
        }
        if (fs.existsSync(clEntry)) {
          clEntryPoints.push(clEntry);
        }
      }
    }
  });
  if (docEnv === DOC_ENV.TYPEDOC) {
    /** Generate type doc */
    try {
      const app = await TypeDoc.Application.bootstrapWithPlugins({
        entryPoints,
      });
      const project = await app.convert();
      if (project) {
        const outputDir = json.out;
        // Rendered docs
        await app.generateDocs(project, outputDir);
        // Alternatively generate JSON output
        // await app.generateJson(project, outputDir + "/documentation.json");
      }
    } catch (error) {
      console.error(error);
    }
  }
  if (docEnv === DOC_ENV.CHANGELOG) {
    /** Generate changelog */
    const readerStream = spawn('cat', clEntryPoints).stdout;
    const writerStream = fs.createWriteStream('./docs/CHANGELOG.md');

    readerStream.on('data', (chunk) => {
      writerStream.write(chunk);
    });

    readerStream.on('end', () => {
      writerStream.end();
    });

    readerStream.on('error', (err) => {
      console.error(err);
    });

    writerStream.on('finish', () => {
      console.log('*** Generate changelog success! ***');
    });

    writerStream.on('error', (err) => {
      console.error(err);
    });
  }
}

main().catch(console.error);
