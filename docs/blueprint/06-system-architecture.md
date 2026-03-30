# Arquitetura do Sistema

## Introdução

Esta seção descreve a arquitetura de alto nível do sistema **Mestra AI**, incluindo seus componentes principais, como eles se comunicam e onde são implantados. O objetivo é fornecer uma visão clara da estrutura técnica para que qualquer membro da equipe consiga entender o funcionamento do sistema como um todo.

---

## Componentes

> Quais são os blocos principais do sistema? Cada componente deve ter uma responsabilidade clara.

### Mestra AI CLI

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | Mestra AI CLI                                   |
| **Responsabilidade** | Ponto de entrada para operador. Executa pipelines via comandos, gerencia configuração e executa scripts de automação. |
| **Tecnologia**   | Node.js 20+ / TypeScript                       |
| **Interface**    | CLI ( commander.js ), arquivos de config YAML |

---

### Pipeline Orchestrator

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | Pipeline Orchestrator                           |
| **Responsabilidade** | Coordena execução sequencial dos steps do pipeline, gerencia estado, retry e persistência. |
| **Tecnologia**   | TypeScript (funções puras)                     |
| **Interface**    | Funções internas (call)                        |

---

### Content Engine

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | Content Engine                                  |
| **Responsabilidade** | Gera ideias, roteiros e hooks via LLM. Aplica template de roteiro otimizado para retenção. |
| **Tecnologia**   | TypeScript + OpenRouter SDK                    |
| **Interface**    | Função: `generateIdea()`, `generateScriptFromTemplate()` |

---

### Scene Engine

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | Scene Engine                                    |
| **Responsabilidade** | Segmenta roteiro em cenas, estima durações, gera visual queries. |
| **Tecnologia**   | TypeScript                                     |
| **Interface**    | Função: `splitIntoScenes()`, `estimateDurations()` |

---

### Voice Engine

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | Voice Engine                                    |
| **Responsabilidade** | Gera narração via TTS (ElevenLabs), aplica perfis de voz, concatena segmentos. |
| **Tecnologia**   | TypeScript + ElevenLabs SDK                    |
| **Interface**    | Função: `generateVoice()`, `mergeAudioSegments()` |

---

### Visual Engine

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | Visual Engine                                   |
| **Responsabilidade** | Busca clips/imagens no Pexels, ranqueia por relevância, baixa assets. |
| **Tecnologia**   | TypeScript + Pexels API                        |
| **Interface**    | Função: `searchClips()`, `rankClips()`, `downloadMedia()` |

---

### Pacing Engine

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | Pacing Engine                                   |
| **Responsabilidade** | Controla ritmo do vídeo: max 2.5s por cena, pattern interrupts, zoom effects, micro-transitions. |
| **Tecnologia**   | TypeScript                                     |
| **Interface**    | Função: `enforceMaxSceneDuration()`, `addPatternInterrupts()` |

---

### Rendering Engine

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | Rendering Engine                                |
| **Responsabilidade** | Renderiza vídeo scene-based (FFmpeg), sincroniza audio/video, adiciona legendas e música. |
| **Tecnologia**   | TypeScript + FFmpeg CLI                        |
| **Interface**    | Função: `composeScene()`, `stitchScenes()`, `addSubtitles()` |

---

### Thumbnail Engine

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | Thumbnail Engine                                |
| **Responsabilidade** | Gera thumbnails com scoring CTR, compõe via Canvas, seleciona melhor opção. |
| **Tecnologia**   | TypeScript + DALL-E/SDXL + Canvas API          |
| **Interface**    | Função: `generateThumbnailConcepts()`, `scoreThumbnailCTR()` |

---

### Upload Module

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | Upload Module                                   |
| **Responsabilidade** | Publica vídeo no YouTube via Data API, gera título/descrição/tags automaticamente. |
| **Tecnologia**   | TypeScript + YouTube Data API SDK             |
| **Interface**    | Função: `uploadToYoutube()` |

---

### Performance Engine

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | Performance Engine                              |
| **Responsabilidade** | Coleta métricas via YouTube Analytics API, gera curvas de retenção, detecta drop-off points. |
| **Tecnologia**   | TypeScript + YouTube Analytics API             |
| **Interface**    | Função: `collectMetrics()`, `getRetentionCurve()` |

---

### Strategy Engine

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | Strategy Engine                                |
| **Responsabilidade** | Decide próximo conteúdo baseado em dados, clusteriza tópicos, cria séries. |
| **Tecnologia**   | TypeScript + OpenRouter SDK                    |
| **Interface**    | Função: `generateContentPlan()`, `clusterTopics()` |

---

### Learning Engine

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | Learning Engine                                 |
| **Responsabilidade** | Analisa performance, ajusta pesos de prompts, otimiza templates. |
| **Tecnologia**   | TypeScript                                     |
| **Interface**    | Função: `analyzeFailures()`, `updatePromptWeights()` |

---

