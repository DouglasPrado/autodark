# 14. Escalabilidade

> Como o sistema crescerá para atender mais usuários, mais dados e mais carga?

Este documento descreve as estratégias, limites e planos para garantir que o sistema escale de forma sustentável conforme a demanda aumenta.

---

## 14.1 Estratégias de Escala

> Quais componentes precisam escalar independentemente?

### Escala Horizontal

Adicionar mais instâncias do mesmo serviço para distribuir a carga.

| Aspecto | Detalhes |
|---|---|
| **Componentes elegíveis** | {{listar serviços/componentes que podem ter múltiplas instâncias}} |
| **Mecanismo de balanceamento** | {{round-robin / least-connections / IP hash / outro}} |
| **Estado da sessão** | {{stateless / sticky sessions / sessão externalizada em cache}} |
| **Auto-scaling** | {{sim/não — regras: CPU > X%, memória > Y%, fila > Z mensagens}} |
| **Mínimo de instâncias** | {{número mínimo em produção}} |
| **Máximo de instâncias** | {{número máximo permitido}} |

### Escala Vertical

Aumentar os recursos (CPU, memória, disco) das máquinas existentes.

| Aspecto | Detalhes |
|---|---|
| **Componentes elegíveis** | {{listar componentes que se beneficiam de máquinas maiores}} |
| **Configuração atual** | {{tipo de instância / especificações atuais}} |
| **Limite prático** | {{maior configuração viável antes de precisar escalar horizontalmente}} |
| **Janela de manutenção** | {{quando o upgrade pode ser feito com menor impacto}} |

### Caching

Reduzir a carga em serviços e bancos de dados armazenando resultados frequentes.

| Aspecto | Detalhes |
|---|---|
| **Tecnologia** | {{Redis / Memcached / CDN / cache em memória / outro}} |
| **Camadas de cache** | {{CDN → API Gateway → aplicação → banco de dados}} |
| **O que cachear** | {{respostas de API, consultas pesadas, assets estáticos, sessões}} |
| **Estratégia de invalidação** | {{TTL / event-driven / write-through / write-behind}} |
| **Tamanho estimado** | {{volume de dados em cache}} |

### Particionamento / Sharding

Dividir os dados entre múltiplas instâncias de armazenamento.

| Aspecto | Detalhes |
|---|---|
| **Estratégia de particionamento** | {{por tenant / por região / por range de ID / hash}} |
| **Chave de partição** | {{campo ou critério usado para distribuir os dados}} |
| **Número de shards** | {{quantidade atual e planejada}} |
| **Rebalanceamento** | {{como redistribuir dados quando adicionar/remover shards}} |
| **Consultas cross-shard** | {{como lidar com queries que cruzam partições}} |

---

## 14.2 Limites Atuais

> Quais são os gargalos conhecidos do sistema?

| Componente | Limite Atual | Gargalo | Ação quando atingir |
|---|---|---|---|
| {{API / serviço X}} | {{ex: 500 req/s}} | {{CPU / memória / I/O / rede}} | {{escalar horizontalmente / otimizar queries / adicionar cache}} |
| {{Banco de dados}} | {{ex: 10k conexões simultâneas}} | {{conexões / disco / CPU}} | {{read replicas / connection pooling / sharding}} |
| {{Fila de mensagens}} | {{ex: 50k msg/s}} | {{throughput / armazenamento}} | {{adicionar partições / escalar consumers}} |
| {{Armazenamento}} | {{ex: 500 GB}} | {{espaço / IOPS}} | {{migrar para storage maior / arquivar dados antigos}} |
| {{Cache}} | {{ex: 16 GB de memória}} | {{memória / conexões}} | {{cluster de cache / ajustar TTL / eviction policy}} |

<!-- APPEND:capacity-limits -->

---

## 14.3 Plano de Capacidade

