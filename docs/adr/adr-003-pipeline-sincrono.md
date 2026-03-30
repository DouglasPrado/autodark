# ADR-003: Pipeline síncrono com retry sem mensageria

**Data:** 2026-03-30

**Status:** Aceita

**Autores:** Douglas Prado

---

## Contexto

O pipeline de geração de vídeo executa ~10+ vezes/dia. Cada execução passa por ~18 steps (Content → Scene → Voice → Visual → Pacing → Render → Thumbnail → Upload). O pipeline deve ser resiliente a falhas transitórias de APIs.

---

## Drivers de Decisão

- **Determinismo** — Pipeline linear é mais fácil de debugar
- **Resiliência** — Retry em cada step
- **Volume controlado** — 10+ vídeos/dia não justifica complexidade de fila
- **Custo** — Sem overhead de broker de mensagens

---

## Opções Consideradas

### Opção A: Pipeline síncrono com retry

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Simples de entender e debugar; estado é determinístico |
| Contras | Se um step trava, todo o pipeline trava |
| Esforço | Baixo |
| Risco | Baixo |

### Opção B: Filas de mensagens (RabbitMQ/Kafka)

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Decoupling; resiliência a falhas de serviço |
| Contras | Complexidade adicional; overhead operacional; maior custo |
| Esforço | Alto |
| Risco | Médio |

### Opção C: Event-driven (pub/sub)

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Altamente desacoplado |
| Contras | Muito complexo para este caso de uso; dificuldade em debugar fluxos |
| Esforço | Alto |
| Risco | Alto |

---

## Decisão

**Escolhemos a Opção A: Pipeline síncrono com retry** porque o volume é controlado (10+ vídeos/dia), cada step precisa do resultado do anterior, e retry com backoff resolve a maioria das falhas transitórias.

---

## Consequências

### Positivas

- Simples de implementar e debugar
- Estado determinístico
- Sem custo adicional de infraestrutura

### Negativas

- Um step lento bloqueia todo o pipeline
- Se o servidor reiniciar, o pipeline para

### Riscos

- **Step muito demorado** — Mitigação: timeout configurável por step
- **Falha em step irreversível** — Mitigação: marcar pipeline como failed após 3 tentativas

---

## Ações Necessárias

- [ ] Implementar PipelineOrchestrator com executeStep()
- [ ] Implementar retry com backoff (1s, 2s, 4s)
- [ ] Persistir estado após cada step

---

## Referências

- [Fluxos Críticos — Retry de Step](../blueprint/07-critical_flows.md)

---

## Histórico

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-03-30 | Douglas Prado | Criação |
