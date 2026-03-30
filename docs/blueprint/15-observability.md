# Observabilidade

> Se você não consegue observar, você não consegue operar. Defina como o sistema será monitorado.

---

## Logs

### Formato

Recomenda-se o uso de **logs estruturados em JSON** para facilitar a indexação e busca em ferramentas de agregação.

```json
{
  "timestamp": "{{formato_timestamp}}",
  "level": "INFO",
  "service": "{{nome_do_servico}}",
  "trace_id": "{{trace_id}}",
  "message": "{{mensagem}}",
  "context": {
    "user_id": "{{user_id}}",
    "action": "{{acao}}"
  }
}
```

### Níveis de Log

| Nível   | Quando usar                                                                 |
|---------|-----------------------------------------------------------------------------|
| DEBUG   | Informações detalhadas para diagnóstico durante desenvolvimento             |
| INFO    | Eventos normais do sistema (startup, request processado, job concluído)     |
| WARN    | Situações inesperadas que não impedem o funcionamento, mas merecem atenção  |
| ERROR   | Falhas que impactam uma operação específica mas não derrubam o sistema      |
| FATAL   | Falhas críticas que impedem o sistema de continuar operando                 |

### Retenção

| Ambiente       | Tempo de retenção |
|----------------|-------------------|
| Produção       | {{retencao_prod}} |
| Staging        | {{retencao_staging}} |
| Desenvolvimento| {{retencao_dev}}  |

> Quais eventos críticos devem ser logados?

- {{evento_critico_1}}
- {{evento_critico_2}}
- {{evento_critico_3}}

---

## Métricas

Baseado nos **Golden Signals** do Google SRE:

| Métrica    | Descrição                                                        | Threshold de Alerta         |
|------------|------------------------------------------------------------------|-----------------------------|
| Latência   | Tempo de resposta das requisições (p50, p95, p99)                | {{threshold_latencia}}      |
| Tráfego    | Volume de requisições por segundo (RPS)                          | {{threshold_trafego}}       |
| Erros      | Taxa de respostas com falha (5xx, timeouts, exceções)            | {{threshold_erros}}         |
| Saturação  | Uso de recursos (CPU, memória, disco, conexões)                  | {{threshold_saturacao}}     |

Métricas adicionais do projeto:

| Métrica                  | Descrição                        | Threshold de Alerta              |
|--------------------------|----------------------------------|----------------------------------|
| {{metrica_custom_1}}     | {{descricao_metrica_1}}          | {{threshold_metrica_1}}          |
| {{metrica_custom_2}}     | {{descricao_metrica_2}}          | {{threshold_metrica_2}}          |

<!-- APPEND:metrics -->

> Quais métricas indicam que o sistema está saudável?

- {{indicador_saude_1}}
- {{indicador_saude_2}}
- {{indicador_saude_3}}

---

## Tracing Distribuído

> Como rastrear uma requisição que passa por múltiplos serviços?

O tracing distribuído permite acompanhar o ciclo de vida completo de uma requisição através de todos os serviços envolvidos.

- **Ferramenta utilizada:** {{ferramenta_tracing}}
- **Protocolo de propagação:** {{protocolo_propagacao}}
- **Taxa de amostragem (sampling):** {{taxa_amostragem}}

### Convenções de Spans

| Campo         | Valor                    |
|---------------|--------------------------|
| service.name  | {{convencao_nome}}       |
| Atributos obrigatórios | {{atributos_obrigatorios}} |
| Formato de Trace ID     | {{formato_trace_id}}      |

### Ferramentas sugeridas

- {{sugestao_ferramenta_tracing_1}}
- {{sugestao_ferramenta_tracing_2}}
- {{sugestao_ferramenta_tracing_3}}

---

## Alertas

| Alerta                     | Severidade | Condição                                | Ação / Runbook                     |
|----------------------------|------------|------------------------------------------|------------------------------------|
| {{alerta_1}}               | P1         | {{condicao_alerta_1}}                    | {{runbook_alerta_1}}               |
| {{alerta_2}}               | P2         | {{condicao_alerta_2}}                    | {{runbook_alerta_2}}               |
| {{alerta_3}}               | P3         | {{condicao_alerta_3}}                    | {{runbook_alerta_3}}               |
| {{alerta_4}}               | P4         | {{condicao_alerta_4}}                    | {{runbook_alerta_4}}               |

<!-- APPEND:alerts -->

### Severidades

| Severidade | Significado                                      | Tempo de resposta       |
|------------|--------------------------------------------------|-------------------------|
| P1         | Sistema fora do ar ou perda de dados              | {{sla_p1}}              |
| P2         | Funcionalidade crítica degradada                  | {{sla_p2}}              |
| P3         | Funcionalidade secundária impactada               | {{sla_p3}}              |
| P4         | Problema menor, sem impacto imediato ao usuário   | {{sla_p4}}              |

> Quais situações devem acordar alguém às 3h da manhã?

- {{situacao_critica_1}}
- {{situacao_critica_2}}
- {{situacao_critica_3}}

### Política de Escalação

| Etapa | Tempo após disparo | Responsável                | Canal de notificação      |
|-------|---------------------|----------------------------|---------------------------|
| 1     | {{tempo_etapa_1}}   | {{responsavel_etapa_1}}    | {{canal_etapa_1}}         |
| 2     | {{tempo_etapa_2}}   | {{responsavel_etapa_2}}    | {{canal_etapa_2}}         |
| 3     | {{tempo_etapa_3}}   | {{responsavel_etapa_3}}    | {{canal_etapa_3}}         |

---

## Dashboards

> Quais dashboards são necessários? Um operacional e um de negócio, no mínimo.

| Nome do Dashboard        | Público-alvo               | Métricas incluídas                        |
|--------------------------|----------------------------|-------------------------------------------|
| Operacional              | Engenharia / SRE           | {{metricas_dashboard_ops}}                |
| Negócio                  | Produto / Gestão           | {{metricas_dashboard_negocio}}            |
| {{dashboard_custom_1}}   | {{publico_custom_1}}       | {{metricas_dashboard_custom_1}}           |

<!-- APPEND:dashboards -->

---

## Health Checks

Endpoints para verificação de saúde do sistema:

### Liveness

Verifica se o processo está rodando e respondendo. Usado pelo orquestrador (ex: Kubernetes) para decidir se deve reiniciar o container.

- **Endpoint:** {{endpoint_liveness}}
- **Intervalo de verificação:** {{intervalo_liveness}}
- **O que verifica:** processo ativo, sem deadlock

### Readiness

Verifica se o serviço está pronto para receber tráfego. Usado para controlar se o serviço recebe requisições no load balancer.

- **Endpoint:** {{endpoint_readiness}}
- **Intervalo de verificação:** {{intervalo_readiness}}
- **Dependências verificadas:** {{dependencias_readiness}}

### Resposta esperada

```json
{
  "status": "healthy",
  "checks": {
    "database": "{{status_db}}",
    "cache": "{{status_cache}}",
    "external_api": "{{status_external}}"
  },
  "version": "{{versao_app}}",
  "uptime": "{{uptime}}"
}
```
