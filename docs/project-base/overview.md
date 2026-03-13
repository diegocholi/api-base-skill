# Projeto base

Esta área concentra documentação para quem mantém o monorepo da API-BASE, evolui os pacotes publicados ou valida paridade entre a base e os consumidores.

## Conteúdo desta pasta

- [CLI no monorepo](./cli-monorepo.md)
- [Link local de pacotes](./local-link.md)
- [Consumer parity dos GAPs 1-4](./consumer-parity-gaps.md)

## Quando usar esta área

Use `docs/project-base/*` quando o assunto envolver:

- desenvolvimento do monorepo;
- testes de pacote antes de publicar;
- validação de paridade entre runtime, CLI e scaffold;
- manutenção interna da base.

Para code agents:

- nao abra `docs/project-base/*` por padrao em tarefas de consumidor;
- use esta area apenas quando o objetivo for manter a base, o monorepo ou a paridade entre scaffold e runtime;
- se a tarefa for criar rota, modulo, auth, cache, fila ou operacao de um consumidor, permaneça em `docs/*` de consumidor.

Se o objetivo for construir ou operar um serviço consumidor, comece por [Visão geral](../overview.md).
