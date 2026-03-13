# Manutenção da skill

Este guia descreve como manter a `api-base-skill` consistente e verificável neste repositório.

## Fonte canônica

Use esta ordem para evitar drift:

1. `SKILL.md` define o fluxo operacional que o agente deve seguir.
2. `docs/agent-playbooks.md` consolida a tomada de decisao operacional entre os guias.
3. `docs/contracts/*` definem contratos canônicos de comportamento.
4. `docs/examples.md` e `examples/*.ts` ilustram os contratos.
5. `docs/testing.md` descreve como validar a skill localmente.

Se houver divergência:

- preserve `SKILL.md` como contrato de navegação do agente;
- preserve `docs/agent-playbooks.md` como ponte entre intencao da tarefa e leitura dos guias;
- preserve `docs/contracts/*` como contrato de comportamento publicado;
- atualize os exemplos no mesmo fluxo da mudança do contrato;
- reduza repetição nos guias gerais e aponte para a fonte canônica.

## Checks locais

Rode estes comandos a partir da raiz desta skill:

```bash
npm run docs:links
npm run docs:examples:typecheck
npm run docs:skill:check
npm run docs:check
```

O typecheck dos exemplos usa declarações locais em `types/*.d.ts` para manter este repositório autônomo.
Esses shims existem para validar imports, assinaturas usadas na documentação e erros estruturais dos exemplos.
Eles não substituem a validação contra o pacote real do framework.

## Checklist de revisão

- ao mudar um contrato canônico, atualize o exemplo correspondente em `examples/`;
- ao adicionar ou remover um exemplo, atualize `docs/examples.md`;
- ao adicionar links locais em Markdown, rode `npm run docs:links`;
- ao alterar `SKILL.md`, preserve a sequência mínima de leitura e os caminhos citados;
- antes de concluir uma mudança na skill, rode `npm run docs:check`.
