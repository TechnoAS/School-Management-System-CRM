import fs from 'fs/promises';
import path from 'path';

const root = path.resolve(process.cwd(), 'backend', 'src');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const res = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(res)));
    else if (e.isFile() && res.endsWith('.ts')) files.push(res);
  }
  return files;
}

function replaceImportExt(source) {
  // Replace import specifiers that end with .js in single or double quotes
  return source
    .replace(/(from\s+['\"][^'\"]+)\.js(['\"];?)/g, '$1.ts$2')
    .replace(/(import\(['\"])([^'\"]+)\.js(['\"]\))/g, '$1$2.ts$3');
}

(async () => {
  const files = await walk(root);
  let changed = 0;
  for (const file of files) {
    const src = await fs.readFile(file, 'utf8');
    const next = replaceImportExt(src);
    if (next !== src) {
      await fs.writeFile(file, next, 'utf8');
      changed++;
    }
  }
  console.log(`Processed ${files.length} files, updated ${changed} files.`);
})();
