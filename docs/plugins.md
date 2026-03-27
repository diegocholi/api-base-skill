# Plugins do consumidor

Use este guia quando o consumidor precisar um plugin próprio para decorar o app com capacidades
locais, sem espalhar `app.decorate(...)` no `server.ts`.

Casos comuns:

- RBAC dinâmico com `resolveRoles` e `resolvePermissions`;
- decorators compartilhados entre rotas do consumidor;
- integração local que depende de `db`, `cache` ou configuração do domínio.

Padrão recomendado:

- crie o arquivo em `src/modules/<modulo>/http/<nome>.plugin.ts`;
- receba `env` e dependências locais por options;
- decore apenas contratos usados por rotas, guards ou outros plugins;
- registre o plugin depois de cache/db quando ele depender desses adapters.

Exemplo canônico da skill:

- `examples/auth-rbac-plugin-example.ts`

Registro típico:

```ts
const app = createApp({ env, routesDir: resolveRoutesDir() });

await app.register(authRbacPlugin, { env });
```

Para decorators customizados do consumidor:

- registre o decorator no plugin com `app.decorate(...)`;
- declare a extensão de `FastifyInstance` em `src/http/fastify-context.d.ts`;
- importe `@sebrae/api-base/http/fastify-context` nesse arquivo `.d.ts`;
- use o decorator diretamente em `request.server.<decorator>` nas rotas;
- não faça cast manual por rota quando a augmentation estiver correta.
- se o consumidor usar aliases locais como `AppFastifyInstance`, reflita o decorator nesse alias tambem.

Exemplo:

```ts
// src/http/types.ts
import type { ApiBaseFastifyInstance } from '@sebrae/api-base';
import type { Client as MinioClient } from 'minio';

import type { AppEnv } from '@/config/env';

export type AppFastifyInstance = ApiBaseFastifyInstance<AppEnv> & {
  minio: MinioClient;
};
```

Para RBAC dinâmico, prefira os helpers públicos:

- `createRolesResolver`
- `createPermissionsResolver`
