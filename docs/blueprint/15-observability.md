# Observabilidade

> Se você não consegue observar, você não consegue operar. Defina como o sistema será monitorado.

---

## Logs

### Formato

Logs estruturados em JSON para facilitar indexação e busca.

```json
{
  "timestamp": "2026-03-30T10:00:00.000Z",
  "level": "INFO",
  "service": "mestra-ai",
  "step": "content.generateIdea",
  "pipeline_id": "uuid-1234",
  "message": "Idea generated successfully",
  "duration_ms": 1500,
  "context": {
    "niche": "dark",
    "source": "strategy"
  }
}
```

### Níveis de Log

| Nível   | Quando usar                                                                 |
|---------|-----------------------------------------------------------------------------|
| DEBUG   | Informações detalhadas para diagnóstico durante desenvolvimento             |
| INFO    | Eventos normais do sistema (startup, step processado, pipeline concluído)  |
| WARN    | Situações inesperadas que não impedem o funcionamento, mas merecem atenção  |
| ERROR   | Falhas que impactam uma operação específica mas não derrubam o sistema     |
| FATAL   | Falhas críticas que impedem o sistema de continuar (ex: banco indisponível) |

### Retenção

| Ambiente       | Tempo de retenção |
|----------------|-------------------|
| Produção       | 30 dias (arquivos locais) |
| Staging        | 7 dias |
| Desenvolvimento| 1 dia |

### Eventos Críticos

- Início e fim de cada pipeline
- Falha em qualquer step (ERROR)
- Retry de step
- Upload bem-sucedido para YouTube
- Coleta de métricas
- Execução de learning loop

---

## Métricas

Baseado nos **Golden Signals** do Google SRE:

| Métrica    | Descrição                                                        | Threshold de Alerta         |
|------------|------------------------------------------------------------------|-----------------------------|
| Latência (p95) | Tempo por step e total do pipeline | > 10 min por vídeo |
| Tráfego    | Vídeos processados por dia                                     | < 5 vídeos/dia (baixo) |
| Erros      | Taxa de falha de pipeline                                      | > 5% |
| Saturação  | Uso de CPU/memória do servidor                                  | > 80% |

### Métricas Customizadas

| Métrica                  | Descrição                        | Threshold de Alerta              |
|--------------------------|----------------------------------|----------------------------------|
| pipeline_duration_ms     | Tempo total do pipeline          | > 600000ms (10 min)            |
| step_duration_ms        | Tempo por step                   | Variável por step               |
| retry_count             | Total de retries por pipeline    | > 5 retries                     |
| videos_per_day          | Vídeos publicados por dia        | < 10 (baixo)                    |
| learning_active         | Se learning loop está ativo      | FALSE por > 7 dias              |
| api_rate_limit_hits     | Hits em rate limit por API       | > 10 hits/dia                   |

---

## Tracing Distribuído

> Como rastrear uma requisição que passa por múltiplos serviços?

Sistema monolítico com chamadas a APIs externas. Tracing pode ser simplificado.

- **Ferramenta utilizada:** Manual via logs (trace_id no PipelineContext)
- **Protocolo de propagação:** trace_id em contexto
- **Taxa de amostragem:** 100% (logs são estruturados por step)

### Convenções

| Campo         | Valor                    |
|---------------|--------------------------|
| service.name  | mestra-ai                |
| pipeline_id   | UUID do PipelineContext  |
| step_name     | Nome do step atual       |

### Futuro (se necessário)

- OpenTelemetry para instrumentação
- Jaeger ou Tempo para visualização

---

## Alertas

| Alerta                     | Severidade | Condição                                | Ação / Runbook                     |
|----------------------------|------------|------------------------------------------|------------------------------------|
| Pipeline falhou            | P1         | status = failed                         | Verificar logs, reexecutar         |
| Taxa de falha > 5%        | P2         | 5%+ pipelines falhando                   | Investigar causa raiz              |
| Tempo de pipeline > 15min | P2         | Duração > 15min                        | Verificar APIs, retry              |
| Vídeos/dia < 5           | P3         | Producción abaixo do esperado            | Verificar APIs, scheduling          |
| Rate limit hit             | P3         | API retorna 429                         | Retry automático                   |
| Learning inativo > 7 dias  | P4         | isActive = false por 7+ dias            | Verificar YouTube Analytics        |

### Severidades

| Severidade | Significado                                      | Tempo de resposta       |
|------------|--------------------------------------------------|-------------------------|
| P1         | Sistema fora do ar / falha completa              | 15 min                 |
| P2         | Funcionalidade crítica degradada                 | 1 hora                 |
| P3         | Funcionalidade secundária impactada              | 4 horas                |
| P4         | Problema menor, sem impacto imediato ao usuário  | Próximo dia útil       |

### Situações Críticas (acordar às 3h)

- Pipeline falhando 100% das vezes
- Banco de dados indisponível
- APIs externas indisponíveis (todas)

### Política de Escalação

| Etapa | Tempo após disparo | Responsável                | Canal de notificação      |
|-------|---------------------|----------------------------|---------------------------|
| 1     | 0 min              | Monitoramento (automático) | Logs / stdout            |
| 2     | 15 min             | Operador                   | Email / Slack            |
| 3     | 30 min             | Engenheiro de plantão      | Telefone                |

---

## Dashboards

| Nome do Dashboard        | Público-alvo               | Métricas incluídas                        |
|------------------------|----------------------------|-------------------------------------------|
| Pipeline Operacional   | Engenharia                 | pipelines/day, taxa de falha, duração, retries |
| APIs Externas         | Engenharia                 | rate limits, latência, erros por API      |
| Performance           | Produto / Gestão           | retenção, CTR, views (YouTube)            |
| Recursos              | Infraestrutura             | CPU, memória, disco, rede                 |

---

## Health Checks

Sistema CLI sem HTTP server. Health checks são substituídos por validações ao iniciar.

### Liveness

Verificado automaticamente ao iniciar o sistema:

- Processo Node.js ativo
- Variáveis de ambiente presentes
- Banco de dados acessível
- FFmpeg instalado

### Readiness

Verificado antes de cada pipeline:

- APIs externas disponíveis (teste de conexão)
- Espaço em disco suficiente
- Banco de dados respondendo

### Resposta ao Iniciar

```json
{
  "status": "ready",
  "checks": {
    "env_vars": "ok",
    "database": "ok",
    "ffmpeg": "ok",
    "api_keys": "ok"
  },
  "version": "1.0.0",
  "uptime": "1h 30m"
}
```

### Resposta de Erro

```json
{
  "status": "unhealthy",
  "error": "FFmpeg not found",
  "checks": {
    "env_vars": "ok",
    "database": "ok",
    "ffmpeg": "missing",
    "api_keys": "ok"
  }
}
```

---

## Runbooks

| Situação | Procedimento |
|----------|-------------|
| Pipeline falhou | Verificar logs → identificar step → retry ou corrigir |
| Rate limit hit | Aguardar backoff → retry automático |
| Banco indisponível | Verificar conexão → verificar credenciais |
| API externa falha | Retry com backoff → marcar pipeline pending |
| Vídeos/dia baixo | Verificar scheduling → verificar APIs |

---

## Ferramentas Sugeridas

| Categoria | Ferramenta | Justificativa |
|-----------|------------|---------------|
| Logs | stdout + arquivos locais | Simples, sem custo |
| Métricas | Prometheus + Grafana (futuro) | Padrão open source |
| Alerting | Alertmanager (futuro) | Integração Prometheus |
| Tracing | Logs estruturados | Suficiente para CLI |
