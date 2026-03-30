# ADR-001: Monolito Node.js + CLI como arquitetura principal

**Data:** 2026-03-30

**Status:** Aceita

**Autores:** Douglas Prado

---

## Contexto

O Mestra AI é um sistema autônomo de crescimento de canais YouTube. O PRD define 10 engines (Content, Scene, Voice, Visual, Pacing, Rendering, Thumbnail, Performance, Strategy, Learning) que precisam se comunicar para executar o pipeline de geração de vídeo. O sistema deve produzir 10+ vídeos/dia sem intervenção manual.

---

## Drivers de Decisão

- **Simplicidade** — Sistema de propósito único, sem necessidade de deploy independente de componentes
- **Manutenibilidade** — Equipe pequena, código fácil de debugar
- **Custo** — Evitar overhead de microsserviços (orquestração, rede, complexidade operacional)
- **Velocidade** — Time-to-market mais rápido

---

## Opções Consideradas

### Opção A: Monolito Node.js + CLI

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Simples de desenvolver, testar, fazer debug e fazer deploy; menos overhead operacional |
| Contras | Escalabilidade vertical limitada; risco de coupled components |
| Esforço | Baixo |
| Risco | Baixo |

### Opção B: Microsserviços

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Escalabilidade independente; deploy isolado |
| Contras | Complexidade operacional (orquestração, rede, observabilidade); mais custo; mais tempo de desenvolvimento |
| Esforço | Alto |
| Risco | Alto |

### Opção C: Serverless Functions

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Escalabilidade automática; pay-per-use |
| Contras | Cold starts; limitações de tempo de execução (renderização de vídeo pode exceder); vendor lock-in |
| Esforço | Médio |
| Risco | Médio |

---

## Decisão

**Escolhemos a Opção A: Monolito Node.js + CLI** porque o sistema tem escopo definido e relativamente pequeno (10+ vídeos/dia), a equipe é pequena, e o custo/benefício de microsserviços não se justifica para um sistema de propósito único.

---

## Consequências

### Positivas

- Deploy simples (1 comando)
- Debugging facilitado (stack trace completo)
- Menos complexidade operacional
- Custo de infraestrutura baixo

### Negativas

- Escalabilidade vertical apenas
- Se uma engine falhar, pode afetar todo o sistema
- Linguagem/framework preso a Node.js

### Riscos

- **Alto volume de vídeos** — Mitigação: se necessário, adicionar workers/processos separados
- **Engine específicas ficam lentas** — Mitigação: monitoring por step

---

## Ações Necessárias

- [ ] Configurar projeto Node.js/TypeScript
- [ ] Definir estrutura de pastas por engine
- [ ] Configurar CLI com commander.js

---

## Referências

- [PRD — Mestra AI](../prd.md)
- [Arquitetura do Sistema](../blueprint/06-system-architecture.md)

---

## Histórico

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-03-30 | Douglas Prado | Criação |
