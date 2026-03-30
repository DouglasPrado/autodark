# Casos de Uso

> Quais são as ações que os usuários podem realizar no sistema?

Documente aqui todos os casos de uso do sistema. Cada caso de uso descreve uma interação completa entre um ator e o sistema para atingir um objetivo específico.

## Quando usar Casos de Uso vs User Stories

| | Casos de Uso | User Stories |
|--|-------------|-------------|
| **Formato** | Estruturado, com fluxos detalhados passo a passo | Narrativo curto: "Como ___, quero ___, para ___" |
| **Nível de detalhe** | Alto — inclui fluxos alternativos e de exceção | Baixo — foco na intenção, não no "como" |
| **Melhor para** | Sistemas com regras de negócio complexas, integrações, contratos de API | Backlogs ágeis, priorização, comunicação rápida com stakeholders |
| **Recomendação** | Use quando precisar documentar o comportamento completo de uma funcionalidade | Use quando precisar capturar necessidades de forma rápida e iterativa |

> Na dúvida, comece com User Stories para capturar a intenção e evolua para Casos de Uso quando precisar detalhar o comportamento.

---

## UC-001: Executar Pipeline de Geração de Vídeo

**Ator:** Operador de Canal

**Pré-condição:** 
- Operador tem acesso à CLI
- Nicho configurado
- APIs externas configuradas (OpenRouter, ElevenLabs, Pexels, YouTube)
- Banco de dados acessível

#### Fluxo Principal

1. Operador executa comando: `mestra generate --niche dark`
2. CLI inicializa Pipeline Orchestrator com nicho
3. Pipeline Orchestrator busca Learning State no banco
4. Pipeline Orchestrator busca Content Plan vigente
5. Content Engine gera ideia via OpenRouter
6. Content Engine gera roteiro via template
7. Content Engine gera variantes de hook e seleciona melhor
8. Scene Engine segmenta roteiro em cenas
9. Scene Engine gera visual queries por cena
10. Voice Engine gera áudio por cena (paralelo)
11. Visual Engine busca clips no Pexels (paralelo)
12. Pacing Engine aplica max 2.5s por cena e interrupções
13. Rendering Engine renderiza cada cena via FFmpeg
14. Rendering Engine concatena cenas e adiciona legendas/música
15. Thumbnail Engine gera conceitos e imagens
16. Thumbnail Engine compõe thumbnail e seleciona melhor
17. Upload Module gera título/descrição/tags
18. Upload Module publica vídeo no YouTube
19. Pipeline Orchestrator persiste estado no banco
20. CLI exibe resultado ao operador

#### Fluxos Alternativos

- **3a.** Cold start (sem Learning State): Usa pesos padrão
- **5a.** Strategy Directive disponível: Usa diretiva da Strategy Engine
- **10a/11a.** Voice e Visual executam em paralelo
- **15a.** DALL-E indisponível: Usa fallback para Pexels

#### Fluxo de Exceção

- **5b.** OpenRouter indisponível: Retry 3x, falha se persistir
- **10b.** ElevenLabs indisponível: Retry 3x, fallback para voz alternativa
- **11b.** Pexels sem resultados: Fallback para imagem gerada via DALL-E
- **13b.** FFmpeg falha: Retry na cena, marca falha se persistir
- **18b.** YouTube API indisponível: Retry 3x, mantém status pending
- **19b.** Banco indisponível: Continua em memória, persiste quando disponível

**Pós-condição:** Vídeo publicado no YouTube com thumbnail e metadados; estado persistido no banco.

**Regras de Negócio:** RF-001, RF-002, RF-003, RF-005, RF-008, RF-011, RF-014, RF-018, RF-023, RF-039

---

## UC-002: Coleta de Métricas do YouTube

**Ator:** Sistema (Scheduler/Cron)

**Pré-condição:**
- Scheduler configurado
- YouTube Analytics API configurada com OAuth
- Vídeos publicados nos últimos 7 dias

#### Fluxo Principal

1. Scheduler dispara coleta a cada 6 horas
2. Performance Engine busca vídeos publicados no período
3. Para cada vídeo:
   - Chama YouTube Analytics API
   - Coleta métricas (views, likes, retention, CTR)
   - Detecta drop-off points
   - Calcula performance score
4. Performance Engine persiste VideoMetrics no banco

#### Fluxos Alternativos

- **3a.** Vídeo < 48h: Pula (dados não disponíveis)
- **3b.** Dados parciais: Usa valores padrão (0)

#### Fluxo de Exceção

- **3c.** Rate limit: Backoff exponential, agenda retry
- **3d.** API retorna erro: Loga erro, pula vídeo

**Pós-condição:** Métricas de todos os vídeos recentes persistidas no banco.

**Regras de Negócio:** RF-028, RF-029, RF-030, RF-031

---

## UC-003: Executar Learning Loop

**Ator:** Sistema (Scheduler/Cron)

**Pré-condição:**
- Scheduler configurado
- Mínimo de 5 vídeos com métricas coletadas

#### Fluxo Principal

1. Scheduler dispara Learning Loop
2. Learning Engine busca últimas métricas (mínimo 5)
3. Learning Engine analisa vídeos com baixa performance
4. Learning Engine identifica padrões de falha
5. Learning Engine calcula novos pesos
6. Learning Engine limita taxa de ajuste (max 10%)
7. Learning Engine atualiza LearningState no banco
8. Strategy Engine notificada de novos pesos

#### Fluxos Alternativos

- **3a.** Cold start (< 5 vídeos): Pula ajuste, usa pesos padrão

#### Fluxo de Exceção

