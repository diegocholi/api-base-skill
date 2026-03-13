# Playbooks para code agents

Este guia consolida a tomada de decisao operacional para tarefas comuns em consumidores de `@sebrae/api-base`.

Use esta pagina quando voce souber o sintoma ou a intencao da tarefa, mas ainda nao souber quais docs abrir primeiro.

## Hierarquia de fontes

Use esta ordem para decidir o que prevalece:

1. `SKILL.md` define a trilha principal do agente.
2. este guia escolhe o playbook mais adequado.
3. contratos e guias tecnicos especializados definem o comportamento recomendado.
4. o codigo real do consumidor prevalece quando houver divergencia de wiring, scripts ou estrutura.

Se um guia especializado nao encaixar no estado real do consumidor, volte para o playbook de legado ou troubleshooting antes de continuar.

## Como escolher o playbook

- criar artefato novo seguindo scaffold atual: use o playbook de criacao;
- alterar codigo de projeto divergente: use o playbook de legado;
- diagnosticar erro ou comportamento estranho: use o playbook de troubleshooting;
- explicar o framework: use o playbook de explicacao;
- revisar mudanca pronta: use o playbook de review.

Se a tarefa misturar criacao com diagnostico, comece por troubleshooting.
Se a tarefa misturar criacao com legado, trate primeiro o projeto como legado e so depois considere scaffold da CLI.

## Playbook de criacao

1. confirme versao de `@sebrae/api-base` e `@sebrae/api-base-cli`;
2. confirme sinais de scaffold atual em `src/server.ts`, `src/http/zod.ts`, `src/config/env.ts` e scripts do `package.json`;
3. abra `docs/overview.md`, `docs/api.md`, `docs/contracts/README.md` e o contrato especifico;
4. use a CLI apenas para estrutura repetitiva;
5. revise o resultado gerado antes de concluir;
6. valide com `routes:validate`, `env check`, testes e smoke checks reais do consumidor.

## Playbook de legado

1. confirme quais partes ainda seguem o scaffold atual e quais foram customizadas;
2. priorize imports, naming, bootstrap e wiring que ja existem no consumidor;
3. use a documentacao para API publica e contratos estaveis, nao para impor layout novo;
4. prefira edicao manual a scaffold quando houver duvida;
5. registre a divergencia quando a documentacao nao refletir o padrao real do projeto.

## Playbook de troubleshooting

1. descreva o sintoma em uma categoria: bootstrap, rotas, auth, env, banco, cache, fila, OpenAPI ou erro HTTP;
2. confirme scripts reais e variaveis relevantes antes de sugerir comandos;
3. rode o check mais barato que ja existir no projeto;
4. abra `docs/troubleshooting.md` e o contrato tecnico da categoria;
5. se o erro vier de wiring local, priorize o codigo real do consumidor;
6. encerre com a menor validacao que prove o diagnostico.

## Playbook de explicacao

1. defina se o usuario quer visao geral, bootstrap, auth, dados, observabilidade ou operacao;
2. abra apenas `docs/overview.md`, `docs/architecture.md`, `docs/api.md` e os contratos do assunto;
3. use `examples/*.ts` apenas para ilustrar o contrato;
4. cite explicitamente quando estiver inferindo algo a partir da documentacao.

## Playbook de review

1. descubra qual contrato principal a mudanca toca;
2. procure bugs, regressao funcional, risco de compatibilidade e falta de validacao;
3. use `docs/testing.md` para cobrar cobertura minima;
4. so sugira refactor estrutural quando ele for necessario para corrigir comportamento ou manter o contrato.

## Mapa rapido por sintoma

- rota nao aparece: `docs/troubleshooting.md` + `docs/contracts/http-register-route.md`
- auth falha: `docs/troubleshooting.md` + `docs/contracts/security-auth.md`
- OpenAPI incompleto: `docs/troubleshooting.md` + `docs/openapi.md` + `docs/contracts/http-schemas-zod.md`
- erro HTTP fora do contrato: `docs/troubleshooting.md` + `docs/contracts/http-error-handler.md`
- banco, cache ou fila: `docs/troubleshooting.md` + contratos de dados relevantes
- `socket hang up`, timeout perto de 10 segundos ou duvida entre timeout de entrada e saida: `docs/troubleshooting.md` + `docs/env.md`

## Regras de fallback

- se um script documentado nao existir, use o comando real do `package.json`;
- se scaffold e codigo real divergirem, siga o codigo real do consumidor;
- se o contrato e o exemplo divergirem, siga o contrato canonico e trate o exemplo como desatualizado;
- se a tarefa tocar `docs/project-base/*`, deixe isso explicito como manutencao da base e nao como uso comum do consumidor.
- se um guia tecnico nao responder ao sintoma real, volte para troubleshooting ou legado em vez de insistir na trilha errada.
