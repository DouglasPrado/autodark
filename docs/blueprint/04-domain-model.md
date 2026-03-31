# Modelo de Domínio

O modelo de domínio representa as entidades centrais do sistema, suas responsabilidades e como se relacionam entre si. Ele serve como a **linguagem compartilhada** entre equipe técnica e stakeholders, garantindo que todos falem o mesmo idioma ao discutir o produto.

> O modelo de domínio NÃO é o modelo de dados. Aqui focamos no **comportamento e nas regras de negócio**, não na estrutura de armazenamento.

---

## Glossário Ubíquo

> Quais termos do domínio precisam de definição clara para evitar ambiguidade?
> **Fonte unica de termos:** [docs/shared/glossary.md](../shared/glossary.md). Ao preencher esta secao, atualize tambem o glossario compartilhado.

| Termo | Definição |
|-------|-----------|
| **Engine** | Módulo especializado do sistema que executa uma função específica (Content, Rendering, Performance, Strategy, Learning). |
| **Pipeline** | Fluxo sequencial de steps que transforma entrada (nicho) em saída (vídeo publicado). |
| **PipelineContext** | Estado imutável que flui entre os steps do pipeline, carregando dados de todas as engines. |
| **Scene** | Menor unidade atômica do vídeo. Contém texto, duração, timestamps e query visual. |
| **Template** | Estrutura fixa de roteiro (HOOK → SETUP → ESCALADA → TWIST → PAYOFF → LOOP) otimizada para retenção. |
| **Hook** | Primeiros 0-5 segundos do vídeo — momento crítico para reter viewer. |
| **Pacing** | Controle de ritmo via duração de cenas (max 2.5s), pattern interrupts, zoom e transições. |
| **Learning Loop** | Ciclo fechado: Performance → Learning → Strategy → Content. |
| **Cold Start** | Período inicial (48-72h) antes de ter dados do YouTube Analytics. |
| **Drop-off Points** | Momentos específicos onde espectadores abandonam o vídeo. |
| **CTR (Click-Through Rate)** | Porcentagem de visualizações que resultam em cliques na thumbnail. |
| **Retention** | Porcentagem média do vídeo que espectadores assistem. |
| **Strategy Directive** | Instrução da Strategy Engine para Content Engine (tema, ângulo, métricas-alvo). |
| **Learning Weights** | Parâmetros ajustáveis que influenciam geração de conteúdo (tipo de hook, intensidade de escalada, etc.). |

<!-- APPEND:glossary -->

---

## Entidades

> Quais são os conceitos centrais que o sistema precisa representar? Cada entidade deve ter identidade própria e ciclo de vida bem definido.

### PipelineContext

**Descrição:** Estado global que flui através de todos os steps do pipeline. É o único estado compartilhado entre engines.

**Atributos:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|:-----------:|-----------|
| id | string | sim | UUID único da execução |
| niche | string | sim | Nicho do canal (ex: "dark", "curiosidades") |
| contentPlan | ContentPlan | não | Plano de conteúdo da Strategy Engine |
| strategyDirective | StrategyDirective | não | Diretiva atual para geração |
| idea | Idea | não | Ideia de vídeo gerada |
| script | Script | não | Roteiro estruturado |
| scenes | Scene[] | não | Lista de cenas segmentadas |
| audioSegments | AudioSegment[] | não | Segmentos de áudio por cena |
| clips | Clip[] | não | Assets visuais por cena |
| videoPath | string | não | Caminho do vídeo renderizado |
| thumbnailPath | string | não | Caminho da thumbnail |
| metadata | VideoMetadata | não | Título, descrição, tags |
| videoId | string | não | ID do vídeo no YouTube |
| metrics | VideoMetrics | não | Métricas de performance |
| performanceScore | number | não | Score composto de performance |
| learningState | LearningState | não | Estado atual do learning |
| status | PipelineStatus | sim | Status do pipeline (pending, running, paused, completed, failed) |
| errorMessage | string | não | Mensagem de erro se status=failed |
| durationMs | number | não | Tempo total de execução em milissegundos |
| createdAt | Date | sim | Timestamp de início |
| updatedAt | Date | sim | Timestamp de última atualização |

