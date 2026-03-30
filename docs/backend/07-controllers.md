# Controllers

> **N/A — Este é um projeto CLI, não uma API REST.**

O sistema **Mestra AI** é uma ferramenta de linha de comando (CLI), não uma API HTTP. Portanto, não há controllers HTTP neste projeto.

---

## Arquitetura

O fluxo de execução é:
1. **CLI Parser** → Parsing de argumentos (`src/cli/`)
2. **Commands** → Orquestração de comandos (`src/commands/`)
3. **Services/Engines** → Lógica de negócio (`src/services/`, `src/engines/`)
4. **Repositories** → Persistência (`src/repositories/`)

---

> Ver [06-services.md](06-services.md) para os services do sistema.
