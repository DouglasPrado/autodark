# Estados do Sistema

> Identifique entidades que possuem ciclo de vida — elas mudam de estado ao longo do tempo.

Muitos objetos do domínio não são estáticos: um pedido nasce como **rascunho**, passa por **confirmado**, **pago**, **enviado** e finalmente **entregue** (ou **cancelado**). Modelar esses estados de forma explícita evita inconsistências, facilita validações e torna o comportamento do sistema previsível.

Este documento cataloga todas as entidades com ciclo de vida, seus estados possíveis e as transições permitidas entre eles.

---

## Modelo de Estados

> Quais entidades mudam de estado? Pedidos, pagamentos, assinaturas, tarefas?

---

### Pipeline

**Descrição:** Representa uma execução completa do pipeline de geração de vídeo, desde a inicialização até a publicação ou falha.

#### Estados Possíveis

| Estado | Descrição |
|--------|-----------|
| pending | Pipeline criado, aguardando início da execução |
| running | Pipeline em execução, steps sendo processados |
| paused | Pipeline pausado (para retry manual) |
| completed | Pipeline executado com sucesso, vídeo publicado |
| failed | Pipeline falhou em algum step |

#### Transições

| De | Para | Gatilho | Condição |
|----|------|---------|----------|
| pending | running | Operador inicia pipeline | Nicho configurado |
| running | running | Step completo | Próximo step executado |
| running | paused | Operador pausa | Retry manual necessário |
| paused | running | Operador resume | Problema resolvido |
| running | completed | Upload YouTube bem-sucedido | Vídeo publicado |
| running | failed | Step falha após 3 tentativas | Erro irrecuperável |
| paused | failed | Operador cancela | Cancelamento explícito |
| failed | pending | Operador reinicia | Novo pipeline |

#### Transições Proibidas

- pending → completed (deve passar por running)
- failed → completed (não é possível completar um pipeline que falhou)
- completed → * (estado terminal)

#### Diagrama

> 📐 Diagrama: [state-pipeline.mmd](../diagrams/domain/state-pipeline.mmd)

---

### Series

**Descrição:** Representa uma série temática de vídeos (ex: "10 Mistérios Não Resolvidos"), com acompanhamento de progresso.

#### Estados Possíveis

| Estado | Descrição |
|--------|-----------|
| planning | Série criada, aguardando início da produção |
| in_progress | Vídeos sendo produzidos |
| completed | Todos os episódios publicados |
| cancelled | Série cancelada |

#### Transições

| De | Para | Gatilho | Condição |
|----|------|---------|----------|
| planning | in_progress | Primeiro vídeo publicado | Pelo menos 1 vídeo |
| in_progress | completed | Último episódio publicado | episode_count atingido |
| in_progress | cancelled | Operador cancela | Cancelamento explícito |
| planning | cancelled | Operador cancela | Cancelamento explícito |

#### Transições Proibidas

- completed → * (estado terminal)
- cancelled → * (estado terminal)
- planning → completed (deve produzir episódios)

#### Diagrama

> 📐 Diagrama: [state-series.mmd](../diagrams/domain/state-series.mmd)

---

### LearningState

**Descrição:** Representa o estado do Learning Engine para um nicho específico, indicando se o aprendizado está ativo.

#### Estados Possíveis

| Estado | Descrição |
|--------|-----------|
| inactive | Learning não ativo (cold start) |
| active | Learning ativo, ajustando pesos |
| paused | Learning pausado (por instabilidade) |

#### Transições

| De | Para | Gatilho | Condição |
|----|------|---------|----------|
| inactive | active | Mínimo 5 vídeos analisados | Dados suficientes |
| active | inactive | Operador desativa | Configuração explícita |
| active | paused | Instabilidade detectada | Convergência instável |
| paused | active | Operador reativa | Verificação manual |

#### Transições Proibidas

- inactive → paused (não pode pausar algo inativo)

#### Diagrama

> 📐 Diagrama: [state-learning.mmd](../diagrams/domain/state-learning.mmd)

---

### VideoMetrics

**Descrição:** Representa as métricas de um vídeo coletadas do YouTube Analytics.

#### Estados Possíveis

| Estado | Descrição |
|--------|-----------|
| pending | Métricas solicitadas, aguardando API |
| collected | Métricas obtidas com sucesso |
| failed | Falha ao coletar métricas |

#### Transições

| De | Para | Gatilho | Condição |
|----|------|---------|----------|
| pending | collected | API retorna dados | Sucesso na chamada |
| pending | failed | API retorna erro | Falha na chamada |
| failed | pending | Retry agendado | Tentativa de retry |

#### Transições Proibidas

- collected → * (estado terminal)

#### Diagrama

> 📐 Diagrama: [state-video-metrics.mmd](../diagrams/domain/state-video-metrics.mmd)

---

### Scene

**Descrição:** Menor unidade do vídeo, processada individualmente.

#### Estados Possíveis

| Estado | Descrição |
|--------|-----------|
| pending | Scene criada, aguardando processamento |
| audio_generating | Áudio sendo gerado (TTS) |
| audio_ready | Áudio gerado |
| visual_ready | Visual disponível |
| rendered | Scene renderizada |
| failed | Falha no processamento |

#### Transições

| De | Para | Gatilho | Condição |
|----|------|---------|----------|
| pending | audio_generating | Iniciar geração de áudio | - |
| audio_generating | audio_ready | Áudio retornado | Sucesso |
| audio_ready | visual_ready | Visual baixado | Sucesso |
| visual_ready | rendered | FFmpeg processa | Sucesso |
| audio_generating | failed | ElevenLabs falha | Após 3 retries |
| visual_ready | failed | FFmpeg falha | Após 3 retries |

#### Transições Proibidas

- rendered → * (estado terminal)
- failed → * (precisa de retry manual)

#### Diagrama

> 📐 Diagrama: [state-scene.mmd](../diagrams/domain/state-scene.mmd)

<!-- APPEND:state-models -->
