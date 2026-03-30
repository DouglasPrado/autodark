# Data Layer

Define os repositories, schema do ORM, estrategia de migrations, indices criticos e queries de alta performance.

---

## Estrategia de Persistencia

> Quais tecnologias de armazenamento sao usadas e para que?

| Tecnologia | Funcao | Dados | Justificativa |
| --- | --- | --- | --- |
| {{PostgreSQL}} | {{Dados transacionais}} | {{Users, Orders, Products}} | {{ACID, JSONB, extensoes}} |
| {{Redis}} | {{Cache e sessoes}} | {{Sessions, rate limits, cache}} | {{Latencia sub-ms, TTL nativo}} |
| {{S3}} | {{Arquivos}} | {{Imagens, PDFs, uploads}} | {{Durabilidade 99.999999999%}} |

<!-- APPEND:persistencia -->

---

## Repositories

> Para cada entidade, documente os metodos de acesso a dados, queries e indices.

### {{NomeEntidade}}Repository

**Responsabilidade:** {{Acesso a dados da entidade. Abstrai ORM/queries.}}

**Interface:**

| Metodo | Parametros | Retorno | Query Principal |
| --- | --- | --- | --- |
| {{save(entity)}} | {{Entidade}} | {{Entidade}} | {{INSERT INTO ...}} |
| {{findById(id)}} | {{UUID}} | {{Entidade \| null}} | {{SELECT ... WHERE id = $1 AND deleted_at IS NULL}} |
| {{findByField(field)}} | {{string}} | {{Entidade \| null}} | {{SELECT ... WHERE field = $1}} |
| {{update(id, data)}} | {{UUID, Partial}} | {{Entidade}} | {{UPDATE ... SET ... WHERE id = $1}} |
| {{softDelete(id)}} | {{UUID}} | {{void}} | {{UPDATE ... SET deleted_at = NOW()}} |
| {{list(filters)}} | {{ListFilters}} | {{PaginatedResult}} | {{SELECT com WHERE dinamico + LIMIT/OFFSET}} |

**Indices:**

| Indice | Campos | Tipo | Justificativa |
| --- | --- | --- | --- |
| {{idx_entidade_campo}} | {{campo}} | {{UNIQUE / BTREE / GIN}} | {{Busca frequente por este campo}} |

<!-- APPEND:repositories -->

<details>
<summary>Exemplo — UserRepository</summary>

### UserRepository

**Interface:**

| Metodo | Parametros | Retorno | Query |
| --- | --- | --- | --- |
| save(user) | User | User | INSERT INTO users (...) VALUES (...) |
| findById(id) | UUID | User \| null | SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL |
| findByEmail(email) | string | User \| null | SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL |
| update(id, data) | UUID, Partial | User | UPDATE users SET ... WHERE id = $1 |
| softDelete(id) | UUID | void | UPDATE users SET deleted_at = NOW() WHERE id = $1 |
| list(filters) | ListFilters | PaginatedResult | SELECT com WHERE + LIMIT/OFFSET |

**Indices:**

| Indice | Campos | Tipo | Justificativa |
| --- | --- | --- | --- |
| idx_users_email | email | UNIQUE | Login e validacao de unicidade |
| idx_users_role | role | BTREE | Filtro por role na listagem |
| idx_users_created | created_at | BTREE DESC | Ordenacao por data |
| idx_users_deleted | deleted_at | BTREE | Filtro de soft delete |

</details>

---

## Schema do ORM

> Como as entidades sao representadas no ORM/schema?

{{Cole aqui o schema do Prisma, Drizzle, TypeORM ou equivalente. Cada tabela deve mapear para uma entidade do dominio.}}

```prisma
// Exemplo Prisma — substitua pelo real
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  // {{demais campos}}
}
```

<!-- APPEND:schema -->

---

## Estrategia de Migrations

> Como as alteracoes de schema sao gerenciadas?

| Aspecto | Decisao |
| --- | --- |
| {{Ferramenta}} | {{Prisma Migrate / Flyway / Alembic / Knex}} |
| {{Convencao de nomes}} | {{timestamp_descricao (ex: 20240101_create_users)}} |
| {{Rollback}} | {{Toda migration tem down/rollback}} |
| {{Ambientes}} | {{Dev: auto-apply, Staging: CI, Prod: manual com aprovacao}} |
| {{Dados de seed}} | {{Apenas em dev/staging, nunca em prod}} |

---

## Queries Criticas

> Quais queries sao executadas com alta frequencia ou exigem performance especifica?

| Descricao | Tabelas | Frequencia | SLA (p95) | Otimizacao |
| --- | --- | --- | --- | --- |
| {{Buscar usuario por email}} | {{users}} | {{Cada login}} | {{< 10ms}} | {{Indice UNIQUE em email}} |
| {{Listar pedidos do usuario}} | {{orders, order_items}} | {{Cada visita}} | {{< 50ms}} | {{Indice em user_id + created_at}} |
| {{Relatorio de vendas}} | {{orders}} | {{Diario}} | {{< 5s}} | {{Materialized view}} |

<!-- APPEND:queries -->

---

## Consistencia e Transacoes

> Como transacoes e consistencia sao tratadas?

| Cenario | Tipo | Estrategia |
| --- | --- | --- |
| {{Criar pedido com itens}} | {{Transacao local}} | {{BEGIN/COMMIT no banco}} |
| {{Pagamento + atualizar pedido}} | {{Transacao distribuida}} | {{Saga com compensacao}} |
| {{Cache + banco}} | {{Eventual}} | {{Write-through ou invalidacao por evento}} |

**Idempotencia:** {{Descreva como operacoes sao tornadas idempotentes — ex: idempotency key no header, dedup por event_id}}

> (ver [05-api-contracts.md](05-api-contracts.md) para os endpoints que consomem estes dados)
