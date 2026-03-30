# Validação

> Regras de validação por campo, validações cross-field, schemas e mensagens de erro.

---

## Estratégia de Validação

> Em quais camadas a validação acontece?

| Camada | O que Valida | Ferramenta | Exemplo |
|--------|--------------|------------|---------|
| **CLI Args** | Formato de entrada (tipos, required, min/max) | commander.js + Zod | niche é string não vazia |
| **Application** | Regras de negócio simples | Service logic | learning weights válidos |
| **Domain** | Invariantes da entidade | Métodos da entidade | status transiciona conforme máquina |
| **Infrastructure** | Constraints do banco | Prisma constraints | UNIQUE, NOT NULL, FK |

---

## Regras por Entidade

### Pipeline (CLI Arguments)

| Campo | Tipo | Regras | Mensagem de Erro |
|-------|------|--------|------------------|
| niche | string | required, min(2), max(100), trim | "Nicho deve ter entre 2 e 100 caracteres" |
| idea | string | optional, max(200) | "Ideia deve ter no máximo 200 caracteres" |
| template | string | optional, enum(HOOK_SETUP_ESCALADA_TWIST_PAYOFF_LOOP) | "Template inválido" |
| strategy-directive | string | optional, max(500) | "Diretiva muito longa" |
| dry-run | boolean | optional, default(false) | - |
| skip-upload | boolean | optional, default(false) | - |
| force | boolean | optional, default(false) | "Force overwrite sem confirmação" |

### Idea (Generated)

| Campo | Tipo | Regras | Mensagem de Erro |
|-------|------|--------|------------------|
| niche | string | required, min(2), max(100) | "Nicho inválido" |
| text | string | required, min(10), max(200) | "Ideia deve ter entre 10 e 200 caracteres" |
| angle | string | optional, max(100) | "Ângulo deve ter no máximo 100 caracteres" |
| source | enum | required, strategy/manual/random | "Fonte inválida" |

### Script (Generated)

| Campo | Tipo | Regras | Mensagem de Erro |
|-------|------|--------|------------------|
| ideaId | UUID | required, UUID válido | "ID da ideia inválido" |
| template | enum | required, HOOK_SETUP_ESCALADA_TWIST_PAYOFF_LOOP | "Template inválido" |
| hook | string | required, max(50 palavras) | "Hook deve ter no máximo 50 palavras" |
| setup | string | required, max(150 palavras) | "Setup deve ter no máximo 150 palavras" |
| escalada | string | required, max(200 palavras) | "Escalada deve ter no máximo 200 palavras" |
| twist | string | optional, max(100 palavras) | "Twist deve ter no máximo 100 palavras" |
| payoff | string | optional, max(100 palavras) | "Payoff deve ter no máximo 100 palavras" |
| loop | string | optional, max(50 palavras) | "Loop deve ter no máximo 50 palavras" |
| estimatedDuration | number | required, > 0 | "Duração estimada deve ser positiva" |

### Scene (Generated)

| Campo | Tipo | Regras | Mensagem de Erro |
|-------|------|--------|------------------|
| scriptId | UUID | required, UUID válido | "ID do roteiro inválido" |
| order | number | required, >= 0 | "Ordem da cena inválida" |
| text | string | required, max(50 palavras) | "Texto da narração deve ter no máximo 50 palavras" |
| duration | number | required, >= 0.5, <= 2.5 | "Duração deve estar entre 0.5 e 2.5 segundos" |
| visualQuery | string | required, min(3), max(200) | "Query visual deve ter entre 3 e 200 caracteres" |
| segmentType | enum | required, hook/setup/escalada/twist/payoff/loop | "Tipo de segmento inválido" |

### LearningState (Weights)

| Campo | Tipo | Regras | Mensagem de Erro |
|-------|------|--------|------------------|
| niche | string | required, min(2), max(100) | "Nicho inválido" |
| hookWeights | object | required, cada peso 0-1 | "Pesos de hook devem estar entre 0 e 1" |
| templateWeights | object | required, cada peso 0-1 | "Pesos de template devem estar entre 0 e 1" |
| pacingWeights | object | required, cada peso 0-1 | "Pesos de pacing devem estar entre 0 e 1" |
| contentWeights | object | required, cada peso 0-1 | "Pesos de conteúdo devem estar entre 0 e 1" |

### Config (YAML)