**Regras de Negócio:**
- PipelineContext é imutável — cada step retorna novo contexto
- Status determina quais campos são esperados
- Cold start: learningState usa valores padrão até dados suficientes

---

### Idea

**Descrição:** Ideia de vídeo gerada pela Content Engine baseada no nicho e diretiva da Strategy.

**Atributos:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|:-----------:|-----------|
| id | string | sim | UUID único |
| niche | string | sim | Nicho do canal |
| text | string | sim | Texto da ideia/título |
| angle | string | não | Ângulo/twist da ideia |
| source | string | sim | Fonte (strategy, manual, random) |
| createdAt | Date | sim | Timestamp de geração |

**Regras de Negócio:**
- Gerada automaticamente via LLM ou manualmente pelo operador
- Deve ser validada antes de passar para geração de roteiro

---

### Script

**Descrição:** Roteiro estruturado seguindo o template (HOOK → SETUP → ESCALADA → TWIST → PAYOFF → LOOP).

**Atributos:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|:-----------:|-----------|
| id | string | sim | UUID único |
| ideaId | string | sim | Referência à ideia |
| template | string | sim | Template usado (固定) |
| hook | string | sim | Texto do hook (0-5s) |
| setup | string | sim | Texto do setup (5-15s) |
| escalada | string | sim | Texto da escalada (15s+) |
| twist | string | não | Texto do twist |
| payoff | string | não | Texto do payoff |
| loop | string | não | Texto do loop (reenganche) |
| estimatedDuration | number | sim | Duração estimada em segundos |
| createdAt | Date | sim | Timestamp de geração |

**Regras de Negócio:**
- Hook é obrigatório e deve ter no máximo 5 segundos
- Template não pode ser alterado em runtime
- Learning weights influenciam tom e intensidade de cada segmento

---

### Scene

**Descrição:** Menor unidade atômica do vídeo. Cada scene é renderizada individualmente e depois concatenada.

**Atributos:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|:-----------:|-----------|
| id | string | sim | UUID único |
| scriptId | string | sim | Referência ao roteiro |
| order | number | sim | Ordem da cena no vídeo |
| text | string | sim | Texto da narração |
| duration | number | sim | Duração em segundos |
| start | number | sim | Timestamp de início no vídeo final |
| end | number | sim | Timestamp de fim no vídeo final |
| visualQuery | string | sim | Query para busca de assets visuais |
| segmentType | string | sim | Tipo (hook, setup, escalada, twist, payoff, loop) |
| pacing | PacingConfig | não | Configurações de pacing aplicadas |

**Regras de Negócio:**
- Duração máxima: 2.5 segundos por scene
- Scene é a unidade mínima de renderização
- visualQuery é obrigatória para busca de assets

---

### AudioSegment

**Descrição:** Áudio gerado via TTS para uma scene específica.

**Atributos:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|:-----------:|-----------|
| id | string | sim | UUID único |
| sceneId | string | sim | Referência à scene |
| text | string | sim | Texto narrado |
| voiceId | string | sim | ID da voz ElevenLabs |
| audioUrl | string | sim | URL do áudio gerado |
| duration | number | sim | Duração em segundos |
| createdAt | Date | sim | Timestamp de geração |

**Regras de Negócio:**
- Um AudioSegment por Scene
- Duração deve corresponder à duração da scene

---

### Clip

**Descrição:** Asset visual (vídeo ou imagem) buscado no Pexels para uma scene.

**Atributos:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|:-----------:|-----------|
| id | string | sim | UUID único |
| sceneId | string | sim | Referência à scene |
| query | string | sim | Query usada na busca |
| source | string | sim | Fonte (pexels, dalle) |
| mediaId | string | sim | ID do media no source |
| mediaUrl | string | sim | URL do media |
| localPath | string | sim | Caminho local após download |
| duration | number | não | Duração (para vídeos) |
| score | number | sim | Score de relevância |
| createdAt | Date | sim | Timestamp de busca |

