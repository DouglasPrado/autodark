# Glossario Ubiquo

> **Fonte unica de termos do dominio.** Todos os blueprints (tecnico, backend, frontend, business) devem usar estes termos. Nao crie glossarios separados — referencie este arquivo.

| Termo | Definicao | Nao Confundir Com | Usado em |
| --- | --- | --- | --- |
| {{Termo 1}} | {{Definicao precisa do conceito no contexto do sistema}} | {{Termo similar que tem significado diferente}} | {{Entidades, endpoints, UI}} |
| {{Termo 2}} | {{Definicao precisa}} | {{Termo similar}} | {{Onde e usado}} |

<!-- APPEND:termos -->

---

## Acronimos

| Sigla | Significado | Contexto |
| --- | --- | --- |
| {{RBAC}} | {{Role-Based Access Control}} | {{Autorizacao}} |
| {{JWT}} | {{JSON Web Token}} | {{Autenticacao}} |
| {{DTO}} | {{Data Transfer Object}} | {{API contracts}} |
| {{DLQ}} | {{Dead Letter Queue}} | {{Mensageria}} |
| {{ADR}} | {{Architecture Decision Record}} | {{Decisoes}} |
| {{SLA}} | {{Service Level Agreement}} | {{Operacoes}} |
| {{SLO}} | {{Service Level Objective}} | {{Observabilidade}} |
| {{RPO}} | {{Recovery Point Objective}} | {{Disaster recovery}} |
| {{RTO}} | {{Recovery Time Objective}} | {{Disaster recovery}} |
| {{MoSCoW}} | {{Must/Should/Could/Won't}} | {{Priorizacao}} |

<!-- APPEND:acronimos -->

---

## Convencoes de Nomenclatura

> Regras que se aplicam a todos os blueprints.

| Contexto | Convencao | Exemplo |
| --- | --- | --- |
| {{Entidades}} | {{PascalCase, singular, ingles}} | {{User, Order, Product}} |
| {{Campos}} | {{camelCase, ingles}} | {{createdAt, userId, orderTotal}} |
| {{Endpoints}} | {{kebab-case, plural, ingles}} | {{/api/v1/users, /api/v1/order-items}} |
| {{Eventos}} | {{PascalCase, passado, ingles}} | {{UserCreated, OrderPaid}} |
| {{Estados}} | {{lowercase, ingles}} | {{created, active, suspended, shipped}} |
| {{Erros}} | {{UPPER_SNAKE_CASE}} | {{USER_NOT_FOUND, VALIDATION_ERROR}} |
| {{Tabelas}} | {{snake_case, plural}} | {{users, order_items}} |

<!-- APPEND:convencoes -->

> Este arquivo e referenciado por:
> - `docs/blueprint/04-domain-model.md` (glossario de dominio)
> - `docs/backend/03-domain.md` (implementacao de entidades)
> - `docs/frontend/04-components.md` (nomes de componentes baseados no dominio)
> - `docs/business/00-business-context.md` (termos de negocio)
