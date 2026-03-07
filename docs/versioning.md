# Versionamento do template

Este repositório usa SemVer para o template, mesmo não sendo um pacote publicado.
A versão serve para rastrear compatibilidade e mudanças relevantes no repositório.

## Formato

- vMAJOR.MINOR.PATCH

## Regras de bump

- MAJOR: mudança que quebra contratos internos do template.
  Exemplos:
  - shape de erro padrão
  - padrão de plugins ou hooks
  - convenção de paths/rotas
  - alteracao de comportamento padrão com impacto em código existente
- MINOR: nova feature compatível.
  Exemplos:
  - novos plugins opcionais
  - novas variáveis de ambiente com default seguro
  - novos módulos ou ferramentas não obrigatórios
- PATCH: correções e melhorias internas.
  Exemplos:
  - fix de bug
  - ajustes de performance
  - refino de docs sem impacto funcional

## O que e breaking change no contexto do template

Considere breaking quando a atualizacao exige alteracao no projeto gerado ou
pode alterar o comportamento sem mudança explícita do usuário. Exemplos:

- Mudança no contrato de erro (campos, status, shape)
- Mudança na forma de registrar rotas ou validar schema
- Alteracao no pipeline de build/test que exige nova config
- Remoção de variável de ambiente ou mudança de default com efeito funcional

## Compatibilidade minima

Ao publicar uma nova versão do template, declarar compatibilidade minima para:

- Node.js (ex: >= 20.0.0)
- Banco de dados principal (ex: Postgres >= 14)
- Redis (ex: >= 6)

Se a compatibilidade minima mudar, isso e MAJOR.

## Processo de release

- Atualizar o CHANGELOG.md com as mudanças da versão.
- Atualizar a versão em package.json (controle interno).
- Criar tag git no formato vX.Y.Z.
