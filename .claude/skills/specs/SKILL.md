---
name: specs
description: Gera specs de todas as tarefas de implementacao a partir dos blueprints (backend, frontend, tecnico).
---

# Specs — Geracao Integral de Tarefas de Implementacao

Le `docs/backend/` (fonte primaria), valida contra `docs/frontend/` e `docs/blueprint/`, e gera `docs/specs/TASKS.md` com todas as tasks de implementacao de uma vez.

## Fonte de Dados

`docs/backend/` → LEITURA (primaria) | `docs/frontend/` → LEITURA (consistencia) | `docs/blueprint/` → LEITURA (validacao) | `docs/shared/` → LEITURA (glossario, mappings) | `docs/specs/TASKS.md` → ESCRITA

## Passo 1: Verificar Pre-requisitos

1. `docs/backend/03-domain.md` com placeholders → "Rode `/backend` primeiro." (pare)
2. `docs/frontend/` vazio → avise, continue sem (tasks de alinhamento parciais)
3. `docs/blueprint/` ausente → "Rode `/blueprint` primeiro." (pare)
4. `docs/shared/glossary.md` → use como referencia de linguagem ubiqua

Apresente status (Backend/Frontend/Blueprint/Shared: N docs, Completo/Parcial/Ausente).

## Passo 2: Leitura e Extracao de Tasks do Backend

Leia TODOS os 15 arquivos de `docs/backend/`. Mapa de extracao:

| Backend Doc | Tipo de Task | Regra |
|-------------|-------------|-------|
| 00-vision, 01-architecture, 02-structure | SETUP | config, scaffold, CI/CD, observabilidade |
| 03-domain | DOM | 1 task/entidade (classe + atributos + metodos + testes) |
| 04-data-layer | DATA | 1 task/repository + 1 de migration |
| 05-api-contracts | API | 1 task/grupo de endpoints (recurso) |
| 06-services | SVC | 1 task/service (fluxos detalhados = criterios de aceite) |
| 07-controllers | CTRL | 1 task/controller |
| 08-middlewares | MW | 1 task/middleware |
| 09-errors | ERR | 1 task hierarquia + 1/erro de negocio |
| 10-validation | VAL | 1 task/grupo de validacao (entidade) |
| 11-permissions | AUTH | 1 task setup auth + 1/role |
| 12-events | EVT | 1 task/evento + 1/worker |
| 13-integrations | INT | 1 task/integracao externa |
| 14-tests | TEST | 1 task/grupo de cenarios obrigatorios |

**Regras:** Cada entidade gera min DOM+DATA+SVC+API. Use RN-XX quando referenciados. Use linguagem ubiqua.

## Passo 3: Cross-reference com Frontend

Leia `docs/frontend/` (04-components, 05-state, 06-data-layer, 08-flows, 11-security, 15-api-dependencies) e `docs/shared/` (event-mapping, error-ux-mapping, glossary).

Para cada endpoint/evento/erro do backend, identifique consumidor no frontend. Sem consumidor → marque como **gap de frontend**.

## Passo 4: Gerar TASKS.md

Crie `docs/specs/TASKS.md` com Write. Estrutura:

1. **Resumo** — tabela por grupo (Tasks/Must/Should/Could)
2. **Tasks por grupo** (SETUP → DOM → DATA → SVC → API → AUTH → ERR → MW → EVT → INT → TEST → FE)
3. **Validacao contra Blueprint** (tabela de cobertura + gaps)

### Formato de Task

```markdown
### TASK-{{GRP}}-{{NNN}}: {{Titulo}}

**Camada:** {{tipo}} | **Entidade:** {{nome ou —}} | **Prioridade:** {{Must/Should/Could}} | **Origem:** {{arquivo}}

**Descricao:** {{o que implementar — nomes de classes, metodos, campos, tipos}}

**Arquivos:** `{{caminho}}` (criar/editar) — {{o que fazer}}

**Dependencias:** {{TASK-IDs ou Nenhuma}}
**Regras de Negocio:** {{RN-XX ou Nenhuma}}

**Criterios de Aceite:**
- [ ] {{condicao verificavel}}

**Testes:** Unitario: {{desc}} | Integracao: {{desc}}
**Frontend:** {{componente/hook que depende ou Nenhuma}}
```

### IDs: SETUP, DOM, DATA, SVC, API, AUTH, ERR, MW, EVT, INT, TEST, FE

## Passo 5: Validacao contra Blueprint

Cruze tasks com `docs/blueprint/` (03-requirements, 04-domain, 07-flows, 08-use_cases, 09-states, 13-security, 17-communication). Gere tabela de cobertura (%) + lista de gaps no final do TASKS.md.

## Passo 6: Resultado

Apresente: total tasks, por prioridade, cobertura do blueprint (%), gaps identificados.

> "Para implementar: `/codegen-feature [nome]`. Para verificar: `/codegen-verify`."

## Regras

1. Backend e fonte primaria — todas as tasks derivam de docs/backend/
2. Frontend para consistencia, blueprint para validacao
3. Tudo integral — todas as tasks de uma vez, sem fases
4. Tasks atomicas com criterios de aceite verificaveis
5. Use linguagem ubiqua do glossario. NAO invente.
6. Use Write para criar, Edit para atualizar
