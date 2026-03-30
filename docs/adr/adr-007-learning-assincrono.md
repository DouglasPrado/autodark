# ADR-007: Learning Engine assíncrono

**Data:** 2026-03-30

**Status:** Aceita

**Autores:** Douglas Prado

---

## Contexto

O Learning Engine analisa métricas de vídeos publicados para ajustar pesos de prompts e templates. Porém, YouTube Analytics tem delay de 48-72h para disponibilizar dados. O sistema não pode ficar esperando — precisa produzir vídeos continuamente.

---

## Drivers de Decisão

- **YouTube Analytics delay** — 48-72h de delay é inaceitável para pipeline síncrono
- **Throughput** — Sistema deve produzir 10+ vídeos/dia independente de métricas
- **Assincronicidade** — Learning loop roda em background

---

## Opções Consideradas

### Opção A: Learning assíncrono (cron)

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Não bloqueia produção; métricas disponíveis quando prontas |
| Contras | Delay de até 72h para primeiro aprendizado |
| Esforço | Médio |
| Risco | Baixo |

### Opção B: Learning síncrono

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Feedback imediato |
| Contras | Blockea produção por 48-72h; não funciona |
| Esforço | Baixo |
| Risco | Alto |

### Opção C: Streaming de métricas

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Mais rápido que cron |
| Contras | YouTube não oferece streaming;polling necessário |
| Esforço | Alto |
| Risco | Médio |

---

## Decisão

**Escolhemos a Opção A: Learning assíncrono (cron)** porque é a única opção viável dado o delay do YouTube Analytics. O sistema produz vídeos normalmente enquanto o learning loop roda em background.

---

## Consequências

### Positivas

- Não bloqueia produção de vídeos
- Métricas são coletadas quando disponíveis
- Cold start usa configurações padrão

### Negativas

- Primeiro aprendizado leva 48-72h
-learning ativo apenas após mínimo de vídeos

### Riscos

- **Cold start muito longo** — Mitigação: usar configurações padrão de nichos conhecidos
- **Convergência instável** — Mitigação: limitar taxa de ajuste de pesos

---

## Ações Necessárias

- [ ] Configurar cron job para collectMetrics (a cada 6h)
- [ ] Configurar cron job para learningLoop (após collect)
- [ ] Implementar cold start com pesos padrão

---

## Referências

- [Learning Engine — PRD](../prd.md#611-learning-engine-feedback-loop)

---

## Histórico

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-03-30 | Douglas Prado | Criação |