| Campo | Tipo | Regras | Mensagem de Erro |
|-------|------|--------|------------------|
| openrouter.apiKey | string | required | "API key do OpenRouter é obrigatória" |
| elevenlabs.apiKey | string | required | "API key do ElevenLabs é obrigatória" |
| pexels.apiKey | string | required | "API key do Pexels é obrigatória" |
| youtube.clientSecret | string | required | "Client secret do YouTube é obrigatório" |
| youtube.refreshToken | string | required | "Refresh token do YouTube é obrigatório" |

---

## Validações Cross-Field

| Regra | Campos | Lógica | Mensagem |
|-------|--------|--------|----------|
| Nicho consistente | niche (input), niche (learning state) | Devem ser iguais | "Nicho不一致" |
| Cena segue roteiro | scene.scriptId, script.id | FK válida | "Cena não pertence ao roteiro" |
| Audio corresponde cena | audioSegment.sceneId, scene.id | FK válida | "Áudio não pertence à cena" |
| Clip corresponde cena | clip.sceneId, scene.id | FK válida | "Clip não pertence à cena" |
| Pipeline tem scenes | pipeline.scenes, scenes.length | length > 0 | "Pipeline deve ter pelo menos uma cena" |
| Weight delta válido | LearningState | delta <= 0.1 (10%) | "Ajuste máximo de 10% por operação" |
| Hook em cena 1 | scenes[0].segmentType | === 'hook' | "Primeira cena deve ser hook" |

---

## Validações de CLI

### Argumentos de Comando

| Parâmetro | Tipo | Regras | Mensagem |
|-----------|------|--------|----------|
| niche | string | required, min(2), max(100) | "Nicho deve ter entre 2 e 100 caracteres" |
| idea | string | optional, max(200) | "Ideia deve ter no máximo 200 caracteres" |
| --template | string | optional, enum | "Template inválido" |
| --dry-run | boolean | optional | - |
| --skip-upload | boolean | optional | - |
| --verbose | boolean | optional | - |
| --format | string | optional, enum(json, yaml) | "Formato inválido" |

### Comandos Suportados

```bash
# Gerar um vídeo
mestra generate --niche "dark"

# Gerar com ideia específica
mestra generate --niche "dark" --idea "Os segredos nunca revelados"

# Gerar com estratégia
mestra generate --niche "dark" --strategy-directive '{"topic": "mistérios", "targetCtr": 8}'

# Dry run (não sobe para YouTube)
mestra generate --niche "dark" --dry-run

# Listar pipelines
mestra list --status running --limit 10

# Ver logs
mestra logs <pipeline-id>

# Métricas
mestra metrics --niche "dark"
```

---

## Sanitização

| Campo | Sanitização | Motivo |
|-------|-------------|--------|
| niche | trim, lowercase | Evitar duplicatas por case |
| idea | trim | Remover espaços extras |
| script text | normalize whitespace | Consistência |
| URLs | validate protocol (https) | Prevenir SSRF |
| visualQuery | trim, lowercase | Consistência na busca |
| Config paths | resolve(), normalize | Caminhos corretos |

---

## Schema Zod para CLI

```typescript
// src/cli/schemas.ts
import { z } from 'zod';

const NicheSchema = z.string()
  .min(2, 'Nicho deve ter pelo menos 2 caracteres')
  .max(100, 'Nicho deve ter no máximo 100 caracteres')
  .trim()
  .toLowerCase();

const TemplateSchema = z.enum([
  'HOOK_SETUP_ESCALADA_TWIST_PAYOFF_LOOP',
  'HOOK_SETUP_ESCALADA_PAYOFF',
  'HOOK_CHALLENGE_RESOLUTION',
]);

const GenerateCommandSchema = z.object({
  niche: NicheSchema,
  idea: z.string().max(200).optional(),
  template: TemplateSchema.optional(),
  strategyDirective: z.string().max(500).optional(),
  'dry-run': z.boolean().default(false),
  'skip-upload': z.boolean().default(false),
  force: z.boolean().default(false),
  verbose: z.boolean().default(false),
  format: z.enum(['json', 'yaml']).default('yaml'),
});

const ListCommandSchema = z.object({
  status: z.enum(['pending', 'running', 'completed', 'failed']).optional(),
  niche: NicheSchema.optional(),
  limit: z.number().min(1).max(100).default(20),
  page: z.number().min(1).default(1),
});

export { GenerateCommandSchema, ListCommandSchema };
```

---

> Ver [12-events.md](12-events.md) para eventos do sistema
