declare module 'node:path' {
  export function resolve(...segments: string[]): string;
}

declare const process: {
  argv: string[];
  cwd(): string;
  env: Record<string, string | undefined>;
};

declare const console: {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
};
