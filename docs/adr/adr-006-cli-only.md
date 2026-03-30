# ADR-006: Sem UI — Ferramenta CLI only

**Data:** 2026-03-30

**Status:** Aceita

**Autores:** Douglas Prado

---

## Contexto

O PRD define que o sistema é "ferramenta de uso interno" e "operado via CLI/scripts". Não há necessidade de dashboard ou interface web para este caso de uso.

---

## Drivers de Decisão

- **Escopo do PRD** — Explicitamente fora do escopo
- **Simplicidade** — CLI é mais simples de manter
- **Custo** — Sem desenvolvimento de UI
- **Velocidade** — Foco no core (pipeline)

---

## Opções Consideradas

### Opção A: CLI only

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Simples; rápido de desenvolver; custo zero de UI |
| Contras | Sem visualização em tempo real |
| Esforço | Baixo |
| Risco | Baixo |

### Opção B: Dashboard Web

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Visualização em tempo real; melhor UX |
| Contras | Muito tempo de desenvolvimento; custo adicional |
| Esforço | Alto |
| Risco | Médio |

### Opção C: Dashboard + CLI

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Melhor dos dois mundos |
| Contras | Muito tempo de desenvolvimento |
| Esforço | Alto |
| Risco | Médio |

---

## Decisão

**Escolhemos a Opção A: CLI only** porque está explicitamente fora do escopo do PRD e o foco deve ser no core (pipeline de geração).

---

## Consequências

### Positivas

- Desenvolvimento focado no core
- Sem custo de UI
- Simples de manter

### Negativas

- Sem visualização em tempo real
- Operador precisa acompanhar via logs

### Riscos

- **Operador quer dashboard no futuro** — Mitigação: documentar como feature futura

---

## Ações Necessárias

- [ ] Configurar CLI com commander.js
- [ ] Definir comandos: generate, status, videos, config

---

## Referências

- [PRD — Escopo](../prd.md#5-escopo)

---

## Histórico

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-03-30 | Douglas Prado | Criação |
