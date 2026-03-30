# Glossario Ubiquo

> **Fonte unica de termos do dominio.** Todos os blueprints (tecnico, backend, frontend, business) devem usar estes termos. Nao crie glossarios separados — referencie este arquivo.

| Termo | Definicao | Nao Confundir Com | Usado em |
|-------|-----------|-------------------|----------|
| **Engine** | Modulo especializado do sistema que executa uma funcao especifica (Content, Rendering, Performance, Strategy, Learning) | Framework | Pipeline |
| **Pipeline** | Fluxo sequencial de steps que transforma entrada (nicho) em saida (video publicado) | workflow | Execucao |
| **PipelineContext** | Estado imutavel que flui entre os steps do pipeline, carregando dados de todas as engines | Context (React) | Steps |
| **Scene** | Menor unidade atomica do video. Contem texto, duracao, timestamps e query visual | Frame | Rendering |
| **Template** | Estrutura fixa de roteiro (HOOK → SETUP → ESCALADA → TWIST → PAYOFF → LOOP) otimizada para retencao | Layout | Content |
| **Hook** | Primeiros 0-5 segundos do video — momento critico para reter viewer | Title | Content |
| **Pacing** | Controle de ritmo via duracao de cenas (max 2.5s), pattern interrupts, zoom e transicoes | Tempo | Rendering |
| **Learning Loop** | Ciclo fechado: Performance → Learning → Strategy → Content | CI/CD | Operacao |
| **Cold Start** | Periodo inicial (48-72h) antes de ter dados do YouTube Analytics | Boot | Learning |
| **Drop-off Points** | Momentos especificos onde espectadores abandonam o video | Bounce rate | Analytics |
| **CTR (Click-Through Rate)** | Porcentagem de visualizacoes que resultam em cliques na thumbnail | Conversion rate | Metrics |
| **Retention** | Porcentagem media do video que espectadores assistem | View duration | Metrics |
| **Strategy Directive** | Instrucao da Strategy Engine para Content Engine (tema, angulo, metricas-alvo) | Command | Strategy |
| **Learning Weights** | Parametros ajustaveis que influenciam geracao de conteudo (tipo de hook, intensidade de escalada, etc.) | Hyperparameters | Learning |
| **Scene-Based Rendering** | Renderizacao por cena individual, depois concatenada | Batch rendering | Rendering |
| **Thumbnail Engine** | Modulo que gera thumbnails com scoring de CTR | Image generator | Pipeline |

<!-- APPEND:termos -->

---

## Acronimos

| Sigla | Significado | Contexto |
|-------|-------------|----------|
| **TTS** | Text-to-Speech | Voice Engine |
| **Pexels** | Video/image stock API | Visual Engine |
| **FFmpeg** | CLI de renderizacao | Rendering Engine |
| **LLM** | Large Language Model | Content Engine |
| **CTR** | Click-Through Rate | Performance |
| **RPO** | Recovery Point Objective | Disaster recovery |
| **RTO** | Recovery Time Objective | Disaster recovery |
| **MoSCoW** | Must/Should/Could/Won't | Priorizacao |

<!-- APPEND:acronimos -->

---

## Convencoes de Nomenclatura

> Regras que se aplicam a todos os blueprints.

| Contexto | Convencao | Exemplo |
|----------|-----------|---------|
| Entidades | PascalCase, singular, ingles | Scene, Video, Thumbnail |
| Campos | camelCase, ingles | videoId, createdAt |
| Arrays | camelCase, plural | scenes, clips |
| Enums | camelCase, ingles | pending, completed, failed |
| Types/Interfaces | PascalCase | PipelineContext, VideoMetrics |
| Funcoes de Engine | camelCase, verbo | generateIdea, composeScene |

<!-- APPEND:convencoes -->

> Este arquivo e referenciado por:
> - `docs/blueprint/04-domain-model.md` (glossario de dominio)
> - `docs/backend/03-domain.md` (implementacao de entidades)
> - `docs/frontend/04-components.md` (nomes de componentes baseados no dominio)
> - `docs/business/00-business-context.md` (termos de negocio)
