import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import test from 'node:test';
import { checkFunctionPackage } from './check-edge-packages.mjs';

async function fixture(t, files) {
  const root = await mkdtemp(join(tmpdir(), 'aurora-edge-package-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [path, source] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), source);
  }
  return root;
}

test('shared and own modules are traversed once, including multiline imports and cycles', async t => {
  const root = await fixture(t, {
    'admin-support/index.ts': `import {\n equalSecret\n} from '../_shared/auth.ts';\nexport { foo } from './helper.ts';\nconst example = "import './not-real.ts'";`,
    '_shared/auth.ts': `export const equalSecret = () => true;`,
    'admin-support/helper.ts': `import './index.ts'; import type { Client } from 'https://example.test/client.ts'; export const foo=1;`,
  });
  assert.equal((await checkFunctionPackage(root, 'admin-support')).files.length, 3);
});

test('regression: a locally valid sibling auth import is not a deployable package', async t => {
  const root = await fixture(t, {
    'admin-support/index.ts': `import { equalSecret } from '../website-guardian/auth.ts';`,
    'website-guardian/auth.ts': `export const equalSecret = () => true;`,
  });
  await assert.rejects(() => checkFunctionPackage(root, 'admin-support'), /sibling function directories are not deployed/);
});

test('transitive shared re-exports cannot pull in another function', async t => {
  const root = await fixture(t, {
    'admin-support/index.ts': `import '../_shared/auth.ts';`,
    '_shared/auth.ts': `export { equalSecret } from '../website-guardian/auth.ts';`,
    'website-guardian/auth.ts': `export const equalSecret = () => true;`,
  });
  await assert.rejects(() => checkFunctionPackage(root, 'admin-support'), /sibling function directories are not deployed/);
});

test('dynamic and type-only imports also obey package boundaries', async t => {
  for (const source of [`const helper = import('../other/auth.ts');`, `type Helper = import('../other/auth.ts').Helper;`, `/// <reference path="../other/auth.ts" />\nexport {};`]) {
    const root = await fixture(t, { 'admin-support/index.ts': source, 'other/auth.ts': 'export type Helper=string;' });
    await assert.rejects(() => checkFunctionPackage(root, 'admin-support'), /sibling function directories are not deployed/);
  }
});

test('missing local files and computed import paths fail before upload', async t => {
  const missing = await fixture(t, { 'admin-support/index.ts': `import './missing.ts';` });
  await assert.rejects(() => checkFunctionPackage(missing, 'admin-support'), /missing packaged module/);
  const computed = await fixture(t, { 'admin-support/index.ts': `const name='other'; import(name);` });
  await assert.rejects(() => checkFunctionPackage(computed, 'admin-support'), /Computed module import/);
});

test('symlinks cannot make a sibling function look like an included helper', async t => {
  const root = await fixture(t, { 'admin-support/index.ts': `import './auth.ts';`, 'other/auth.ts': 'export {};' });
  await symlink(join(root, 'other/auth.ts'), join(root, 'admin-support/auth.ts'));
  await assert.rejects(() => checkFunctionPackage(root, 'admin-support'), /outside its function directory/);
});

test('Deno type annotations are checked while pinned registry modules stay external', async t => {
  const allowed = await fixture(t, { 'admin-support/index.ts': `// @deno-types="npm:@types/html-to-text@9.0.4"\nimport { compile } from 'npm:html-to-text@10.0.1';` });
  assert.equal((await checkFunctionPackage(allowed, 'admin-support')).files.length, 1);
  const outside = await fixture(t, { 'admin-support/index.ts': `// @deno-types="../other/types.ts"\nimport { compile } from 'npm:html-to-text@10.0.1';`, 'other/types.ts': 'export {};' });
  await assert.rejects(() => checkFunctionPackage(outside, 'admin-support'), /sibling function directories are not deployed/);
});
