# Implantação

Este guia cobre apenas decisões operacionais do serviço consumidor.

## Antes do rollout

- execute `pnpm run db:migrate` antes de subir novas réplicas;
- garanta que `ENV_FALLBACK_ENABLED=false` em produção;
- revise `HTTP_TRUST_PROXY`, CORS, rate limit, auth e métricas conforme o ambiente.

## Estratégias de migração

Job dedicado:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: api-base-migrate
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: migrate
          image: your-image:tag
          command: ['pnpm', 'run', 'db:migrate']
```

Step no pipeline:

```bash
pnpm run db:migrate
```

Init container, quando aceito pelo ambiente:

```yaml
initContainers:
  - name: migrate
    image: your-image:tag
    command: ['pnpm', 'run', 'db:migrate']
```

## Boas práticas

- mantenha Swagger desabilitado em produção, salvo necessidade explícita;
- exponha `/ready` somente quando banco e dependências críticas estiverem prontos;
- rode workers em processos separados quando houver fila ou outbox;
- trate secrets fora do repositório.

## Referências relacionadas

- [Variáveis de ambiente](./env.md)
- [Migrações](./migrations.md)
- [Workers](./workers.md)
- [Cloud Run](./deploy-cloudrun.md)
