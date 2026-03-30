# ADR-002: SQLite (dev) / PostgreSQL (prod) para persistência

**Data:** 2026-03-30

**Status:** Aceita

**Autores:** Douglas Prado

---

## Contexto

O sistema precisa persistir: pipelines (estado, contexto), métricas de vídeo, learning states, content plans, séries e assets. O volume esperado é de ~10+ vídeos/dia = ~300 pipelines/mês. O sistema não tem UI e é operado via CLI.

---

## Drivers de Decisão

- **Simplicidade operacional** — SQLite para dev, zero config
- **Maturidade** — PostgreSQL robusto para produção
- **ACID** — Dados transacionais com integridade referencial
- **Custo** — PostgreSQL gerenciado (RDS/Cloud SQL) tem custo baixo para este volume

---

## Opções Consideradas

### Opção A: SQLite (dev) + PostgreSQL (prod)

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Zero config para dev; PostgreSQL robusto para prod; Prisma ORM suporta ambos |
| Contras | Diferença de comportamento entre ambientes |
| Esforço | Baixo |
| Risco | Baixo |

### Opção B: MongoDB

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Schema flexível;JSONB no PostgreSQL resolve |
| Contras | Equipe sem experiência; sem ACID completo;overhead adicional |
| Esforço | Médio |
| Risco | Médio |

### Opção C: DynamoDB

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Serverless; escala automática |
| Contras | Vendor lock-in AWS; sem joins; custo imprevisível em escala |
| Esforço | Alto |
| Risco | Alto |

---

## Decisão

**Escolhemos a Opção A: SQLite (dev) + PostgreSQL (prod)** porque o volume de dados é moderado, dados são transacionais, e a equipe tem experiência com SQL. Prisma ORM facilita a mudança entre ambientes.

---

## Consequências

### Positivas

- Zero config para desenvolvimento local
- PostgreSQL é robusto e amplamente suportado
- Queries complexas com joins
- Backup e restore simples

### Negativas

- Diferenças sutis entre SQLite e PostgreSQL podem causar bugs
- PostgreSQL requer provisioning em produção

### Riscos

- **Crescimento muito acima do esperado** — Mitigação: adicionar read replicas se necessário

---

## Ações Necessárias

- [ ] Configurar Prisma com SQLite (dev)
- [ ] Criar schema inicial (pipelines, metrics, learning_states, etc.)
- [ ] Configurar PostgreSQL para staging/prod

---

## Referências

- [Modelo de Dados](../blueprint/05-data-model.md)

---

## Histórico

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-03-30 | Douglas Prado | Criação |
