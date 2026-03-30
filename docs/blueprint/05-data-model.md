# Modelo de Dados

Enquanto o [Modelo de Domínio](./04-domain-model.md) descreve entidades e regras de negócio de forma **lógica e conceitual**, o modelo de dados define como essas entidades serão **fisicamente armazenadas**. Aqui tratamos de tabelas, campos, tipos de dados, constraints, índices e estratégias de migração.

> A separação entre domínio e dados permite que decisões de negócio e decisões de infraestrutura evoluam de forma independente.

---

## Banco de Dados

> Qual banco de dados será usado? Relacional ou NoSQL? Justifique a escolha considerando os padrões de leitura/escrita do sistema.

- **Tecnologia:** {{PostgreSQL, MySQL, MongoDB, DynamoDB, etc.}}
- **Justificativa:** {{motivo da escolha — ex.: "Necessidade de transações ACID e queries complexas"}}

---

## Tabelas / Collections

> Quais estruturas de armazenamento são necessárias? Lembre-se de que nem toda entidade do domínio precisa de uma tabela própria, e uma entidade pode ser distribuída em mais de uma tabela.

### {{nome_da_tabela}}

**Descrição:** {{para que serve esta tabela/collection}}

**Campos:**

| Campo | Tipo | Constraint | Descrição |
|-------|------|-----------|-----------|
| {{campo_1}} | {{tipo — ex.: UUID, VARCHAR(255), INTEGER}} | {{PK, FK, NOT NULL, UNIQUE, etc.}} | {{descrição}} |
| {{campo_2}} | {{tipo}} | {{constraint}} | {{descrição}} |
| {{campo_3}} | {{tipo}} | {{constraint}} | {{descrição}} |

**Índices:**

| Nome do Índice | Campos | Tipo | Justificativa |
|---------------|--------|------|---------------|
| {{idx_nome}} | {{campo_1, campo_2}} | {{BTREE, HASH, GIN, etc.}} | {{motivo — ex.: "Busca frequente por email"}} |

> Repita este bloco para cada tabela ou collection do sistema.

<!-- APPEND:tables -->

---

## Diagrama ER

> Atualize o diagrama abaixo conforme as tabelas e relacionamentos definidos acima.

> 📐 Diagrama: [er-diagram.mmd](../diagrams/domain/er-diagram.mmd)

---

## Estratégia de Migração

> Como as mudanças no schema serão gerenciadas ao longo do tempo? Existe risco de downtime durante migrações?

- **Ferramenta:** {{ferramenta de migração — ex.: Flyway, Alembic, Prisma Migrate, Knex, etc.}}
- **Convenção de nomes:** {{padrão de nomeação dos arquivos de migração — ex.: "V001__create_users_table.sql"}}
- **Estratégia de rollback:** {{como reverter uma migração com problema}}
- **Migrações destrutivas:** {{política para ALTER DROP, remoção de colunas — ex.: "Deprecar coluna por 2 sprints antes de remover"}}

---

## Índices e Otimizações

> Quais queries são críticas para performance? Quais padrões de acesso devem guiar a criação de índices?

### Queries Críticas

| Descrição da Query | Tabelas Envolvidas | Frequência | SLA Esperado |
|--------------------|--------------------|-----------|-------------|
| {{descrição — ex.: "Buscar usuário por email"}} | {{tabelas}} | {{alta/média/baixa}} | {{ex.: < 50ms}} |

<!-- APPEND:critical-queries -->

### Diretrizes de Otimização

- {{diretriz_1 — ex.: "Evitar SELECT * em tabelas com mais de 20 colunas"}}
- {{diretriz_2 — ex.: "Usar paginação por cursor em listagens com grande volume"}}
- {{diretriz_3 — ex.: "Considerar cache para queries com taxa de leitura > 90%"}}

---

## Referências

- {{link para documentação do banco de dados escolhido}}
- {{material de apoio sobre modelagem de dados}}
