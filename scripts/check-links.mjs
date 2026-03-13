import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const markdownFiles = [];

const collectMarkdownFiles = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(fullPath);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      markdownFiles.push(fullPath);
    }
  }
};

const isIgnoredLink = (target) =>
  target.startsWith('http://') ||
  target.startsWith('https://') ||
  target.startsWith('mailto:') ||
  target.startsWith('#');

const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
const missingLinks = [];

collectMarkdownFiles(rootDir);

for (const filePath of markdownFiles) {
  const contents = fs.readFileSync(filePath, 'utf8');

  for (const match of contents.matchAll(linkPattern)) {
    const rawTarget = match[1];
    if (isIgnoredLink(rawTarget)) {
      continue;
    }

    const normalizedTarget = rawTarget.split('#', 1)[0];
    const resolvedPath = path.resolve(path.dirname(filePath), normalizedTarget);

    if (!fs.existsSync(resolvedPath)) {
      missingLinks.push({
        filePath: path.relative(rootDir, filePath),
        rawTarget,
      });
    }
  }
}

if (missingLinks.length > 0) {
  for (const issue of missingLinks) {
    console.error(`${issue.filePath}: missing link target ${issue.rawTarget}`);
  }
  process.exit(1);
}

console.log(`Validated ${markdownFiles.length} markdown files with local links.`);
