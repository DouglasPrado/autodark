# ADR-005: OpenRouter como gateway LLM

**Data:** 2026-03-30

**Status:** Aceita

**Autores:** Douglas Prado

---

## Contexto

O sistema usa LLM para: geração de ideias, roteiros, hooks, títulos, descrições, tags e estratégia de conteúdo. Precisa de acesso confiável a modelos como GPT-4, Claude, etc.

---

## Drivers de Decisão

- **Sem vendor lock-in** — Um gateway permite trocar de modelo facilmente
- **Custo** — OpenRouter oferece preços competitivos
- **Diversidade** — Acesso a múltiplos modelos
- **Maturidade** — API estável e bem documentada

---

## Opções Consideradas

### Opção A: OpenRouter

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Múltiplos modelos; API unificada; sem lock-in |
| Contras | Mais uma camada; custo adicional |
| Esforço | Baixo |
| Risco | Baixo |

### Opção B: OpenAI Direct

| Aspecto | Avaliação |
|---------|-----------|
| Prós | API direta; menor latência |
| Contras | Lock-in em OpenAI; custos podem variar |
| Esforço | Baixo |
| Risco | Médio |

### Opção C: Anthropic Direct

| Aspecto | Avaliação |
|---------|-----------|
| Prós | API direta; bom para Claude |
| Contras | Lock-in; não tem outros modelos |
| Esforço | Baixo |
| Risco | Médio |

---

## Decisão

**Escolhemos a Opção A: OpenRouter** porque oferece flexibilidade para experimentar diferentes modelos, evita lock-in, e a API unificada simplifica a integração.

---

## Consequências

### Positivas

- Flexibilidade para trocar modelos
- API unificada
- Preços competitivos

### Negativas

- Uma camada adicional na chamada
- Latência ligeiramente maior

### Riscos

- **OpenRouter fora do ar** — Mitigação: fallback para outro modelo ou retry
- **Custo imprevisível** — Mitigação: limites de orçamento por dia

---

## Ações Necessárias

- [ ] Configurar cliente OpenRouter SDK
- [ ] Definir modelos padrão e fallback
- [ ] Implementar retry com backoff

---

## Referências

- [Content Engine — PRD](../prd.md#62-content-engine)

---

## Histórico

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-03-30 | Douglas Prado | Criação |
