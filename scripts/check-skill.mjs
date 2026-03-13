import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const failures = [];

const assertExists = (relativePath) => {
  if (!fs.existsSync(path.join(rootDir, relativePath))) {
    failures.push(`Missing required file: ${relativePath}`);
  }
};

const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

[
  'SKILL.md',
  'package.json',
  'tsconfig.json',
  'docs/overview.md',
  'docs/api.md',
  'docs/contracts/README.md',
  'docs/examples.md',
  'docs/testing.md',
  'docs/maintaining-this-skill.md',
  'examples/tsconfig.json',
].forEach(assertExists);

const examplesDoc = read('docs/examples.md');
const exampleFiles = fs
  .readdirSync(path.join(rootDir, 'examples'))
  .filter((name) => name.endsWith('.ts') && name !== 'tsconfig.json');

for (const exampleFile of exampleFiles) {
  if (!examplesDoc.includes(exampleFile)) {
    failures.push(`docs/examples.md does not reference ${exampleFile}`);
  }
}

const packageJson = JSON.parse(read('package.json'));
for (const scriptName of ['docs:links', 'docs:examples:typecheck', 'docs:skill:check', 'docs:check']) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json is missing script ${scriptName}`);
  }
}

const skillContents = read('SKILL.md');
for (const requiredReference of [
  'docs/overview.md',
  'docs/api.md',
  'docs/contracts/README.md',
  'docs/examples.md',
  'docs/testing.md',
]) {
  if (!skillContents.includes(requiredReference)) {
    failures.push(`SKILL.md no longer references ${requiredReference}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log(`Validated ${exampleFiles.length} examples and the skill maintenance contract.`);
