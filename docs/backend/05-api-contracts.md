# Contratos de API

Define todos os endpoints, DTOs de request/response, status codes e erros por rota. Este documento e o contrato entre frontend e backend.

> **Consumido por:** [docs/frontend/15-api-dependencies.md](../frontend/15-api-dependencies.md) (endpoints que o frontend consome).
> **Erros detalhados em:** [docs/shared/error-ux-mapping.md](../shared/error-ux-mapping.md) (como erros sao exibidos no frontend).

---

## Convencoes Gerais

> Quais padroes se aplicam a todos os endpoints?

| Aspecto | Convencao |
| --- | --- |
| {{Base URL}} | {{/api/v1}} |
| {{Formato}} | {{JSON (application/json)}} |
| {{Autenticacao}} | {{Bearer Token no header Authorization}} |
| {{Paginacao}} | {{?page=1&limit=20 → { data: [], meta: { total, page, limit, pages } }}} |
| {{Ordenacao}} | {{?sort=created_at&order=desc}} |
| {{Filtros}} | {{?status=active&role=admin}} |
| {{Versionamento}} | {{URL path (/v1/)}} |
| {{Rate Limit Headers}} | {{X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset}} |

---

## Mapa de Endpoints

> Lista completa de todos os endpoints agrupados por recurso.

### {{Recurso}} (ex: /users)

| Metodo | Rota | Controller.metodo | Service.metodo | Auth | Descricao |
| --- | --- | --- | --- | --- | --- |
| {{POST}} | {{/api/v1/recurso}} | {{Controller.create}} | {{Service.create}} | {{Publica / JWT / JWT+Role}} | {{Descricao}} |
| {{GET}} | {{/api/v1/recurso}} | {{Controller.list}} | {{Service.list}} | {{JWT}} | {{Listar com paginacao}} |
| {{GET}} | {{/api/v1/recurso/:id}} | {{Controller.findById}} | {{Service.findById}} | {{JWT}} | {{Buscar por ID}} |
| {{PATCH}} | {{/api/v1/recurso/:id}} | {{Controller.update}} | {{Service.update}} | {{JWT+Owner}} | {{Atualizar}} |
| {{DELETE}} | {{/api/v1/recurso/:id}} | {{Controller.delete}} | {{Service.delete}} | {{JWT+Admin}} | {{Remover}} |

<!-- APPEND:endpoints -->

---

## Detalhamento por Endpoint

> Para CADA endpoint, documente request, response e erros.

### `{{METODO}} {{/rota}}` — {{Descricao}}

**Request:**

| Campo | Tipo | Obrigatorio | Validacao | Exemplo |
| --- | --- | --- | --- | --- |
| {{campo1}} | {{string}} | {{sim}} | {{formato, min, max}} | {{valor}} |
| {{campo2}} | {{number}} | {{nao}} | {{min, max}} | {{valor}} |

**Response {{2xx}}:**

```json
{
  "{{campo1}}": "{{valor}}",
  "{{campo2}}": "{{valor}}"
}
```

**Erros:**

| Status | Codigo | Mensagem | Quando |
| --- | --- | --- | --- |
| {{400}} | {{VALIDATION_ERROR}} | {{Campos invalidos}} | {{Request invalido}} |
| {{401}} | {{UNAUTHORIZED}} | {{Nao autenticado}} | {{Token ausente/invalido}} |
| {{403}} | {{FORBIDDEN}} | {{Sem permissao}} | {{Role insuficiente}} |
| {{404}} | {{NOT_FOUND}} | {{Recurso nao encontrado}} | {{ID inexistente}} |
| {{409}} | {{CONFLICT}} | {{Recurso ja existe}} | {{Violacao de unicidade}} |
| {{422}} | {{BUSINESS_RULE}} | {{Regra de negocio violada}} | {{Ex: transicao invalida}} |

<!-- APPEND:detalhamento -->

<details>
<summary>Exemplo — POST /api/v1/users</summary>

### `POST /api/v1/users` — Registrar Usuario

**Request:**

| Campo | Tipo | Obrigatorio | Validacao | Exemplo |
| --- | --- | --- | --- | --- |
| email | string | sim | email valido, max 255 | "user@example.com" |
| name | string | sim | min 2, max 100 | "Joao Silva" |
| password | string | sim | min 8, 1 maiuscula, 1 numero | "Senha123" |

**Response 201:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "Joao Silva",
  "status": "created",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Erros:**

| Status | Codigo | Mensagem | Quando |
| --- | --- | --- | --- |
| 400 | VALIDATION_ERROR | "email: formato invalido" | Campos invalidos |
| 409 | USER_ALREADY_EXISTS | "Email ja cadastrado" | Email duplicado |
| 422 | WEAK_PASSWORD | "Senha nao atende requisitos" | Senha fraca |

</details>

---

## DTOs (Data Transfer Objects)

> Quais DTOs existem e quais campos possuem?

### Request DTOs

| DTO | Campos | Usado em |
| --- | --- | --- |
| {{CreateUserDTO}} | {{email, name, password}} | {{POST /users}} |
| {{UpdateUserDTO}} | {{name?, email?}} | {{PATCH /users/:id}} |
| {{ListUsersQueryDTO}} | {{page, limit, search?, role?, sort?}} | {{GET /users}} |

### Response DTOs

| DTO | Campos | Exclui | Usado em |
| --- | --- | --- | --- |
| {{UserResponseDTO}} | {{id, email, name, role, status, createdAt}} | {{passwordHash, deletedAt}} | {{Todos endpoints de User}} |
| {{PaginatedResponseDTO}} | {{data: T[], meta: { total, page, limit, pages }}} | {{—}} | {{Todas as listagens}} |

<!-- APPEND:dtos -->

> (ver [06-services.md](06-services.md) para a logica que cada endpoint executa)