**Regras de Negócio:**
- Score determina relevância para a scene
- Fallback: se não encontrar, usa imagem gerada via IA

---

### Video

**Descrição:** Vídeo final renderizado, pronto para upload.

**Atributos:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|:-----------:|-----------|
| id | string | sim | UUID único |
| pipelineId | string | sim | Referência ao PipelineContext |
| path | string | sim | Caminho local do arquivo .mp4 |
| duration | number | sim | Duração total em segundos |
| resolution | string | sim | Resolução (1920x1080) |
| format | string | sim | Formato (mp4) |
| size | number | sim | Tamanho em bytes |
| hasSubtitles | boolean | sim | Se tem legendas |
| hasMusic | boolean | sim | Se tem música de fundo |
| createdAt | Date | sim | Timestamp de renderização |

**Regras de Negócio:**
- Resolução padrão: 1920x1080 (16:9)
- Formato: MP4 (H.264)

---

### Thumbnail

**Descrição:** Thumbnail gerada automaticamente com scoring de CTR.

**Atributos:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|:-----------:|-----------|
| id | string | sim | UUID único |
| videoId | string | sim | Referência ao vídeo |
| concepts | string[] | sim | Conceitos visuais gerados |
| imageUrl | string | sim | URL da imagem gerada (DALL-E/SDXL) |
| localPath | string | sim | Caminho local após download |
| ctrScore | number | sim | Score de potencial CTR (0-100) |
| isSelected | boolean | sim | Se foi selecionada |
| createdAt | Date | sim | Timestamp de geração |

**Regras de Negócio:**
- Gera múltiplas variantes, seleciona a com maior CTR score
- Resolução: 1280x720

---

### VideoMetrics

**Descrição:** Métricas reais de performance coletadas via YouTube Analytics API.

**Atributos:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|:-----------:|-----------|
| id | string | sim | UUID único |
| pipelineId | string | sim | Referência ao PipelineContext |
| youtubeVideoId | string | sim | ID do vídeo no YouTube |
| publishedAt | Date | sim | Data de publicação |
| views | number | sim | Total de visualizações |
| likes | number | sim | Total de likes |
| comments | number | sim | Total de comentários |
| retention | number | não | Porcentagem de retenção média |
| ctr | number | não | Click-through rate (%) |
| avgWatchTime | number | não | Tempo médio de visualização (segundos) |
| dropOffPoints | number[] | sim | Timestamps de abandono |
| retentionCurve | RetentionCurve | não | Curva de retenção por segundo |
| status | VideoMetricsStatus | sim | Status da coleta (pending, collected, failed) |
| createdAt | Date | sim | Timestamp de coleta |

**Regras de Negócio:**
- Dados disponíveis apenas 48-72h após publicação
- Retention curve é opcional (API pode não retornar)
- retention, ctr, avgWatchTime são opcionais (podem não estar disponíveis na primeira coleta)

---

### ContentPlan

**Descrição:** Plano de conteúdo gerado pela Strategy Engine baseado em dados de performance.

**Atributos:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|:-----------:|-----------|
| id | string | sim | UUID único |
| niche | string | sim | Nicho do canal |
| topics | string[] | sim | Tópicos priorizados |
| series | Series[] | não | Séries temáticas |
| generatedAt | Date | sim | Timestamp de geração |

**Regras de Negócio:**
- Gera tópicos baseados em clusterização de dados
- Pode criar séries temáticas (ex: "Mysteries Unolved", 10 episódios)

---

### LearningState

**Descrição:** Estado do Learning Engine com pesos ajustáveis para geração de conteúdo.

