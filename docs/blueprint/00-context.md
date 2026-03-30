# Contexto do Sistema

Esta seção estabelece a visão de alto nível do sistema: quem o utiliza, com quais sistemas externos ele se comunica, onde terminam suas responsabilidades e quais restrições moldam as decisões de arquitetura. Use-a como ponto de partida para alinhar stakeholders e equipe técnica sobre o escopo do projeto.

---

## Atores

> Quem interage com o sistema? Liste pessoas, sistemas e dispositivos.

| Ator | Tipo | Descrição |
| --- | --- | --- |
| Operador de Canal | Pessoa | Usuário único do sistema. Opera via CLI/scripts para gerar, publicar e otimizar videos automaticamente. Não requer conhecimento técnico avançado. |

<!-- APPEND:actors -->

---

## Sistemas Externos

> Com quais sistemas, serviços ou APIs externas o sistema precisa se integrar? Qual o propósito de cada integração?

| Sistema | Protocolo / Tipo de Integração | Função | Observações |
| --- | --- | --- | --- |
| OpenRouter | REST API | Gateway LLM para geração de roteiro, ideias e estratégia. Acesso a múltiplos modelos (GPT, Claude, etc.) sem lock-in. | Criticidade: Alta. Rate limits conforme plano. |
| ElevenLabs | REST API | Text-to-Speech para narração. Voz natural impacta diretamente na retenção. | Criticidade: Alta. Qualidade de voz é diferencial. |
| Pexels API | REST API | Busca de vídeos e imagens stock. Conteúdo livre de copyright para composição visual. | Criticidade: Alta. Fonte principal de assets visuais. |
| FFmpeg | CLI local | Motor de renderização scene-based. Cortes, merge, legendas, zoom, transições e pacing. | Criticidade: Alta. Processamento local. |
| YouTube Data API | REST API | Upload e publicação de vídeos. Geração automática de título, descrição e tags. | Criticidade: Alta. Autenticação OAuth2. |
| YouTube Analytics API | REST API | Coleta de métricas reais (retenção, CTR, watch time). Core do Performance Engine. | Criticidade: Alta. Delay de 48-72h para dados. |
| DALL-E / SDXL | REST API (via OpenRouter) | Geração de imagens para thumbnails via IA. Assets para composição via Canvas. | Criticidade: Média. Usado apenas para thumbnails. |

<!-- APPEND:external-systems -->

---

## Limites do Sistema

> O que está dentro e fora do escopo deste sistema? Definir limites claros evita ambiguidades e retrabalho.

**O sistema É responsável por:**

- Gerar ideias automaticamente baseadas em nicho e diretivas da Strategy
- Criar roteiro estruturado (HOOK → SETUP → ESCALADA → TWIST → PAYOFF → LOOP)
- Segmentar roteiro em cenas com duração e timestamps
- Gerar voz por cena via TTS (ElevenLabs)
- Buscar e ranquear visuais (Pexels)
- Aplicar pacing (max 2.5s/cena, pattern interrupts, zoom, transições)
- Renderizar vídeo scene-based com legendas e música
- Gerar thumbnails com scoring CTR
- Publicar automaticamente no YouTube
- Coletar métricas reais via YouTube Analytics
- Analisar performance e ajustar parâmetros (Learning Loop)
- Retry automático por step em caso de falha
- Persistir estado para retomar execuções
- Suportar 10+ vídeos/dia em batch

> Quais são as capacidades essenciais que o sistema deve oferecer para cumprir seu propósito?

**O sistema NÃO é responsável por:**

- Interface gráfica / Dashboard
- Multi-tenant / multiusuário / SaaS
- Integração com MastraJS
- Integração com Shorts / TikTok / Reels
- Decisões manuais de conteúdo (apenas sugere; sistema decide)
- Moderação de conteúdo post-publication

> Existem funcionalidades que stakeholders podem assumir como parte do sistema, mas que na verdade pertencem a outro sistema ou estão fora do escopo?

---

## Restrições e Premissas

> Quais restrições técnicas, de negócio ou regulatórias influenciam as decisões de arquitetura? Quais premissas estão sendo assumidas como verdadeiras?

**Restrições:**

| Tipo | Descrição |
| --- | --- |
| Técnica | Tempo máximo de produção por vídeo: < 10 minutos |
| Técnica | Throughput: suportar 10+ vídeos/dia em produção |
| Técnica | Retry automático por step (3 tentativas) com persistência de estado |
| Técnica | API keys em variáveis de ambiente (segurança) |
| Técnica | Vídeo scenes com máximo de 2.5 segundos cada |
| Negócio | Learning loop opera de forma assíncrona (aguarda 48-72h por dados do YouTube) |
| Negócio | Cold start: usa configurações padrão até ter dados reais suficientes |
| Regulatória | Conteúdo deve ser livre de copyright (Pexels ou geração IA) |

<!-- APPEND:constraints -->

**Premissas:**

- O operador terá acesso à CLI/scripts e variáveis de ambiente configuradas.
- O canal do YouTube terá OAuth2 configurado para upload e analytics.
- O sistema terá acesso à internet para APIs externas.
- O cold start usará templates base e hooks genéricos até o learning loop ativar.
- O volume inicial será de 10+ vídeos/dia, sem necessidade de scale horizontal imediato.

> Se alguma premissa se provar falsa, quais decisões precisariam ser revisitadas?

- Sem acesso ao YouTube Analytics: o Learning Engine não poderá operar (sistema rodará em modo estático).
- Sem OAuth2: upload automático não funciona (requer intervenção manual).
- Volume > 10 vídeos/dia: pode ser necessário adicionar workers/queue.

---

## Diagrama de Contexto

> Represente visualmente os atores e sistemas externos que interagem com o sistema. Use o diagrama abaixo como ponto de partida (estilo C4 — nível de contexto).

> 📐 Diagrama: [system-context.mmd](../diagrams/context/system-context.mmd)
