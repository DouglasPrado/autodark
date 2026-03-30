# Middlewares

Define o pipeline de request — ordem de execucao, funcao de cada middleware, configuracao e comportamento em caso de falha.

---

## Pipeline de Request

> Em qual ordem os middlewares executam? Cada request passa por esta cadeia.

```
Request
  → 1. RequestId        (gera UUID para tracing)
  → 2. Logger           (loga method, path, inicio)
  → 3. CORS             (configura headers de cross-origin)
  → 4. RateLimiter      (verifica limites por IP/usuario)
  → 5. BodyParser       (parse JSON, limite de tamanho)
  → 6. Authentication   (valida JWT, extrai user do token)
  → 7. Authorization    (verifica role/permissao para a rota)
  → 8. Validation       (valida body/params/query contra schema)
  → 9. Controller       (executa logica via service)
  → 10. Serializer      (formata response, remove campos sensiveis)
  → 11. ErrorHandler    (catch global, formata erro padrao)
  → 12. Logger          (loga status, duracao, response size)
Response
```

---

## Detalhamento de Middlewares

> Para cada middleware, documente funcao, configuracao e erro.

| Middleware | Funcao | Configuracao | Erro se Falhar |
| --- | --- | --- | --- |
| {{RequestId}} | {{Gera UUID v4, adiciona ao header X-Request-Id e ao contexto}} | {{—}} | {{—}} |
| {{Logger}} | {{Loga request e response com correlation ID}} | {{Log level, campos a excluir}} | {{—}} |
| {{CORS}} | {{Configura Access-Control-Allow-*}} | {{Origins, methods, headers permitidos}} | {{Bloqueio de preflight}} |
| {{RateLimiter}} | {{Limita requests por IP/usuario/endpoint}} | {{Redis, limites por rota}} | {{429 Too Many Requests}} |
| {{BodyParser}} | {{Parse JSON body, limita tamanho}} | {{Limite: 1MB default}} | {{413 Payload Too Large}} |
| {{Authentication}} | {{Extrai Bearer token, verifica JWT, carrega user}} | {{Secret key, expiracao, issuer}} | {{401 Unauthorized}} |
| {{Authorization}} | {{Verifica role/permissao do user para a rota}} | {{Matriz de permissoes}} | {{403 Forbidden}} |
| {{Validation}} | {{Valida body/params/query contra schema Zod/Joi}} | {{Schema por rota}} | {{400 Validation Error}} |
| {{ErrorHandler}} | {{Catch-all, transforma excecao em JSON padrao}} | {{Formato de erro, ambiente}} | {{500 Internal Error}} |

<!-- APPEND:middlewares -->

---

## Middlewares Condicionais

> Quais middlewares sao aplicados apenas em rotas especificas?

| Middleware | Rotas | Condicao |
| --- | --- | --- |
| {{Authentication}} | {{Todas exceto /auth/login, /auth/register, /health}} | {{Rota nao esta na whitelist publica}} |
| {{Authorization}} | {{Rotas admin: DELETE, GET /users (listagem)}} | {{Rota exige role especifica}} |
| {{FileUpload}} | {{POST /uploads, PATCH /users/:id/avatar}} | {{Rota aceita multipart/form-data}} |
| {{Idempotency}} | {{POST /orders, POST /payments}} | {{Rota exige Idempotency-Key header}} |

<!-- APPEND:condicionais -->

---

## Configuracao de CORS

> Quais origens, metodos e headers sao permitidos?

| Aspecto | Valor |
| --- | --- |
| {{Origins}} | {{Ex: ["https://app.exemplo.com", "http://localhost:3000"]}} |
| {{Methods}} | {{GET, POST, PATCH, DELETE, OPTIONS}} |
| {{Headers}} | {{Authorization, Content-Type, X-Request-Id, Idempotency-Key}} |
| {{Credentials}} | {{true (para cookies/auth)}} |
| {{Max Age}} | {{86400 (24h)}} |

---

## Configuracao de Rate Limiting

> Quais limites se aplicam por tipo de request?
> **Fonte:** [docs/blueprint/14-scalability.md](../blueprint/14-scalability.md) define a estrategia geral. Esta secao detalha os valores especificos por endpoint.

| Escopo | Limite | Janela | Algoritmo | Storage |
| --- | --- | --- | --- | --- |
| {{Global por IP}} | {{100 req}} | {{1 min}} | {{Sliding window}} | {{Redis}} |
| {{Login}} | {{10 req}} | {{1 min}} | {{Token bucket}} | {{Redis}} |
| {{API por usuario}} | {{1000 req}} | {{1 min}} | {{Sliding window}} | {{Redis}} |
| {{Upload}} | {{5 req}} | {{1 min}} | {{Fixed window}} | {{Redis}} |

**Headers de resposta:**
- `X-RateLimit-Limit: {{limite}}`
- `X-RateLimit-Remaining: {{restante}}`
- `X-RateLimit-Reset: {{timestamp reset}}`

> (ver [09-errors.md](09-errors.md) para como erros sao formatados e retornados)
