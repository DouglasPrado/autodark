# Erros e Excecoes

Define a hierarquia de excecoes, formato padrao de erro, catalogo de codigos e estrategia de tratamento.

> **Consumido por:** [docs/shared/error-ux-mapping.md](../shared/error-ux-mapping.md) (como o frontend trata cada erro).

---

## Formato Padrao de Erro

> Todo erro retornado pela API segue este formato JSON.

```json
{
  "error": {
    "code": "{{CODIGO_DO_ERRO}}",
    "message": "{{Mensagem legivel para o usuario}}",
    "status": {{status_http}},
    "details": [
      { "field": "{{campo}}", "message": "{{detalhe da validacao}}" }
    ],
    "requestId": "{{uuid-do-request}}",
    "timestamp": "{{ISO8601}}"
  }
}
```

**Regras:**
- `code` e sempre UPPER_SNAKE_CASE
- `message` e sempre em português e segura para exibir ao usuario
- `details` so aparece em erros de validacao (400)
- `requestId` vem do middleware RequestId
- Stack trace NUNCA aparece em producao

---

## Hierarquia de Excecoes

> Toda excecao herda de AppError. Cada tipo mapeia para um status HTTP.

```
AppError (base)
├── ValidationError (400)
│   ├── {{InvalidFieldError}}
│   └── {{MissingFieldError}}
├── AuthenticationError (401)
│   ├── {{InvalidCredentialsError}}
│   ├── {{TokenExpiredError}}
│   └── {{InvalidTokenError}}
├── AuthorizationError (403)
│   ├── {{InsufficientPermissionsError}}
│   └── {{ResourceOwnershipError}}
├── NotFoundError (404)
│   ├── {{EntidadeNotFoundError}}
│   └── {{ResourceNotFoundError}}
├── ConflictError (409)
│   ├── {{DuplicateResourceError}}
│   └── {{ConcurrencyConflictError}}
├── BusinessRuleError (422)
│   ├── {{InvalidStateTransitionError}}
│   └── {{RuleViolationError}}
├── RateLimitError (429)
└── ExternalServiceError (502)
    ├── {{PaymentGatewayError}}
    ├── {{EmailServiceError}}
    └── {{TimeoutError}}
```

<!-- APPEND:hierarquia -->

---

## Catalogo de Codigos de Erro

> Cada codigo e unico e documentado. Frontend usa o `code` para decidir como exibir o erro.

| Codigo | Status | Mensagem | Quando | Retentavel |
| --- | --- | --- | --- | --- |
| {{VALIDATION_ERROR}} | {{400}} | {{Campos invalidos}} | {{Schema falhou}} | {{Nao}} |
| {{INVALID_CREDENTIALS}} | {{401}} | {{Email ou senha incorretos}} | {{Login falhou}} | {{Nao}} |
| {{TOKEN_EXPIRED}} | {{401}} | {{Token expirado}} | {{JWT vencido}} | {{Sim (refresh)}} |
| {{INVALID_TOKEN}} | {{401}} | {{Token invalido}} | {{JWT malformado}} | {{Nao}} |
| {{INSUFFICIENT_PERMISSIONS}} | {{403}} | {{Sem permissao}} | {{Role sem acesso}} | {{Nao}} |
| {{RESOURCE_OWNERSHIP}} | {{403}} | {{Recurso nao pertence ao usuario}} | {{Tentou acessar dado de outro}} | {{Nao}} |
| {{NOT_FOUND}} | {{404}} | {{Recurso nao encontrado}} | {{ID inexistente}} | {{Nao}} |
| {{DUPLICATE_RESOURCE}} | {{409}} | {{Recurso ja existe}} | {{Violacao de unicidade}} | {{Nao}} |
| {{INVALID_STATE_TRANSITION}} | {{422}} | {{Transicao de estado invalida}} | {{Ex: cancelar pedido entregue}} | {{Nao}} |
| {{RATE_LIMIT_EXCEEDED}} | {{429}} | {{Muitas requisicoes}} | {{Rate limit atingido}} | {{Sim (apos cooldown)}} |
| {{EXTERNAL_SERVICE_ERROR}} | {{502}} | {{Servico externo indisponivel}} | {{Timeout/falha em API terceira}} | {{Sim}} |
| {{INTERNAL_ERROR}} | {{500}} | {{Erro interno}} | {{Erro nao tratado}} | {{Sim}} |

<!-- APPEND:codigos -->

---

## Estrategia de Tratamento

> Como diferentes tipos de erro sao tratados?

| Tipo de Erro | Onde Tratar | Logar | Alertar | Retry |
| --- | --- | --- | --- | --- |
| {{Validacao}} | {{Middleware de validacao}} | {{Debug}} | {{Nao}} | {{Nao}} |
| {{Autenticacao}} | {{Middleware de auth}} | {{Warn}} | {{Se > 10/min por IP}} | {{Nao}} |
| {{Negocio}} | {{Service}} | {{Info}} | {{Nao}} | {{Nao}} |
| {{Externo}} | {{Client externo}} | {{Error}} | {{Se > 5% taxa de falha}} | {{Sim, com backoff}} |
| {{Interno}} | {{ErrorHandler global}} | {{Error + stack}} | {{Sempre}} | {{Depende}} |

> (ver [10-validation.md](10-validation.md) para regras de validacao por campo)
