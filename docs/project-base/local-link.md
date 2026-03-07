# Link local dos pacotes

Use este guia para validar alterações locais dos pacotes em um consumidor real antes da publicação.

## Fluxo

No monorepo:

```bash
pnpm --filter @sebrae/api-base build
cd packages/api-base
pnpm link --global
```

No consumidor:

```bash
pnpm link --global @sebrae/api-base
```

Repita o mesmo processo para `@sebrae/api-base-cli` quando necessário.

## Cuidados

- faça o link a partir de `packages/api-base` ou `packages/api-base-cli`, não da raiz;
- sempre gere novo `dist/` antes de retestar;
- para remover o link, use `pnpm unlink <pacote>` no consumidor e rode `pnpm install`.
