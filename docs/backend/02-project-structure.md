# Estrutura do Projeto

Define a arvore de diretorios do backend, o proposito de cada pasta e as convencoes de organizacao de arquivos.

---

## Arvore de Diretorios

> Como o projeto e organizado no filesystem? Cada pasta tem um proposito claro.

```
src/
├── config/                # Configuracoes (env, database, cache, auth)
│   ├── env.ts             # {{Validacao e tipagem de variaveis de ambiente}}
│   ├── database.ts        # {{Configuracao de conexao do banco}}
│   ├── cache.ts           # {{Configuracao do Redis/cache}}
│   └── auth.ts            # {{Configuracao de JWT/OAuth}}
├── domain/                # Entidades e regras de negocio (sem dependencia externa)
│   ├── entities/          # {{Classes/interfaces de entidade com invariantes}}
│   ├── value-objects/     # {{Value objects imutaveis}}
│   ├── events/            # {{Eventos de dominio}}
│   └── errors/            # {{Erros de dominio tipados}}
├── application/           # Casos de uso e servicos de aplicacao
│   ├── services/          # {{Orquestracao de logica de negocio}}
│   ├── dtos/              # {{Data Transfer Objects (request/response)}}
│   └── validators/        # {{Validacao de entrada (schemas)}}
├── infrastructure/        # Implementacoes concretas
│   ├── repositories/      # {{Implementacao de acesso a dados}}
│   ├── cache/             # {{Implementacao de cache}}
│   ├── messaging/         # {{Producers e consumers de fila/eventos}}
│   ├── external/          # {{Clients de APIs externas}}
│   └── orm/               # {{Schema do ORM e migrations}}
├── presentation/          # Interface HTTP
│   ├── controllers/       # {{Handlers de request HTTP}}
│   ├── routes/            # {{Definicao de rotas}}
│   ├── middlewares/       # {{Auth, rate limit, logging, error handler}}
│   └── serializers/       # {{Transformacao de response}}
├── workers/               # {{Jobs assincronos e consumers de fila}}
├── shared/                # Utilitarios compartilhados
│   ├── types/             # {{Tipos globais}}
│   ├── utils/             # {{Funcoes utilitarias puras}}
│   └── constants/         # {{Constantes da aplicacao}}
└── tests/                 # Testes organizados por camada
    ├── unit/              # {{Testes de dominio e services}}
    ├── integration/       # {{Testes com banco/cache reais}}
    └── e2e/               # {{Testes de endpoint ponta a ponta}}
```

<!-- APPEND:estrutura -->

---

## Convencoes de Nomenclatura

> Como arquivos e pastas sao nomeados?

| Tipo | Convencao | Exemplo |
| --- | --- | --- |
| {{Entidade}} | {{PascalCase, singular}} | {{User.ts, Order.ts}} |
| {{Service}} | {{PascalCase + Service}} | {{UserService.ts, OrderService.ts}} |
| {{Controller}} | {{PascalCase + Controller}} | {{UserController.ts}} |
| {{Repository}} | {{PascalCase + Repository}} | {{UserRepository.ts}} |
| {{DTO}} | {{PascalCase + DTO sufixo}} | {{CreateUserDTO.ts, UserResponseDTO.ts}} |
| {{Middleware}} | {{camelCase}} | {{authenticate.ts, rateLimiter.ts}} |
| {{Teste}} | {{arquivo.test.ts ou arquivo.spec.ts}} | {{UserService.test.ts}} |
| {{Migration}} | {{timestamp_descricao}} | {{20240101_create_users.ts}} |
| {{Erro}} | {{PascalCase + Error}} | {{UserNotFoundError.ts}} |
| {{Evento}} | {{PascalCase passado}} | {{UserCreated.ts, OrderPaid.ts}} |

<!-- APPEND:nomenclatura -->

---

## Organizacao por Modulo

> Para backends com multiplos dominios, como organizar por modulo?

```
src/
├── modules/
│   ├── users/
│   │   ├── domain/        # {{Entidades e regras de User}}
│   │   ├── application/   # {{UserService, DTOs}}
│   │   ├── infrastructure/ # {{UserRepository}}
│   │   └── presentation/  # {{UserController, rotas}}
│   ├── orders/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── {{modulo-n}}/
├── shared/                # {{Compartilhado entre modulos}}
└── config/
```

> Escolha entre organizacao **por camada** (src/domain/, src/application/) ou **por modulo** (src/modules/users/). Nao misture.

---

## Arquivos de Configuracao Raiz

> Quais arquivos de configuracao existem na raiz do projeto?

| Arquivo | Proposito |
| --- | --- |
| {{package.json}} | {{Dependencias e scripts}} |
| {{tsconfig.json}} | {{Configuracao TypeScript}} |
| {{.env.example}} | {{Template de variaveis de ambiente}} |
| {{docker-compose.yml}} | {{Servicos locais (banco, cache, fila)}} |
| {{Dockerfile}} | {{Build da imagem de producao}} |
| {{.eslintrc}} | {{Regras de lint}} |
| {{.prettierrc}} | {{Formatacao de codigo}} |
| {{vitest.config.ts}} | {{Configuracao de testes}} |

> (ver [03-domain.md](03-domain.md) para detalhes das entidades)
