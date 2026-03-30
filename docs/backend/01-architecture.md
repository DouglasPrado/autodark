# Arquitetura do Backend

Define as camadas arquiteturais, regras de dependencia, fronteiras de dominio e estrategia de deploy.

> **Implementa:** [docs/blueprint/06-system-architecture.md](../blueprint/06-system-architecture.md) (componentes e deploy) e [docs/blueprint/10-architecture_decisions.md](../blueprint/10-architecture_decisions.md) (ADRs).
> **Complementa:** [docs/frontend/01-architecture.md](../frontend/01-architecture.md) (camadas do frontend).

---

## Camadas Arquiteturais

> Como o backend e organizado internamente? Quais sao as camadas e como se comunicam?

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│   (Controllers, Routes, Middlewares)    │
├─────────────────────────────────────────┤
│           Application Layer             │
│     (Services, DTOs, Validators)        │
├─────────────────────────────────────────┤
│             Domain Layer                │
│  (Entities, Value Objects, Events)      │
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│ (Repositories, Cache, Queue, External)  │
└─────────────────────────────────────────┘
```

| Camada | Contem | Regra de Dependencia |
| --- | --- | --- |
| {{Presentation}} | {{Controllers, routes, middlewares, serializers}} | {{So depende de Application}} |
| {{Application}} | {{Services, DTOs, validators, use cases}} | {{So depende de Domain}} |
| {{Domain}} | {{Entities, value objects, domain events, domain errors}} | {{Nao depende de nenhuma outra camada}} |
| {{Infrastructure}} | {{Repositories, cache, messaging, external clients, ORM}} | {{Implementa interfaces do Domain}} |

<!-- APPEND:camadas -->

---

## Regras de Dependencia

> Quais regras garantem o isolamento entre camadas?

- {{A camada Domain NUNCA importa de Infrastructure ou Presentation}}
- {{Controllers NUNCA acessam repositories diretamente — sempre via Service}}
- {{Services NUNCA retornam entidades de ORM — sempre mapeiam para DTOs ou Domain entities}}
- {{Toda dependencia externa (banco, cache, API) e acessada via interface definida em Domain}}

---

## Fronteiras de Dominio

> Como o backend e dividido em modulos/dominios? Cada modulo encapsula uma area de negocio.

| Modulo/Dominio | Responsabilidade | Entidades Principais | Depende de |
| --- | --- | --- | --- |
| {{Ex: Users}} | {{Registro, autenticacao, perfil}} | {{User, Session}} | {{—}} |
| {{Ex: Orders}} | {{Criacao, pagamento, tracking}} | {{Order, OrderItem}} | {{Users, Products}} |
| {{Ex: Products}} | {{Catalogo, estoque, precos}} | {{Product, Category}} | {{—}} |
| {{Ex: Notifications}} | {{Email, SMS, push}} | {{Notification, Template}} | {{Users}} |

<!-- APPEND:dominios -->

---

## Comunicacao entre Modulos

> Como os modulos se comunicam? Chamada direta, eventos, ou ambos?

| De | Para | Tipo | Mecanismo | Exemplo |
| --- | --- | --- | --- | --- |
| {{Orders}} | {{Users}} | {{Sincrono}} | {{Chamada de Service}} | {{OrderService chama UserService.findById()}} |
| {{Orders}} | {{Notifications}} | {{Assincrono}} | {{Evento via fila}} | {{OrderPaid → envia email de confirmacao}} |
| {{Payments}} | {{Orders}} | {{Assincrono}} | {{Evento via fila}} | {{PaymentConfirmed → atualiza status do pedido}} |

<!-- APPEND:comunicacao -->

---

## Estrategia de Deploy

> Como o backend e implantado em cada ambiente?

| Ambiente | Infraestrutura | Deploy | URL |
| --- | --- | --- | --- |
| {{Development}} | {{Docker Compose local}} | {{Manual}} | {{localhost:3000}} |
| {{Staging}} | {{Ex: ECS / Railway}} | {{CI/CD auto no merge}} | {{staging.api.exemplo.com}} |
| {{Production}} | {{Ex: ECS / Kubernetes}} | {{CI/CD com aprovacao}} | {{api.exemplo.com}} |

**Pipeline CI/CD:**

```
Push → Lint → Test → Build → Deploy Staging → Smoke Test → Deploy Prod
```

<!-- APPEND:deploy -->

> (ver [02-project-structure.md](02-project-structure.md) para a arvore de diretorios)
