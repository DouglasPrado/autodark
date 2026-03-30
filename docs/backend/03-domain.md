# Dominio

Define as entidades do sistema, value objects, regras de negocio (invariantes), eventos de dominio e maquinas de estado. Esta e a camada mais interna — nao depende de nenhuma outra.

---

## Glossario Ubiquo

> **Fonte unica:** [docs/shared/glossary.md](../shared/glossary.md). Nao duplique termos aqui — consulte e atualize o glossario compartilhado.

---

## Entidades

> Para cada entidade, documente atributos, invariantes, metodos e eventos. Cada entidade encapsula suas proprias regras.

### {{NomeEntidade}}

**Descricao:** {{O que ela representa no dominio}}

**Atributos:**

| Campo | Tipo | Obrigatorio | Validacao | Descricao |
| --- | --- | --- | --- | --- |
| {{id}} | {{UUID}} | {{sim}} | {{auto-generated}} | {{Identificador unico}} |
| {{campo2}} | {{string}} | {{sim}} | {{formato, min, max}} | {{Descricao do campo}} |
| {{status}} | {{enum}} | {{sim}} | {{valores permitidos}} | {{Estado atual da entidade}} |
| {{createdAt}} | {{datetime}} | {{sim}} | {{auto, imutavel}} | {{Data de criacao}} |
| {{updatedAt}} | {{datetime}} | {{sim}} | {{auto}} | {{Data de atualizacao}} |
| {{deletedAt}} | {{datetime}} | {{nao}} | {{nullable}} | {{Soft delete}} |

**Invariantes (regras que NUNCA podem ser violadas):**

- {{Invariante 1 — ex: email deve ser unico em todo o sistema}}
- {{Invariante 2 — ex: status so transiciona conforme maquina de estados}}
- {{Invariante 3 — ex: preco nunca pode ser negativo}}

**Metodos:**

| Metodo | Parametros | Retorno | Descricao |
| --- | --- | --- | --- |
| {{create()}} | {{CreateDTO}} | {{Entidade}} | {{Cria instancia validada, emite evento de criacao}} |
| {{update()}} | {{UpdateDTO}} | {{void}} | {{Atualiza campos permitidos, valida invariantes}} |
| {{metodoNegocio()}} | {{parametros}} | {{retorno}} | {{Descricao do comportamento}} |

**Eventos Emitidos:**

| Evento | Quando | Payload |
| --- | --- | --- |
| {{EntidadeCriada}} | {{Apos criacao}} | {{id, campos principais, timestamp}} |
| {{EntidadeAtualizada}} | {{Apos atualizacao}} | {{id, campos alterados, timestamp}} |

<!-- APPEND:entidades -->

<details>
<summary>Exemplo — Entidade User</summary>

### User

**Descricao:** Representa um usuario do sistema com credenciais e perfil.

**Atributos:**

| Campo | Tipo | Obrigatorio | Validacao | Descricao |
| --- | --- | --- | --- | --- |
| id | UUID | sim | auto-generated | Identificador unico |
| email | string | sim | email valido, unico, max 255 | Email de login |
| name | string | sim | min 2, max 100 | Nome completo |
| passwordHash | string | sim | bcrypt hash | Senha hasheada |
| role | enum | sim | admin, manager, user | Perfil de acesso |
| status | enum | sim | created, active, suspended, inactive | Estado atual |
| createdAt | datetime | sim | auto, imutavel | Data de criacao |
| updatedAt | datetime | sim | auto | Ultima atualizacao |
| deletedAt | datetime | nao | nullable | Soft delete |

**Invariantes:**
- email deve ser unico em todo o sistema
- status so transiciona conforme maquina de estados
- passwordHash nunca e exposto em responses

**Metodos:**

| Metodo | Parametros | Retorno | Descricao |
| --- | --- | --- | --- |
| create() | { email, name, password } | User | Hash da senha, status = created, emite UserCreated |
| activate() | — | void | status → active, emite UserActivated |
| suspend(reason) | string | void | status → suspended, registra motivo |
| deactivate() | — | void | status → inactive, emite UserDeactivated |
| changeEmail(newEmail) | string | void | Valida formato, emite UserEmailChanged |
| changePassword(oldPwd, newPwd) | string, string | void | Verifica old, hash new, emite UserPasswordChanged |