- **5b.** Convergência instável: Limita taxa, mantém pesos anteriores
- **7b.** Banco indisponível: Retry, mantém estado inalterado

**Pós-condição:** LearningState atualizado com novos pesos; Strategy Engine com diretivas otimizadas.

**Regras de Negócio:** RF-036, RF-037, RF-038

---

## UC-004: Retry de Step com Persistência

**Ator:** Pipeline Orchestrator (interno)

**Pré-condição:**
- Pipeline em execução
- Um step falhou

#### Fluxo Principal

1. Step falha (timeout, erro, etc.)
2. Pipeline Orchestrator captura erro
3. Incrementa contador de retry
4. Se contador < 3:
   - Aplica backoff (1s, 2s, 4s)
   - Persiste estado atual no banco
   - Retry do step
5. Se sucesso: Continua pipeline
6. Se falha após 3 tentativas: Marca pipeline como failed

#### Fluxos Alternativos

- **4a.** Operador pode forçar reexecução via CLI

#### Fluxo de Exceção

- **1b.** Erro não capturado: Pipeline crash
- **6b.** Estado corrompido: Operador força restart do início

**Pós-condição:** Pipeline concluído com sucesso ou marcado como failed; estado persistido.

**Regras de Negócio:** RF-040, RF-041

---

## UC-005: Gerar Thumbnail com Scoring CTR

**Ator:** Thumbnail Engine (interno)

**Pré-condição:**
- Idea gerada
- DALL-E/SDXL configurado

#### Fluxo Principal

1. Thumbnail Engine recebe Idea
2. Gera 4 conceitos visuais baseados no nicho/tema
3. Gera imagens via DALL-E para cada conceito
4. Compõe thumbnail (imagem + texto + overlay + gradiente)
5. Pontua CTR baseado em histórico
6. Seleciona melhor thumbnail

#### Fluxos Alternativos

- **3a.** DALL-E indisponível: Usa Pexels como fallback

#### Fluxo de Exceção

- **3b.** Geração falha: Usa template default

**Pós-condição:** Thumbnail selecionada com score de CTR.

**Regras de Negócio:** RF-023, RF-024, RF-025, RF-026, RF-027

---

## UC-006: Upload de Vídeo no YouTube

**Ator:** Upload Module (interno)

**Pré-condição:**
- Vídeo renderizado em disco
- Thumbnail selecionada
- YouTube Data API configurada

#### Fluxo Principal

1. Recebe videoPath e thumbnailPath
2. Gera título via LLM (baseado na Idea)
3. Gera descrição via LLM (baseado no Script)
4. Gera tags via LLM
5. Upload vídeo via YouTube Data API
6. Upload thumbnail
7. Recebe videoId
8. Persiste videoId no banco

#### Fluxos Alternativos

- **2a-4a.** LLM indisponível: Usa valores do Script

#### Fluxo de Exceção

- **5b.** Rate limit: Retry 3x com backoff
- **5c.** Vídeo muito grande: Falha com mensagem clara

**Pós-condição:** Vídeo publicado no YouTube; videoId persistido.

**Regras de Negócio:** RF-039

---

## UC-007: Verificar Status do Pipeline

**Ator:** Operador de Canal

**Pré-condição:**
- Pipeline executado anteriormente
- Banco de dados acessível

#### Fluxo Principal

1. Operador executa: `mestra status --pipeline-id <id>`
2. CLI busca status no banco
3. Exibe informações:
   - Status atual (pending, running, completed, failed)
   - Step atual
   - Tempo decorrido
   - Erro (se failed)

#### Fluxos Alternativos

- **1a.** Sem pipeline-id: Lista últimos 10 pipelines

#### Fluxo de Exceção

- **2b.** Pipeline não encontrado: Exibe mensagem de erro

**Pós-condição:** Status exibido ao operador.

**Regras de Negócio:** RF-041

---

## UC-008: Criar Série Temática

**Ator:** Strategy Engine (interno) ou Operador

**Pré-condição:**
- Learning State ativo
- Histórico de vídeos com métricas

#### Fluxo Principal

1. Strategy Engine identifica padrão temático
2. Gera título da série (ex: "10 Mistérios Não Resolvidos")
3. Define episódio count (10)
4. Cria Serie no banco
5. Adiciona episódios conforme vídeos são gerados
6. Tracking de progresso

#### Fluxos Alternativos

- **1a.** Operador pode criar série manualmente via CLI

**Pós-condição:** Série criada e rastreando episódios.

**Regras de Negócio:** RF-032, RF-035

---

## UC-009: Configurar Nicho

**Ator:** Operador de Canal

**Pré-condição:**
- Acesso à CLI
- Arquivo de configuração existente

#### Fluxo Principal

1. Operador edita `config/niches/dark.yaml`
2. Define: nome, diretivas, preferências de voz
3. Valida configuração
4. Salva no banco

#### Fluxo de Exceção

- **3b.** Configuração inválida: Exibe erros de validação

**Pós-condição:** Nicho configurado e persistido.

**Regras de Negócio:** RF-032

---

## UC-010: Listar Vídeos Publicados

**Ator:** Operador de Canal

**Pré-condição:**
- Vídeos publicados anteriormente
- Banco de dados acessível

#### Fluxo Principal

1. Operador executa: `mestra videos --niche dark --limit 10`
2. CLI busca vídeos no banco
3. Exibe lista com:
   - videoId
   - título
   - status
   - data de publicação
   - métricas (se disponíveis)

#### Fluxos Alternativos

- **1a.** Sem filtro: Lista todos os vídeos

**Pós-condição:** Lista de vídeos exibida.

**Regras de Negócio:** RF-028

<!-- APPEND:use-cases -->