### Database

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | Database                                        |
| **Responsabilidade** | Persiste pipelines, métricas, learning states, content plans. |
| **Tecnologia**   | SQLite (dev) / PostgreSQL (prod) + Prisma      |
| **Interface**    | Prisma Client (ORM)                            |

---

## Diagrama de Componentes

> 📐 Diagrama: [container-diagram.mmd](../diagrams/containers/container-diagram.mmd)

> Para componentes internos de cada container, veja: [api-components.mmd](../diagrams/components/api-components.mmd)

---

## Comunicação

> Como os componentes se comunicam? REST, gRPC, mensageria, eventos?

| De                    | Para                  | Protocolo          | Tipo (sync/async) | Descrição                                      |
| --------------------- | --------------------- | ------------------ | ----------------- | ---------------------------------------------- |
| CLI                   | Pipeline Orchestrator | Função (call)     | Sync              | Executa pipeline via comando                   |
| Pipeline Orchestrator | Content Engine       | Função (call)     | Sync              | Gera ideia e roteiro                           |
| Pipeline Orchestrator | Scene Engine         | Função (call)     | Sync              | Segmenta em cenas                              |
| Pipeline Orchestrator | Voice Engine         | Função (call)     | Sync              | Gera áudio por cena                            |
| Pipeline Orchestrator | Visual Engine        | Função (call)     | Sync              | Busca assets visuais                          |
| Pipeline Orchestrator | Pacing Engine         | Função (call)     | Sync              | Aplica pacing                                  |
| Pipeline Orchestrator | Rendering Engine      | Função (call)     | Sync              | Renderiza vídeo                                |
| Pipeline Orchestrator | Thumbnail Engine      | Função (call)     | Sync              | Gera thumbnail                                 |
| Pipeline Orchestrator | Upload Module         | Função (call)     | Sync              | Publica no YouTube                            |
| Pipeline Orchestrator | Database              | Prisma Client     | Sync              | Persiste estado                                |
| Performance Engine    | YouTube Analytics    | REST API          | Async (webhook/cron) | Coleta métricas (48-72h delay)            |
| Learning Engine       | Database              | Prisma Client     | Sync              | Atualiza pesos                                 |
| Strategy Engine       | Content Engine        | Função (call)     | Sync              | Passa diretiva de conteúdo                    |
| Mestra AI             | OpenRouter            | REST API          | Sync              | Geração LLM                                    |
| Mestra AI             | ElevenLabs            | REST API          | Sync              | TTS                                            |
| Mestra AI             | Pexels                | REST API          | Sync              | Busca assets                                   |
| Mestra AI             | FFmpeg                | CLI               | Sync              | Renderização                                   |
| Mestra AI             | YouTube Data API      | REST API           | Sync              | Upload                                         |

<!-- APPEND:communication -->

> Adicione uma linha para cada fluxo de comunicação relevante entre componentes ou sistemas externos.

---

## Infraestrutura e Deploy

> Onde e como o sistema será executado? Cloud, on-premise, containers?

### Ambientes

| Ambiente    | Finalidade                              | URL / Endpoint                  | Observações                          |
| ----------- | --------------------------------------- | ------------------------------- | ------------------------------------ |
| **Dev**     | Desenvolvimento e testes locais         | localhost:3000 (se API)          | SQLite embedded, .env local          |
| **Staging** | Validação antes de produção            | staging.internal                 | PostgreSQL, configurações reais API  |
| **Prod**    | Ambiente de produção                    | Executado via cron/scheduler    | PostgreSQL, secrets em env           |

### Decisões de Infraestrutura

| Aspecto                | Escolha                                          |
| ---------------------- | ------------------------------------------------ |
| **Provedor Cloud**     | Qualquer um (VPS, EC2, DigitalOcean, etc.)      |
| **Orquestração**       | Docker Compose (dev) / systemd ou PM2 (prod)     |
| **CI/CD**              | GitHub Actions                                   |
| **Monitoramento**      | Logs no terminal + structured logs               |
| **Banco de Dados**     | SQLite (dev) / PostgreSQL (prod)                 |
| **Mensageria/Filas**  | Não há — pipeline síncrono com retry             |
| **Runtime**            | Node.js 20+ LTS                                  |
| **Armazenamento**      | Disco local para vídeos/thumbnails               |

---

## Diagrama de Deploy

> 📐 Diagrama: [production.mmd](../diagrams/deployment/production.mmd)

> Ajuste o diagrama de deploy para refletir a topologia real do sistema, incluindo balanceadores de carga, bancos de dados, caches e filas de mensagens.

---

## Decisões Arquiteturais Chave

| Decisão | Justificativa |
|---------|---------------|
| Monolito Node.js | Sistema de propósito único, sem necessidade de microserviços |
| Pipeline síncrono | Fluxo linear e determinístico; retry em cada step resolve falhas |
| Sem fila de mensagens | Volume controlado (10+ vídeos/dia), custo-benefício não justifica |
| FFmpeg local | Renderização scene-based requer controle granular |
| Learning assíncrono | YouTube Analytics tem delay de 48-72h; não bloqueia produção |
| Sem UI | Ferramenta CLI para operador interno |