**Eventos:**

| Evento | Quando | Payload |
| --- | --- | --- |
| UserCreated | Apos criacao | { userId, email, name, timestamp } |
| UserActivated | Apos ativacao | { userId, timestamp } |
| UserDeactivated | Apos desativacao | { userId, timestamp } |
| UserEmailChanged | Apos troca | { userId, oldEmail, newEmail, timestamp } |
| UserPasswordChanged | Apos troca de senha | { userId, timestamp } |

</details>

---

## Value Objects

> Quais conceitos sao imutaveis e definidos pelo valor (nao por identidade)?

| Value Object | Campos | Validacao | Usado em |
| --- | --- | --- | --- |
| {{Ex: Email}} | {{address: string}} | {{formato RFC 5322, max 255}} | {{User.email}} |
| {{Ex: Money}} | {{amount: number, currency: string}} | {{amount >= 0, currency ISO 4217}} | {{Order.total, Product.price}} |
| {{Ex: Address}} | {{street, city, state, zip}} | {{zip regex, state enum}} | {{User.address, Order.shipping}} |

<!-- APPEND:value-objects -->

---

## Regras de Negocio

> Quais regras de negocio governam o sistema? Cada regra tem ID para rastreabilidade.

| ID | Regra | Severidade | Entidade | Onde Validar |
| --- | --- | --- | --- | --- |
| {{RN-01}} | {{Descricao da regra}} | {{Alta/Media/Baixa}} | {{Entidade}} | {{Domain / Service / Controller}} |
| {{RN-02}} | {{Descricao da regra}} | {{Alta}} | {{Entidade}} | {{Domain}} |

<!-- APPEND:regras -->

---

## Relacionamentos

> Como as entidades se relacionam entre si?

| Entidade A | Cardinalidade | Entidade B | Cascade | Obrigatorio | Descricao |
| --- | --- | --- | --- | --- | --- |
| {{User}} | {{1:N}} | {{Order}} | {{SET NULL on delete}} | {{nao}} | {{Usuario pode ter multiplos pedidos}} |
| {{Order}} | {{1:N}} | {{OrderItem}} | {{CASCADE delete}} | {{sim}} | {{Pedido contem itens}} |
| {{Order}} | {{N:1}} | {{User}} | {{—}} | {{sim}} | {{Todo pedido tem um dono}} |

<!-- APPEND:relacionamentos -->

---

## Maquinas de Estado

> Quais entidades possuem ciclo de vida com estados e transicoes?

### {{NomeEntidade}} — Estados

```
[{{estado1}}] → {{acao()}} → [{{estado2}}]
[{{estado2}}] → {{acao()}} → [{{estado3}}]
[{{estado2}}] → {{acao()}} → [{{estado4}}]
```

**Transicoes:**

| De | Evento/Acao | Para | Regra | Side-effect |
| --- | --- | --- | --- | --- |
| {{created}} | {{activate()}} | {{active}} | {{—}} | {{Emite EntidadeActivated}} |
| {{active}} | {{suspend(reason)}} | {{suspended}} | {{Apenas admin}} | {{Emite EntidadeSuspended}} |
| {{active}} | {{deactivate()}} | {{inactive}} | {{Proprio usuario ou admin}} | {{Emite EntidadeDeactivated}} |
| {{suspended}} | {{activate()}} | {{active}} | {{Apenas admin}} | {{Emite EntidadeActivated}} |
| {{suspended}} | {{deactivate()}} | {{inactive}} | {{Apenas admin}} | {{Emite EntidadeDeactivated}} |

**Estados terminais:**
- {{inactive — requer reativacao manual por admin}}

**Transicoes proibidas:**
- {{inactive → qualquer estado (sem reativacao direta; requer processo administrativo)}}
- {{deleted → qualquer estado}}

<!-- APPEND:maquinas -->

> (ver [04-data-layer.md](04-data-layer.md) para schema de banco e repositories)
