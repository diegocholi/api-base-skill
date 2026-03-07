---
name: api-base-skill
description: Use esta skill para criar, manter, depurar e explicar projetos que usam o framework api-base.
---

# Quando usar esta skill

Use esta skill quando o repositório:
- contiver `api-base.on`
- tiver dependência `@sebrae/api-base` e `@sebrae/api-base-cli`
- possuir pastas `src/http/routes` e `src/modules`
- mencionar "api-base" em README, docs ou código

Também use quando o usuário pedir para:
- criar módulos, handlers, pipelines ou adapters do framework
- explicar a arquitetura do framework
- migrar código legado para o framework
- diagnosticar erros comuns do runtime do framework

# O que você deve saber

A api-base é baseado em:
- Rotas declaradas por arquivos na pasta `src/http/routes`
- módulos declarativos na pasta `src/modules`
- ciclo de vida `bootstrap -> init -> run -> shutdown`
- adapters para integração externa
- CLI para criação e manutenção de código

# Regras de implementação

- Sempre preserve a estrutura oficial do framework.
- Prefira os helpers nativos antes de criar abstrações novas.
- Não invente APIs que não existam na documentação.
- Ao gerar código, siga os padrões descritos em `docs/api.md` e `docs/examples.md`.
- Ao alterar código existente, mantenha compatibilidade com a versão atual do framework.
- Ao criar novos módulos, valide naming, registro no container e hooks de lifecycle.

# Fluxo recomendado

1. Identifique a versão do framework no projeto.
2. Leia `docs/overview.md` e `docs/api.md` antes de propor mudanças grandes.
3. Verifique exemplos em `examples/`.
4. Gere ou edite código conforme os padrões oficiais.
5. Valide imports, registro no container e ciclo de vida.
6. Se houver script de validação, execute-o.

# Restrições

- Não usar APIs deprecated, salvo quando o usuário pedir compatibilidade legada.
- Não misturar padrões de versões diferentes.
- Não mover arquivos sem necessidade.

# Referências locais

- `docs/overview.md`
- `docs/architecture.md`
- `docs/api.md`
- `docs/examples.md`

# Comandos úteis

```bash
bash scripts/validate.sh