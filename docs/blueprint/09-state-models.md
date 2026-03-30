# Estados do Sistema

> Identifique entidades que possuem ciclo de vida — elas mudam de estado ao longo do tempo.

Muitos objetos do domínio não são estáticos: um pedido nasce como **rascunho**, passa por **confirmado**, **pago**, **enviado** e finalmente **entregue** (ou **cancelado**). Modelar esses estados de forma explícita evita inconsistências, facilita validações e torna o comportamento do sistema previsível.

Este documento cataloga todas as entidades com ciclo de vida, seus estados possíveis e as transições permitidas entre eles.

---

## Modelo de Estados

> Quais entidades mudam de estado? Pedidos, pagamentos, assinaturas, tarefas?

Repita a estrutura abaixo para cada entidade que possui ciclo de vida.

---

### {{Nome da Entidade}}

**Descrição:** {{Breve descrição da entidade e por que ela possui estados.}}

#### Estados Possíveis

| Estado | Descrição |
|--------|-----------|
| {{estado_1}} | {{Descrição do estado}} |
| {{estado_2}} | {{Descrição do estado}} |
| {{estado_3}} | {{Descrição do estado}} |

#### Transições

| De | Para | Gatilho | Condição |
|----|------|---------|----------|
| {{estado_1}} | {{estado_2}} | {{Ação ou evento que provoca a mudança}} | {{Regra que precisa ser verdadeira}} |
| {{estado_2}} | {{estado_3}} | {{Ação ou evento que provoca a mudança}} | {{Regra que precisa ser verdadeira}} |

> Existe alguma transição que deveria ser irreversível? Algum estado terminal do qual não se pode sair?

#### Diagrama

> 📐 Diagrama template: [state-template.mmd](../diagrams/domain/state-template.mmd)

---

## Exemplo: Ciclo de Vida de um Pedido

### Pedido (Order)

**Descrição:** Representa uma solicitação de compra feita pelo cliente, desde a criação até a conclusão ou cancelamento.

#### Estados Possíveis

| Estado | Descrição |
|--------|-----------|
| Rascunho | Pedido criado mas ainda não confirmado pelo cliente. |
| Confirmado | Cliente finalizou o pedido e aguarda pagamento. |
| Pago | Pagamento aprovado com sucesso. |
| Em Separação | Itens sendo preparados para envio. |
| Enviado | Pedido despachado para a transportadora. |
| Entregue | Cliente recebeu o pedido. Estado terminal. |
| Cancelado | Pedido cancelado antes do envio. Estado terminal. |

#### Transições

| De | Para | Gatilho | Condição |
|----|------|---------|----------|
| Rascunho | Confirmado | Cliente clica em "Finalizar Pedido" | Carrinho possui ao menos 1 item |
| Confirmado | Pago | Gateway de pagamento retorna aprovação | Pagamento aprovado |
| Confirmado | Cancelado | Cliente solicita cancelamento | Pedido ainda não foi pago |
| Pago | Em Separação | Equipe de estoque inicia preparação | Todos os itens disponíveis |
| Em Separação | Enviado | Código de rastreio gerado | Pacote entregue à transportadora |
| Enviado | Entregue | Transportadora confirma entrega | Confirmação de recebimento |
| Pago | Cancelado | Cliente solicita cancelamento com reembolso | Política de cancelamento permite |

#### Diagrama

> 📐 Duplique o template para cada entidade com ciclo de vida. Veja: [domain/](../diagrams/domain/)

<!-- APPEND:state-models -->
