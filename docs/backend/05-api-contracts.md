# Contratos de API

> **N/A — Este é um projeto CLI, não uma API REST.**

O sistema **Mestra AI** é uma ferramenta de linha de comando (CLI), não uma API HTTP. Portanto, não há contratos de API REST neste projeto.

---

## Interface CLI

O sistema expõe funcionalidade via comandos CLI usando `commander.js`:

| Comando | Descrição |
|---------|------------|
| `mestra generate --niche <nicho>` | Gera um vídeo |
| `mestra list --status <status>` | Lista pipelines |
| `mestra logs <pipeline-id>` | Ver logs de um pipeline |
| `mestra metrics --niche <nicho>` | Ver métricas |

---

## Argumentos e Flags

Ver [10-validation.md](10-validation.md) para validação de argumentos CLI.

---

> Ver [docs/blueprint/](../blueprint/) para documentação técnica completa.
