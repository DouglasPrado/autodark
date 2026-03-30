# Evolução

> Software é um organismo vivo. Planeje como ele vai evoluir.

---

## Roadmap Técnico

> Quais melhorias técnicas são planejadas para os próximos 3-12 meses?

| Item                     | Prioridade | Justificativa                          | Fase estimada         |
|--------------------------|------------|----------------------------------------|-----------------------|
| Workers separados para rendering | Alta       | Parallelizar rendering para aumentar throughput | Fase 2 (6-12 meses) |
| Dashboard web simples     | Média       | Visualizar pipelines em execução          | Fase 2 (6-12 meses) |
| Multi-canal (múltiplos nichos) | Alta       | Suportar múltiplos canais simultaneamente | Fase 2 (6-12 meses) |
| Streaming de vídeo        | Baixa       | Suporte para Lives no YouTube           | Fase 3 (12+ meses) |
| Integração TikTok/Reels   | Baixa       | Expandir para outras plataformas        | Fase 3 (12+ meses) |
| UI de configuração        | Média       | Editar nichos via interface            | Fase 2 (6-12 meses) |
| Notificações (Slack/email)| Baixa       | Alertas de pipeline concluído/falhado   | Fase 2 (6-12 meses) |
| Métricas em tempo real   | Baixa       | Dashboard com retenção em tempo real    | Fase 3 (12+ meses) |

<!-- APPEND:technical-roadmap -->

---

## Débitos Técnicos

> Quais atalhos foram tomados que precisam ser corrigidos?

| Débito                     | Impacto                        | Esforço para resolver | Prioridade |
|----------------------------|--------------------------------|-----------------------|------------|
| Sem testes E2E completos   | Risco de regressão em fluxos  | Médio                 | Alta       |
| Cache simples (disco local) | Performance em escala          | Médio                 | Média      |
| Sem observabilidade avançada | Dificuldade em debug        | Baixo                 | Média      |
| Logs em arquivo local      | Difícil agregação em produção  | Baixo                 | Baixa      |
| Sem versionamento formal   | Dificuldade em rollback       | Baixo                 | Baixa      |

### Processo de Gestão de Débitos

- **Registro:** Issues no GitHub com label `technical-debt`
- **Revisão:** Revisão mensal de débitos pendentes
- **Priorização:** Impacto × Esforço (matriz)

---

## Estratégia de Versionamento

> Como versionar o sistema e suas APIs?

### Versionamento Semântico (SemVer)

O projeto segue o padrão **MAJOR.MINOR.PATCH**:

- **MAJOR** — mudanças incompatíveis (CLI flags, formato de saída)
- **MINOR** — novas funcionalidades retrocompatíveis
- **PATCH** — correções de bugs retrocompatíveis

Versão atual: **1.0.0**

### Versionamento de CLI

- **Estratégia:** SemVer no package.json
- **Formato:** `vMAJOR.MINOR.PATCH` (ex: v1.2.0)
- **Comando:** `mestra --version`

### Versionamento de API

- APIs externas (OpenRouter, ElevenLabs, YouTube) mantêm suas próprias versões
- Sistema consome versões disponíveis sem controle interno

---

## Plano de Deprecação

Como retirar funcionalidades e APIs antigas de forma segura e previsível.

### Processo de Deprecação

1. **Anúncio** — comunicar a deprecação com antecedência mínima de 30 dias
2. **Período de transição** — manter ambas as versões funcionando por 60 dias
3. **Migração** — oferecer guia de migração no CHANGELOG
4. **Remoção** — remover a funcionalidade após o período de transição

### Itens em Deprecação

| Funcionalidade            | Data de deprecação       | Alternativa                     | Data de remoção          |
|-------------------------|--------------------------|---------------------------------|--------------------------|
| Formato JSON de saída v1 | v2.0.0                 | Formato v2 (nova estrutura)    | v3.0.0                  |

<!-- APPEND:deprecations -->

---

## Critérios para Revisão do Blueprint

> Quando este blueprint deve ser revisado?

### Gatilhos de Revisão

Este documento deve ser revisado quando:

- Nova fase do roadmap iniciada (a cada 6 meses)
- Mudança significativa de arquitetura
- Nova engine adicionada
- Mudança de banco de dados
- Novo serviço externo integrado
- Incidentes que revelem lacunas na documentação

### Cadência de Revisão

- **Revisão completa:** A cada 6 meses ou a cada nova fase
- **Revisão parcial (seções críticas):** Trimestral
- **Responsável pela revisão:** Dono do projeto

### Histórico de Revisões

| Data               | Autor                | Seções alteradas             | Motivo                      |
|--------------------|----------------------|------------------------------|-----------------------------|
| 2026-03-30 | Douglas Prado | Todas | Criação inicial do blueprint |

<!-- APPEND:revision-history -->

---

## Conclusão

Blueprint técnico completo com 17 seções documentadas:

| # | Seção | Status |
|---|-------|--------|
| 1 | Contexto | ✅ |
| 2 | Visão | ✅ |
| 3 | Princípios | ✅ |
| 4 | Requisitos | ✅ |
| 5 | Modelo de Domínio | ✅ |
| 6 | Modelo de Dados | ✅ |
| 7 | Arquitetura do Sistema | ✅ |
| 8 | Fluxos Críticos | ✅ |
| 9 | Casos de Uso | ✅ |
| 10 | Modelos de Estado | ✅ |
| 11 | Decisões Arquiteturais | ✅ |
| 12 | Plano de Construção | ✅ |
| 13 | Estratégia de Testes | ✅ |
| 14 | Segurança | ✅ |
| 15 | Escalabilidade | ✅ |
| 16 | Observabilidade | ✅ |
| 17 | Evolução | ✅ |

**Documentos em:**
- `docs/blueprint/` — todas as seções
- `docs/diagrams/` — diagramas Mermaid
- `docs/adr/` — ADRs individuais
- `docs/shared/glossary.md` — glossário único
