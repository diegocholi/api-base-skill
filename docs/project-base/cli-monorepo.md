# CLI no monorepo

Use este guia apenas ao desenvolver `@sebrae/api-base-cli` dentro deste repositório.

## Execução

```bash
pnpm run cli:dev -- <comando>
```

Equivalente:

```bash
pnpm --filter @sebrae/api-base-cli cli:dev -- <comando>
```

## Comandos mais úteis

- `init`
- `generate module <name>`
- `generate route <path>`
- `routes:list`
- `routes:validate`
- `db create <name>`
- `db migrate`

## Observações

- use aspas no zsh quando houver `[]` no path;
- este fluxo é para manutenção da base, não para projetos consumidores;
- para uso em consumidores, consulte [CLI](../cli.md).
