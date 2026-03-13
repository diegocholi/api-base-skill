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
  'docs/agent-playbooks.md',
  'docs/api.md',
  'docs/openapi.md',
  'docs/multipart.md',
  'docs/env.md',
  'docs/contracts/README.md',
  'docs/contracts/security-auth.md',
  'docs/contracts/http-schemas-zod.md',
  'docs/examples.md',
  'docs/testing.md',
  'docs/maintaining-this-skill.md',
  'docs/troubleshooting.md',
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
  'docs/agent-playbooks.md',
  'docs/api.md',
  'docs/contracts/README.md',
  'docs/examples.md',
  'docs/testing.md',
]) {
  if (!skillContents.includes(requiredReference)) {
    failures.push(`SKILL.md no longer references ${requiredReference}`);
  }
}

for (const [filePath, requiredReferences] of [
  ['docs/overview.md', ['./agent-playbooks.md']],
  ['docs/api.md', ['agent-playbooks.md']],
  ['docs/openapi.md', ['agent-playbooks.md']],
  ['docs/multipart.md', ['agent-playbooks.md']],
  ['docs/env.md', ['agent-playbooks.md']],
  ['docs/contracts/README.md', ['../agent-playbooks.md']],
  ['docs/contracts/security-auth.md', ['../agent-playbooks.md']],
  ['docs/contracts/http-schemas-zod.md', ['../agent-playbooks.md']],
  ['docs/testing.md', ['agent-playbooks.md']],
  ['docs/troubleshooting.md', ['agent-playbooks.md']],
  ['docs/maintaining-this-skill.md', ['docs/agent-playbooks.md']],
]) {
  const contents = read(filePath);
  for (const requiredReference of requiredReferences) {
    if (!contents.includes(requiredReference)) {
      failures.push(`${filePath} is missing required reference ${requiredReference}`);
    }
  }
}

for (const requiredSection of [
  '# Como escolher a trilha da tarefa',
  '# Hierarquia de fontes',
  '# Sinais de scaffold atual vs legado',
  '# Playbooks por cenário',
  '# Roteamento rapido de leitura',
  '# Quando ignorar a documentacao generica e priorizar o consumidor',
]) {
  if (!skillContents.includes(requiredSection)) {
    failures.push(`SKILL.md is missing required section ${requiredSection}`);
  }
}

const playbooksContents = read('docs/agent-playbooks.md');
for (const requiredSection of [
  '## Hierarquia de fontes',
  '## Playbook de criacao',
  '## Playbook de legado',
  '## Playbook de troubleshooting',
  '## Playbook de explicacao',
  '## Playbook de review',
  '## Regras de fallback',
]) {
  if (!playbooksContents.includes(requiredSection)) {
    failures.push(`docs/agent-playbooks.md is missing required section ${requiredSection}`);
  }
}

for (const [filePath, requiredSnippets] of [
  ['docs/openapi.md', ['Gatilho de retorno:', 'priorize o codigo do consumidor']],
  ['docs/multipart.md', ['Gatilho de retorno:', 'priorize o comportamento real do projeto']],
  ['docs/env.md', ['Gatilho de retorno:', 'siga `src/config/env.ts`']],
  ['docs/contracts/security-auth.md', ['Gatilho de retorno:', 'priorize o codigo real', 'request.user.sub', 'Shape minimo de `request.user`']],
  ['docs/contracts/http-schemas-zod.md', ['Gatilho de retorno:', 'preserve compatibilidade']],
]) {
  const contents = read(filePath);
  for (const requiredSnippet of requiredSnippets) {
    if (!contents.includes(requiredSnippet)) {
      failures.push(`${filePath} is missing required guidance snippet ${requiredSnippet}`);
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log(`Validated ${exampleFiles.length} examples and the skill maintenance contract.`);
