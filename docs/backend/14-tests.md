# Estratégia de Testes

> Pirâmide de testes, ferramentas, cobertura mínima e cenários obrigatórios para o backend.

---

## Pirâmide de Testes

| Tipo | Proporção | Objetivo | Velocidade |
|------|-----------|----------|------------|
| **Unitário** | 70% | Regras de negócio isoladas (entities, engines) | < 1s por teste |
| **Integração** | 20% | Contratos com banco, arquivos, CLI | < 5s por teste |
| **E2E** | 10% | Fluxos críticos ponta a ponta (CLI) | < 30s por teste |

---

## Ferramentas

| Tipo | Ferramenta | Função |
|------|------------|--------|
| Framework | Vitest | Runner e assertions |
| Integração | SQLite in-memory | Banco de testes |
| CLI | execa | Testar comandos CLI |
| Mocking | Vitest mocks | Isolar dependências |
| Cobertura | c8 | Métricas de cobertura |
| Fixtures | @faker-js/faker | Dados de teste |

---

## Cobertura Mínima

| Escopo | Cobertura Mínima | Justificativa |
|--------|------------------|----------------|
| **Geral** | 80% | Baseline de qualidade |
| **Domain (entities)** | 95% | Core do negócio, zero margem para bug |
| **Services/Engines** | 90% | Lógica de orquestração crítica |
| **Pipeline Orchestrator** | 100% | Fluxo crítico completo |
| **Errors** | 100% | Todos os erros tratados |

---

## Cenários Obrigatórios

| Cenário | Tipo | Prioridade |
|---------|------|------------|
| Happy path pipeline completo | E2E | Must |
| Validação de argumentos CLI | Unitário | Must |
| Regras de negócio (invariantes) | Unitário | Must |
| Transições de máquina de estado | Unitário | Must |
| Retry de step com falha | E2E | Must |
| Timeout de serviço externo | Integração | Must |
| Erro de renderização FFmpeg | Unitário | Must |
| Pipeline cancelado | E2E | Should |
| Fallback Pexels → DALL-E | Integração | Should |
| Validação de niche | Unitário | Must |
| State transitions inválidas | Unitário | Must |

---

## Organização de Testes

```
tests/
├── unit/
│   ├── domain/
│   │   ├── PipelineContext.test.ts
│   │   ├── Scene.test.ts
│   │   ├── Script.test.ts
│   │   └── LearningState.test.ts
│   ├── engines/
│   │   ├── ContentEngine.test.ts
│   │   ├── SceneEngine.test.ts
│   │   ├── VoiceEngine.test.ts
│   │   ├── VisualEngine.test.ts
│   │   ├── PacingEngine.test.ts
│   │   ├── RenderEngine.test.ts
│   │   └── ThumbnailEngine.test.ts
│   └── errors/
│       └── errors.test.ts
├── integration/
│   ├── repositories/
│   │   ├── PipelineRepository.test.ts
│   │   ├── VideoMetricsRepository.test.ts
│   │   └── LearningStateRepository.test.ts
│   ├── services/
│   │   ├── PipelineService.test.ts
│   │   └── LearningService.test.ts
│   └── cli/
│       ├── generate.test.ts
│       └── list.test.ts
└── e2e/
    ├── pipeline-complete.test.ts
    ├── pipeline-retry.test.ts
    └── dry-run.test.ts
```

---

## Exemplos de Testes

### Teste Unitário — PipelineContext

```typescript
// tests/unit/domain/PipelineContext.test.ts
import { describe, it, expect } from 'vitest';
import { PipelineContext } from '../../../src/domain/PipelineContext';

describe('PipelineContext', () => {
  it('should create context with pending status', () => {
    const ctx = PipelineContext.create({ niche: 'dark' });
    expect(ctx.status).toBe('pending');
    expect(ctx.niche).toBe('dark');
  });

  it('should return new context on next() - immutability', () => {
    const ctx1 = PipelineContext.create({ niche: 'dark' });
    const ctx2 = ctx1.next({ status: 'running' });
    
    expect(ctx1.status).toBe('pending');
    expect(ctx2.status).toBe('running');
  });

  it('should validate niche length', () => {
    expect(() => PipelineContext.create({ niche: 'a' }))
      .toThrow('Nicho deve ter entre 2 e 100 caracteres');
  });
});
```

### Teste Unitário — State Machine

```typescript
// tests/unit/domain/Scene.test.ts
import { describe, it, expect } from 'vitest';
import { Scene } from '../../../src/domain/Scene';

describe('Scene - State Machine', () => {
  it('should transition from pending to audio_generating', () => {
    const scene = Scene.create({ scriptId: '123', order: 0, text: 'Test', segmentType: 'hook' });
    const next = scene.transitionTo('audio_generating');
    
    expect(scene.status).toBe('pending');
    expect(next.status).toBe('audio_generating');
  });

  it('should reject invalid transition', () => {
    const scene = Scene.create({ scriptId: '123', order: 0, text: 'Test', segmentType: 'hook' });
    
    expect(() => scene.transitionTo('rendered'))
      .toThrow('Transição inválida: pending → rendered');
  });

  it('should reject transition from failed', () => {
    const scene = Scene.create({ 
      scriptId: '123', 
      order: 0, 
      text: 'Test', 
      segmentType: 'hook',
      status: 'failed'
    });
    
    expect(() => scene.transitionTo('pending'))
      .toThrow('Transição não permitida a partir de failed');
  });
});
```

### Teste de Integração — Pipeline Service

```typescript
// tests/integration/services/PipelineService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PipelineService } from '../../../src/services/PipelineService';
import { PipelineRepository } from '../../../src/repositories/PipelineRepository';

describe('PipelineService', () => {
  let service: PipelineService;
  let mockRepo: PipelineRepository;

  beforeEach(() => {
    mockRepo = {
      save: vi.fn(),
      findById: vi.fn(),
    } as any;
    service = new PipelineService(mockRepo);
  });

  it('should execute pipeline and emit events', async () => {
    const emit = vi.fn();
    const ctx = await service.execute({ niche: 'dark' }, { emit } as any);
    
    expect(ctx.status).toBe('completed');
    expect(emit).toHaveBeenCalledWith('PipelineCompleted', expect.any(Object));
  });
});
```

### Teste E2E — Pipeline Completo

```typescript
// tests/e2e/pipeline-complete.test.ts
import { describe, it, expect } from 'vitest';
import { execa } from 'execa';

describe('CLI - Pipeline Complete', () => {
  it('should run complete pipeline with dry-run', async () => {
    const result = await execa('npx', [
      'tsx', 'src/cli/index.ts',
      'generate',
      '--niche', 'dark',
      '--dry-run',
      '--verbose'
    ], { cwd: process.cwd() });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Pipeline completed');
  }, 60000);
});
```

---

## Ambientes de Teste

| Ambiente | Banco | APIs Externas |
|----------|-------|---------------|
| Unit | Mock (em memória) | Mock |
| Integração | SQLite in-memory | Mock/WireMock |
| E2E | PostgreSQL (CI) | Sandbox (se disponível) |

---

## CI Pipeline de Testes

| Etapa | Trigger | Testes | Timeout | Bloqueia Merge |
|-------|---------|--------|---------|----------------|
| Pre-commit | git hooks | Lint + unit | 2 min | Sim |
| PR Check | Pull request | Unit + integration | 5 min | Sim |
| Merge to main | Merge | Unit + integration + E2E | 10 min | Sim |

---

## Scripts de Teste

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "vitest run tests/e2e",
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --reporter=dot"
  }
}
```

---

> Backend blueprint completo! Ver [docs/backend/README.md](README.md) para overview.