**Atributos:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|:-----------:|-----------|
| id | string | sim | UUID único |
| niche | string | sim | Nicho do canal |
| hookWeights | HookWeights | sim | Pesos para tipos de hook |
| templateWeights | Record<string, number> | sim | Pesos para segmentos de template |
| pacingWeights | Record<string, number> | sim | Pesos para configurações de pacing |
| contentWeights | Record<string, number> | sim | Pesos para topics/angles |
| isActive | boolean | sim | Se o learning está ativo |
| status | LearningStatus | sim | Estado do learning (inactive, active, paused) |
| lastUpdated | Date | sim | Timestamp de última atualização |
| analyzedVideos | number | sim | Quantidade de vídeos analisados |
| createdAt | Date | sim | Timestamp de criação |

**Regras de Negócio:**
- Cold start: usa valores padrão até analisar mínimo de 5 vídeos
- Pesos ajustados após análise de performance
- Taxa de ajuste limitada para evitar oscilação

---

### StrategyDirective

**Descrição:** Instrução da Strategy Engine para a Content Engine sobre o que gerar.

**Atributos:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|:-----------:|-----------|
| id | string | sim | UUID único |
| topic | string | sim | Tópico principal |
| angle | string | não | Ângulo/twist |
| targetMetrics | object | não | Métricas-alvo (retenção, CTR) |
| template | string | sim | Template de roteiro recomendado |
| priority | number | sim | Prioridade (1-5) |
| createdAt | Date | sim | Timestamp de geração |

**Regras de Negócio:**
- Gerada automaticamente pela Strategy Engine
- Pode ser sobrescrita manualmente pelo operador

---

### Series

**Descrição:** Série temática de vídeos (ex: "10 Mistérios Não Resolvidos").

**Atributos:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|:-----------:|-----------|
| id | string | sim | UUID único |
| title | string | sim | Título da série |
| topic | string | sim | Tópico central |
| episodeCount | number | sim | Número de episódios |
| episodes | string[] | sim | IDs dos vídeos na série |
| status | string | sim | Status (planning, in_progress, completed) |
| createdAt | Date | sim | Timestamp de criação |

**Regras de Negócio:**
- Episodes são adicionados conforme vídeos são gerados
- Status tracking para saber progresso da série

<!-- APPEND:entities -->

---

## Relacionamentos

> Como as entidades se conectam? Quais dependências existem entre elas? Existem relações de composição (parte-todo) ou apenas associação?

| Entidade A | Cardinalidade | Entidade B | Descrição do Relacionamento |
|------------|:-------------:|------------|----------------------------|
| PipelineContext | 1:1 | ContentPlan | Um contexto tem um plano de conteúdo |
| PipelineContext | 1:N | Scene | Um contexto tem múltiplas scenes |
| PipelineContext | 1:1 | Video | Um contexto gera um vídeo |
| PipelineContext | 1:1 | Thumbnail | Um contexto gera uma thumbnail |
| PipelineContext | 1:1 | LearningState | Um contexto carrega estado de learning |
| PipelineContext | 1:1 | VideoMetrics | Um contexto pode ter métricas |
| Idea | 1:N | Script | Uma ideia gera um roteiro |
| Script | 1:N | Scene | Um roteiro tem múltiplas scenes |
| Scene | 1:1 | AudioSegment | Uma scene tem um áudio |
| Scene | 1:1 | Clip | Uma scene tem um clip visual |
| Video | 1:1 | Thumbnail | Um vídeo tem uma thumbnail |
| Video | 1:N | VideoMetrics | Um vídeo pode ter métricas (histórico) |
| ContentPlan | 1:N | Series | Um plano pode ter séries |
| Series | 1:N | Video | Uma série tem múltiplos vídeos |
| LearningState | N:1 | PipelineContext | Learning state asociado a um nicho |

<!-- APPEND:relationships -->

---

## Diagrama de Domínio

> Atualize o diagrama abaixo conforme as entidades e relacionamentos definidos acima.

> 📐 Diagrama: [class-diagram.mmd](../diagrams/domain/class-diagram.mmd)

---

## Referências

- [PRD — Mestra AI](docs/prd.md)
- [Pipeline Context TypeScript](docs/prd.md#612-pipeline-context)
- [YouTube Analytics API](https://developers.google.com/youtube/analytics)
