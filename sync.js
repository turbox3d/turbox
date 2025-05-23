const fs = require('fs-extra');
const path = require('path');
const ignore = require('ignore');
const SOURCE_REPO = process.cwd();
const rootDir = process.argv[3];
if (!rootDir) {
  console.error('请在命令行参数中指定子目录，例如：node sync.js /path/to/target-repo packages');
  process.exit(1);
}
const SOURCE_PACKAGES = path.join(SOURCE_REPO, rootDir);
// 获取目标仓库路径
const TARGET_REPO = process.argv[2];
if (!TARGET_REPO) {
  console.error('请在命令行参数中指定目标仓库路径，例如：node sync.js /path/to/target-repo');
  process.exit(1);
}
const TARGET_PACKAGES = path.join(path.resolve(TARGET_REPO), rootDir);

// 读取 .gitignore 并生成 ignore 实例
function getIgnoreFilter(repoPath) {
  const gitignorePath = path.join(repoPath, '.gitignore');
  let ig = ignore();
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    ig = ignore().add(gitignoreContent);
  }
  return ig;
}
// 递归复制目录，支持 ignore 规则
async function copyDirWithIgnore(src, dest, ig, baseDir) {
  const items = await fs.readdir(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const relPath = path.relative(baseDir, srcPath);
    // 跳过 .git 目录
    if (relPath.split(path.sep).includes('.git')) continue;
    // 判断是否被 ignore
    if (ig.ignores(relPath)) continue;
    const stat = await fs.stat(srcPath);
    const destPath = path.join(dest, item);
    if (stat.isDirectory()) {
      await fs.ensureDir(destPath);
      await copyDirWithIgnore(srcPath, destPath, ig, baseDir);
    } else if (stat.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
async function main() {
  const ig = getIgnoreFilter(SOURCE_REPO);
  const packages = await fs.readdir(SOURCE_PACKAGES);
  for (const pkg of packages) {
    const srcPkgPath = path.join(SOURCE_PACKAGES, pkg);
    const destPkgPath = path.join(TARGET_PACKAGES, pkg);
    const stat = await fs.stat(srcPkgPath);
    if (stat.isDirectory()) {
      await fs.ensureDir(destPkgPath);
      await copyDirWithIgnore(srcPkgPath, destPkgPath, ig, SOURCE_REPO);
      console.log(`Copied ${rootDir}: ${pkg}`);
    }
  }
  console.log(`All ${rootDir} copied!`);
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});
