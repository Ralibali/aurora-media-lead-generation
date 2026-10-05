import { readFile, realpath } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Lovable packages one function directory plus _shared. Full-repository typecheck
// alone cannot catch a valid local import that will be absent from that upload.
export const FUNCTION_PACKAGES = ['admin-portfolio', 'admin-support', 'admin-support-mailbox', 'support-ingest', 'website-guardian'];
const inside = (root, path) => path === root || path.startsWith(`${root}${sep}`);

function imports(source, filename) {
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const dependencies = new Set(file.referencedFiles.map(reference => reference.fileName));
  const add = expression => {
    if (!expression || !ts.isStringLiteralLike(expression)) throw new Error(`Computed module import cannot be verified in ${filename}`);
    dependencies.add(expression.text);
  };
  const visit = node => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      add(node.moduleSpecifier);
      for (const comment of ts.getLeadingCommentRanges(source, node.pos) ?? []) {
        const directive = source.slice(comment.pos, comment.end).match(/@deno-types\s*=\s*["']([^"']+)["']/);
        if (directive) dependencies.add(directive[1]);
      }
    }
    if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) add(node.moduleReference.expression);
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) add(node.arguments[0]);
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) add(node.argument.literal);
    ts.forEachChild(node, visit);
  };
  visit(file);
  return [...dependencies];
}

export async function checkFunctionPackage(functionsRoot, name) {
  const root = await realpath(functionsRoot);
  const ownRoot = resolve(root, name), sharedRoot = resolve(root, '_shared');
  const visited = new Set();
  const visit = async path => {
    const target = await realpath(path).catch(() => { throw new Error(`${name}: missing packaged module ${relative(root, path)}`); });
    if (!inside(ownRoot, target) && !inside(sharedRoot, target)) throw new Error(`${name}: ${relative(root, target)} is outside its function directory and _shared`);
    if (visited.has(target)) return;
    visited.add(target);
    const source = await readFile(target, 'utf8');
    for (const specifier of imports(source, relative(root, target))) {
      if (/^(https?:|npm:|jsr:|node:)/.test(specifier)) continue;
      if (!specifier.startsWith('.') || isAbsolute(specifier)) throw new Error(`${name}: unsupported local module ${specifier} in ${relative(root, target)}`);
      const dependency = resolve(dirname(target), specifier);
      if (!inside(ownRoot, dependency) && !inside(sharedRoot, dependency)) throw new Error(`${name}: ${relative(root, target)} imports ${specifier}; sibling function directories are not deployed`);
      await visit(dependency);
    }
  };
  await visit(resolve(ownRoot, 'index.ts'));
  return { name, files: [...visited].map(path => relative(root, path)).sort() };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const checks = await Promise.allSettled(FUNCTION_PACKAGES.map(name => checkFunctionPackage(resolve('supabase/functions'), name)));
  for (const result of checks) {
    if (result.status === 'rejected') { console.error(result.reason.message); process.exitCode = 1; }
    else console.log(`${result.value.name}: ${result.value.files.length} local modules fit the deployed package`);
  }
}
