const fs = require('fs');
const path = require('path');
const TypeDoc = require('typedoc');
const json = require('./typedoc.json');

const workspaceDirs = ['packages', 'plugins'];
const ignorePackages = ['turbox-snippets'];
const entryPath = './src/index.ts';
const clEntryPath = './CHANGELOG.md';
const genEnv = process.env.GEN_ENV;

const GEN_ENV = {
  TYPEDOC: 'typedoc',
  CHANGELOG: 'changelog',
  DTS: 'dts',
};
const cwd = process.cwd();

async function main() {
  const entryPoints = [];
  const clEntryPoints = [];
  /** Generate index.d.ts */
  if (genEnv === GEN_ENV.DTS) {
    const pkg = require(path.resolve(cwd, './package.json'));
    fs.writeFileSync(path.resolve(cwd, './dist/index.d.ts'), `export * from '../typings/index';\n\ndeclare module '${pkg.name}';\n`);
    return;
  }
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
  /** Generate type doc */
  if (genEnv === GEN_ENV.TYPEDOC && entryPoints.length) {
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
  /** Generate changelog */
  if (genEnv === GEN_ENV.CHANGELOG && clEntryPoints.length) {
    const writerStream = fs.createWriteStream('./docs/CHANGELOG.md');

    writerStream.on('finish', () => {
      console.log('*** Generate changelog success! ***');
    });
    writerStream.on('error', (err) => {
      console.error(err);
    });

    function mergeFile(entryPoints, ws) {
      if (!entryPoints.length) {
        return ws.end();
      }
      const rs = fs.createReadStream(entryPoints.shift());
      rs.pipe(ws, { end: false });
      rs.on('end', () => {
        if (entryPoints.length) {
          ws.write('\n');
        }
        mergeFile(entryPoints, ws);
      });
      rs.on('error', (error) => {
        ws.destroy(error);
      });
    }

    mergeFile(clEntryPoints, writerStream);
  }
}

main().catch(console.error);
