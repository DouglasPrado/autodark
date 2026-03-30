# Middlewares

> **N/A — Este é um projeto CLI, não uma API REST.**

O sistema **Mestra AI** é uma ferramenta de linha de comando (CLI), não uma API HTTP. Portanto, não há middlewares HTTP neste projeto.

---

## Arquitetura de Execução

O sistema usa um modelo de execução linear:

```
CLI Input
  → Argument Parser (commander.js)
  → Validation (Zod)
  → Command Handler
    → Services/Engines
    → Repositories
  → Output (console)
```

---

## Logging

O sistema usa logging estruturado com `pino` ou `console`:

```typescript
import { logger } from './infrastructure/logger';

logger.info({ pipelineId, step: 'content' }, 'Step started');
logger.error({ pipelineId, error }, 'Step failed');
```

---

> Ver [06-services.md](06-services.md) para os services do sistema.
