# ADR-008: TypeScript com funções puras

**Data:** 2026-03-30

**Status:** Aceita

**Autores:** Douglas Prado

---

## Contexto

O sistema segue arquitetura funcional: cada step recebe PipelineContext e retorna novo PipelineContext. Sem estado compartilhado, sem side effects ocultos.

---

## Drivers de Decisão

- **Determinismo** — Mesmo input = mesmo output
- **Testabilidade** — Funções puras são fáceis de testar
- **Debugging** — Stack trace clara
- **Simplicidade** — PRD especifica "funções puras"

---

## Opções Consideradas

### Opção A: TypeScript funcional

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Determinístico; testável; simples de debugar |
| Contras | Curva para quem não conhece funcional |
| Esforço | Médio |
| Risco | Baixo |

### Opção B: Node.js com classes (OOP)

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Familiar para maioria dos devs |
| Contras | Estado compartilhado; side effects difíceis de rastrear |
| Esforço | Baixo |
| Risco | Médio |

### Opção C: Python

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Bom para scripts; libs de IA |
| Contras | Sem tipagem estática; menos adequado para pipeline complexo |
| Esforço | Médio |
| Risco | Médio |

---

## Decisão

**Escolhemos a Opção A: TypeScript funcional** porque o PRD especifica "funções puras" como decisão arquitetural, e TypeScript oferece tipagem forte necessária para o contexto do pipeline.

---

## Consequências

### Positivas

- Determinístico
- Testável (unit tests simples)
- PipelineContext imutável
- Tipagem forte

### Negativas

- Curva de aprendizado para devs não-funcionais
- Imutabilidade pode parecer ineficiente

### Riscos

- **Performance** — Mitigação: imutabilidade é otimizada pelo V8

---

## Ações Necessárias

- [ ] Configurar TypeScript strict mode
- [ ] Definir PipelineContext como tipo
- [ ] Implementar cada engine como funções puras

---

## Referências

- [Decisões Técnicas — PRD](../prd.md#13-decisoes-tecnicas)

---

## Histórico

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-03-30 | Douglas Prado | Criação |
