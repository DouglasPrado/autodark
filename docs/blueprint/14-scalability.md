# 14. Escalabilidade

> Como o sistema crescerá para atender mais usuários, mais dados e mais carga?

Este Documento descreve as estratégias, limites e planos para garantir que o sistema escale de forma sustentável conforme a demanda aumenta.

---

## 14.1 Estratégias de Escala

> Quais componentes precisam escalar independentemente?

### Escala Horizontal

| Aspecto | Detalhes |
|---|---|
| **Componentes elegíveis** | Workers de processamento de vídeo (separar rendering), Workers de coleta de métricas |
| **Mecanismo de balanceamento** | Não aplicável — pipeline é sequencial por vídeo |
| **Estado da sessão** | Stateless — PipelineContext é passado entre steps |
| **Auto-scaling** | Não aplicável na versão inicial — volume controlado (10+ vídeos/dia) |
| **Mínimo de instâncias** | 1 (servidor único) |
| **Máximo de instâncias** | Limitado pelo custo de APIs (OpenRouter, ElevenLabs) |

### Escala Vertical

| Aspecto | Detalhes |
|---|---|
| **Componentes elegíveis** | Servidor de rendering (FFmpeg é CPU-intensive) |
| **Configuração atual** | Mínimo: 4 vCPU, 8GB RAM |
| **Limite prático** | 16 vCPU para renderização paralela |
| **Janela de manutenção** | Qualquer horário (sem usuários online) |

### Caching

| Aspecto | Detalhes |
|---|---|
| **Tecnologia** | Disco local (assets), Banco (PipelineContext) |
| **Camadas de cache** | Assets (Pexels) baixados e reutilizados |
| **O que cachear** | Clips baixados, áudios gerados, templates de roteiro |
| **Estratégia de invalidação** | TTL de 30 dias para assets |
| **Tamanho estimado** | 1-5 GB/mês (vídeos + assets) |

### Particionamento / Sharding

| Aspecto | Detalhes |
|---|---|
| **Estratégia de particionamento** | Não aplicável — volume não justifica |
| **Chave de partição** | N/A |
| **Número de shards** | N/A |
| **Rebalanceamento** | N/A |
| **Consultas cross-shard** | N/A |

---

## 14.2 Limites Atuais

> Quais são os gargalos conhecidos do sistema?

| Componente | Limite Atual | Gargalo | Ação quando atingir |
|---|---|---|---|
| Vídeos/dia | 10+ | Tempo de renderização (CPU) | Renderização paralela em workers |
| Execuções simultâneas | 1 (por vídeo) | Recursos do servidor | Workers separados |
| Taxa de chamadas OpenRouter | 60 req/min (plano) | Rate limit da API | Retry com backoff |
| Taxa de chamadas ElevenLabs | 50 req/min | Rate limit da API | Retry com backoff |
| Upload YouTube | 6 uploads/dia | Limite do YouTube | Limite natural |
| Armazenamento local | Disco do servidor | Espaço em disco | Arquivar vídeos antigos |
| Conexões PostgreSQL | 100 | Limite de conexões | Connection pooling |

---

## 14.3 Plano de Capacidade

| Métrica | Atual | 6 meses | 12 meses | Ação necessária |
|---|---|---|---|---|
| Vídeos/dia | 10 | 20 | 50 | workers separados se >20/dia |
| Pipelines simultâneos | 1 | 2 | 5 | Auto-scaling de workers |
| Armazenamento (vídeos) | 1 GB/mês | 5 GB/mês | 25 GB/mês | Arquivar para S3/Google Drive |
| Armazenamento (assets) | 500 MB/mês | 2 GB/mês | 10 GB/mês | TTL de 30 dias |
| Métricas no banco | 300 reg/mês | 2K reg/mês | 10K reg/mês | Sem ação (banco suporta) |
| Tempo de renderização | <10 min | <10 min | <10 min | Otimizar FFmpeg se aumentar |

---

## 14.4 Diagrama de Deploy Escalado

> 📐 Diagrama: [production-scaled.mmd](../diagrams/deployment/production-scaled.mmd)

---

## 14.5 Estratégia de Cache

| O que cachear | TTL | Invalidação |
|---|---|---|
| Assets visuais (Pexels) | 30 dias | TTL automatico |
| Áudio gerado (ElevenLabs) | 7 dias | TTL automatico |
| Learning state | 1 dia | Ao executar learning loop |
| Content plan | 6 horas | Ao gerar novo |
| Configurações de nicho | 1 hora | Ao alterar config |

---

## 14.6 Rate Limiting e Throttling

### Objetivo

O sistema consome APIs externas com rate limits próprios. A estratégia é retry com backoff, não rate limiting interno.

### Limites das APIs Externas

| API | Limite | Ação ao exceder |
|---|---|---|
| OpenRouter | 60 req/min (plano básico) | Retry com backoff 1s, 2s, 4s |
| ElevenLabs | 50 req/min | Retry com backoff |
| YouTube Data API | 6 uploads/dia | Limite natural |
| YouTube Analytics | 50.000 queries/dia | Coleta a cada 6h |
| Pexels | 200 req/hora | Cache agressivo de results |

### Estratégia de Implementação

| Aspecto | Detalhes |
|---|---|
| **Algoritmo** | Exponential backoff |
| **Onde aplicar** | Cliente SDK de cada API |
| **Armazenamento de contadores** | Memória (simples) |
| **Tentativas** | 3 com backoff: 1s, 2s, 4s |

### Degradação Graciosa

1. **Nível 1 — Alerta**: Métricas de rate limit >80% — monitoramento ativado
2. **Nível 2 — Fallback**: API indisponível — usar alternativa (ex: DALL-E → Pexels)
3. **Nível 3 — Retry estendido**: Backoff estendido (até 30s)
4. **Nível 4 — Queue**: Se todas as APIs falharem — marcar pipeline como pending

---

## 14.7 Estratégia de Crescimento

### Fase 1 (0-6 meses): Operação Básica

- Servidor único com tudo
- 10-20 vídeos/dia
- Observabilidade básica (logs)

### Fase 2 (6-12 meses): Otimização

- Workers separados para rendering
- Cache de assets otimizado
- 20-50 vídeos/dia

### Fase 3 (12+ meses): Escala

- Múltiplos workers
- Renderização distribuída
- 50+ vídeos/dia
- Considerar Cloud Functions para rendering

---

## Referências

- [ADR-003: Pipeline Síncrono](docs/adr/adr-003-pipeline-sincrono.md)
- [ADR-004: FFmpeg](docs/adr/adr-004-ffmpeg-render.md)
- Limites de API: OpenRouter, ElevenLabs, YouTube
