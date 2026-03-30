# Eventos e Mensageria

Define eventos de dominio, filas, workers assincronos, schemas de payload e estrategias de retry.

> **Consumido por:** [docs/shared/event-mapping.md](../shared/event-mapping.md) (como o frontend reage a cada evento).

---

## Estrategia de Mensageria

> Qual tecnologia e padrao de mensageria o sistema usa?

| Aspecto | Decisao |
| --- | --- |
| {{Message Broker}} | {{BullMQ / RabbitMQ / Kafka / SQS}} |
| {{Padrao}} | {{Pub/Sub / Queue / Event Sourcing}} |
| {{Storage}} | {{Redis / RabbitMQ / Kafka cluster}} |
| {{Formato}} | {{JSON}} |
| {{Idempotencia}} | {{Por eventId + timestamp}} |

---

## Mapa de Eventos

> Quais eventos existem, quem produz e quem consome?

| Evento | Produtor | Consumidor(es) | Fila/Topico | Retry | DLQ |
| --- | --- | --- | --- | --- | --- |
| {{UserCreated}} | {{UserService}} | {{EmailWorker, AnalyticsWorker}} | {{user.events}} | {{3x, backoff 2^n}} | {{user.events.dlq}} |
| {{UserActivated}} | {{UserService}} | {{AnalyticsWorker}} | {{user.events}} | {{3x, backoff 2^n}} | {{user.events.dlq}} |
| {{UserEmailChanged}} | {{UserService}} | {{EmailWorker, AnalyticsWorker}} | {{user.events}} | {{3x, backoff 2^n}} | {{user.events.dlq}} |
| {{UserPasswordChanged}} | {{UserService}} | {{EmailWorker}} | {{user.events}} | {{3x, backoff 2^n}} | {{user.events.dlq}} |
| {{OrderPaid}} | {{PaymentService}} | {{OrderService, NotificationWorker}} | {{order.events}} | {{5x, backoff 2^n}} | {{order.events.dlq}} |
| {{OrderShipped}} | {{OrderService}} | {{NotificationWorker}} | {{order.events}} | {{5x, backoff 2^n}} | {{order.events.dlq}} |
| {{EmailRequested}} | {{NotificationService}} | {{EmailWorker}} | {{email.send}} | {{3x, linear 30s}} | {{email.send.dlq}} |

<!-- APPEND:eventos -->

---

## Schema de Eventos

> Para CADA evento, documente payload, versao e regra de idempotencia.

### {{NomeEvento}}

```json
{
  "eventId": "{{UUID — identificador unico do evento}}",
  "type": "{{NomeEvento}}",
  "version": "{{1.0}}",
  "timestamp": "{{ISO8601}}",
  "source": "{{nome-do-service}}",
  "payload": {
    "{{campo1}}": "{{tipo — descricao}}",
    "{{campo2}}": "{{tipo — descricao}}"
  }
}
```

**Idempotencia:** {{por eventId | por payload.campo + timestamp}}

<!-- APPEND:schemas -->

<details>
<summary>Exemplo — UserCreated</summary>

```json
{
  "eventId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "UserCreated",
  "version": "1.0",
  "timestamp": "2024-01-01T00:00:00Z",
  "source": "user-service",
  "payload": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "Joao Silva",
    "role": "user"
  }
}
```

**Idempotencia:** por userId + timestamp (nao processa se ja existe)

</details>

---

## Workers Assincronos

> Quais workers processam filas? Documente concorrencia, timeout e retry.

| Worker | Fila | Funcao | Concorrencia | Timeout | Retry | DLQ |
| --- | --- | --- | --- | --- | --- | --- |
| {{EmailWorker}} | {{email.send}} | {{Envia emails via provedor}} | {{5}} | {{30s}} | {{3x, backoff 30s}} | {{email.send.dlq}} |
| {{AnalyticsWorker}} | {{user.events}} | {{Processa eventos para analytics/metricas}} | {{3}} | {{30s}} | {{3x, backoff 2^n}} | {{analytics.dlq}} |
| {{NotificationWorker}} | {{order.events}} | {{Envia notificacoes (push, in-app) sobre pedidos}} | {{5}} | {{30s}} | {{3x, backoff 30s}} | {{notifications.dlq}} |
| {{ReportWorker}} | {{reports.generate}} | {{Gera relatorios PDF}} | {{2}} | {{120s}} | {{2x, backoff 60s}} | {{reports.dlq}} |
| {{WebhookWorker}} | {{webhooks.dispatch}} | {{Dispara webhooks}} | {{10}} | {{15s}} | {{5x, backoff exponencial}} | {{webhooks.dlq}} |

<!-- APPEND:workers -->

---

## Estrategia de Retry

> Como retries sao configurados?

| Estrategia | Descricao | Quando Usar |
| --- | --- | --- |
| {{Backoff exponencial}} | {{1s, 2s, 4s, 8s, 16s...}} | {{Servicos externos (Stripe, APIs)}} |
| {{Backoff linear}} | {{30s, 60s, 90s...}} | {{Email, notificacoes}} |
| {{Imediato}} | {{Retry sem delay}} | {{Erros transientes de banco}} |

**Dead Letter Queue:** Apos esgotar retries, o evento vai para DLQ. Um processo manual ou automatico revisa a DLQ periodicamente.

---

## Cron Jobs / Scheduled Tasks

> Existem tarefas agendadas?

| Job | Frequencia | Funcao | Timeout | Observacao |
| --- | --- | --- | --- | --- |
| {{CleanExpiredSessions}} | {{A cada 1h}} | {{Remove sessoes expiradas do Redis}} | {{60s}} | {{—}} |
| {{GenerateDailyReport}} | {{Diario 02:00}} | {{Gera relatorio de vendas}} | {{300s}} | {{Enfileira em reports.generate}} |
| {{RetryFailedPayments}} | {{A cada 30min}} | {{Reprocessa pagamentos falhados}} | {{120s}} | {{Max 3 tentativas por pagamento}} |

<!-- APPEND:cron -->

> (ver [13-integrations.md](13-integrations.md) para clients de APIs externas)