| Métrica | Atual | 6 meses | 12 meses | Ação necessária |
|---|---|---|---|---|
| Usuários ativos | {{número atual}} | {{projeção 6m}} | {{projeção 12m}} | {{descrever ação}} |
| Requisições/segundo | {{valor atual}} | {{projeção 6m}} | {{projeção 12m}} | {{descrever ação}} |
| Volume de dados | {{tamanho atual}} | {{projeção 6m}} | {{projeção 12m}} | {{descrever ação}} |
| Armazenamento de arquivos | {{tamanho atual}} | {{projeção 6m}} | {{projeção 12m}} | {{descrever ação}} |
| Conexões simultâneas | {{valor atual}} | {{projeção 6m}} | {{projeção 12m}} | {{descrever ação}} |
| Tempo médio de resposta | {{valor atual}} | {{meta 6m}} | {{meta 12m}} | {{descrever ação}} |

---

## 14.4 Diagrama de Deploy Escalado

> 📐 Diagrama: [production-scaled.mmd](../diagrams/deployment/production-scaled.mmd)

---

## 14.5 Estratégia de Cache

| O que cachear | TTL | Invalidação |
|---|---|---|
| {{respostas de listagem / consultas frequentes}} | {{ex: 5 min}} | {{ao criar/atualizar/deletar recurso}} |
| {{dados de configuração / feature flags}} | {{ex: 1 hora}} | {{ao alterar configuração}} |
| {{sessões de usuário}} | {{ex: 30 min}} | {{ao fazer logout / expiração}} |
| {{assets estáticos (imagens, CSS, JS)}} | {{ex: 30 dias}} | {{cache busting via hash no nome do arquivo}} |
| {{resultados de cálculos pesados}} | {{ex: 15 min}} | {{quando dados de entrada mudam}} |
| {{tokens / permissões}} | {{ex: 5 min}} | {{ao alterar permissões do usuário}} |

<!-- APPEND:cache-strategies -->

---

## 14.6 Rate Limiting e Throttling

### Objetivo

Proteger o sistema contra sobrecarga, uso abusivo e garantir disponibilidade justa para todos os consumidores.

### Configuração de Limites

| Endpoint / Recurso | Limite | Janela | Ação ao exceder |
|---|---|---|---|
| {{API pública — geral}} | {{ex: 100 req/min por IP}} | {{1 minuto}} | {{HTTP 429 + header Retry-After}} |
| {{Autenticação / login}} | {{ex: 5 tentativas/min}} | {{1 minuto}} | {{bloqueio temporário + alerta}} |
| {{Upload de arquivos}} | {{ex: 10 req/min por usuário}} | {{1 minuto}} | {{HTTP 429 + fila de espera}} |
| {{Webhooks / integrações}} | {{ex: 1000 req/min por tenant}} | {{1 minuto}} | {{throttle + notificação ao parceiro}} |

<!-- APPEND:rate-limits -->

### Estratégia de Implementação

| Aspecto | Detalhes |
|---|---|
| **Algoritmo** | {{token bucket / sliding window / fixed window / leaky bucket}} |
| **Onde aplicar** | {{API Gateway / middleware da aplicação / load balancer}} |
| **Armazenamento de contadores** | {{Redis / memória local / banco de dados}} |
| **Identificação do cliente** | {{IP / API key / token de usuário / tenant ID}} |
| **Headers de resposta** | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| **Tratamento de burst** | {{permitir burst de X req acima do limite por Y segundos}} |

### Degradação Graciosa

Quando o sistema se aproximar dos limites, aplicar degradação progressiva:

1. **Nível 1 — Alerta**: {{métricas acima de X% do limite — monitoramento ativado}}
2. **Nível 2 — Throttle**: {{reduzir funcionalidades não-críticas, ex: desabilitar relatórios pesados}}
3. **Nível 3 — Shedding**: {{rejeitar requisições de menor prioridade, manter apenas operações críticas}}
4. **Nível 4 — Circuit Breaker**: {{isolar serviços em falha para evitar cascata}}

---

## Referências

- {{link para dashboard de métricas de capacidade}}
- {{link para runbook de escalabilidade}}
- {{link para documentação da infraestrutura}}
