# Decisões Arquiteturais

## O que é um ADR?

Um **Architecture Decision Record (ADR)** é um registro curto e objetivo de uma decisão técnica significativa tomada no projeto. ADRs capturam o **contexto** em que a decisão foi tomada, as **opções avaliadas**, a **escolha final** e suas **consequências**.

### Por que registrar decisões?

- **Memória institucional** — Novos membros da equipe entendem rapidamente o "porquê" por trás das escolhas técnicas.
- **Rastreabilidade** — Quando algo precisa mudar, sabe-se exatamente o que foi decidido, quando e por quê.
- **Qualidade** — O ato de escrever força uma análise mais rigorosa das alternativas antes de escolher.
- **Evita retrabalho** — Decisões já avaliadas e descartadas não são revisitadas sem contexto.

> Toda decisão técnica significativa que afeta a estrutura do sistema deve ser registrada aqui.

---

## Quando Escrever um ADR?

Registre um ADR sempre que a equipe tomar uma decisão que:

- Escolhe um **banco de dados**, fila de mensagens ou serviço de infraestrutura
- Define um **framework**, linguagem ou biblioteca principal
- Adota um **protocolo de comunicação** (REST, gRPC, GraphQL, WebSocket)
- Estabelece um **padrão arquitetural** (monolito, microsserviços, event-driven, CQRS)
- Altera uma decisão anterior (neste caso, marque a ADR antiga como **Substituída**)
- Impacta **segurança**, **performance** ou **escalabilidade** de forma estrutural

> Na dúvida, registre. É melhor ter um ADR a mais do que perder o contexto de uma decisão importante.

---

## Template ADR

> 📄 Template completo: [adr-template.md](../adr/adr-template.md)

---

## ADRs do Projeto

### ADR-001: Monolito Node.js + CLI como arquitetura principal

**Data:** 2026-03-30

**Status:** Aceita

**Resumo:** Sistema implementado como monolito Node.js/TypeScript com CLI como ponto de entrada, sem microsserviços ou UI.

**Decisão:** [Ver ADR completa](adr/adr-001-monolito-nodejs.md)

---

### ADR-002: SQLite (dev) / PostgreSQL (prod) para persistência

**Data:** 2026-03-30

**Status:** Aceita

**Resumo:** Banco de dados relacional com SQLite para desenvolvimento e PostgreSQL para produção.

**Decisão:** [Ver ADR completa](adr/adr-002-database-sqlite-postgres.md)

---

### ADR-003: Pipeline síncrono com retry sem mensageria

**Data:** 2026-03-30

**Status:** Aceita

**Resumo:** Pipeline executa de forma síncrona, com retry em cada step e persistência de estado.

**Decisão:** [Ver ADR completa](adr/adr-003-pipeline-sincrono.md)

---

### ADR-004: FFmpeg como motor de renderização scene-based

**Data:** 2026-03-30

**Status:** Aceita

**Resumo:** Renderização de vídeo via FFmpeg CLI, processando cada cena individualmente.

**Decisão:** [Ver ADR completa](adr/adr-004-ffmpeg-render.md)

---

### ADR-005: OpenRouter como gateway LLM

**Data:** 2026-03-30

**Status:** Aceita

**Resumo:** Acesso unificado a múltiplos modelos LLM via API OpenRouter.

**Decisão:** [Ver ADR completa](adr/adr-005-openrouter-llm.md)

---

### ADR-006: Sem UI — Ferramenta CLI only

**Data:** 2026-03-30

**Status:** Aceita

**Resumo:** Sistema operado exclusivamente via CLI/scripts, sem dashboard ou interface web.

**Decisão:** [Ver ADR completa](adr/adr-006-cli-only.md)

---

### ADR-007: Learning Engine assíncrono

**Data:** 2026-03-30

**Status:** Aceita

**Resumo:** Learning Loop executa de forma assíncrona, não bloqueando produção de vídeos.

**Decisão:** [Ver ADR completa](adr/adr-007-learning-assincrono.md)

---

### ADR-008: TypeScript com funções puras

**Data:** 2026-03-30

**Status:** Aceita

**Resumo:** Linguagem TypeScript com paradigma funcional, cada step recebendo e retornando contexto.

**Decisão:** [Ver ADR completa](adr/adr-008-typescript-funcional.md)

<!-- APPEND:adrs -->
