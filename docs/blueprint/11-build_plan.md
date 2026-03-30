# Plano de Construção

> Como o sistema será construído? Defina entregas, prioridades e dependências.

Um bom plano de construção transforma o blueprint em ação. Ele organiza o projeto em **entregas independentes**, cada uma com valor mensurável, e explicita **dependências**, **riscos** e **critérios de aceite** para que a equipe saiba exatamente o que construir.

---

## Entregas (Deliverables)

> Comece pelo que reduz risco mais cedo. Priorize pelo valor e pelas dependências técnicas.

Repita a estrutura abaixo para cada entrega do projeto.

---

### {{ID}}: {{Nome da Entrega}}

**Objetivo:** {{Qual o propósito principal desta entrega? O que ela habilita?}}

**Prioridade:** {{Must | Should | Could}}

**Itens:**
- {{Item 1 — funcionalidade, serviço ou artefato concreto}}
- {{Item 2}}
- {{Item 3}}

**Dependências:**
- {{O que precisa estar pronto antes desta entrega? Ex.: "ENT-001 concluída", "Contrato com fornecedor assinado"}}

**Critérios de Aceite:**
- {{Condição verificável que comprova a conclusão. Ex.: "Usuário consegue criar conta e fazer login"}}
- {{Condição verificável}}

**Estimativa:** {{S | M | L | XL}}

> Referência para T-shirt sizing:
> - **S** — até 1 semana de trabalho
> - **M** — 1 a 3 semanas
> - **L** — 3 a 6 semanas
> - **XL** — mais de 6 semanas (considere quebrar em entregas menores)

---

## Priorização

> Comece pelo que reduz risco mais cedo. Entregas Must primeiro, depois Should e Could.

Ao definir a ordem das entregas, considere:

1. **Redução de risco** — O que pode invalidar a abordagem técnica? Construa isso primeiro.
2. **Valor para o usuário** — Entregue funcionalidades usáveis o mais cedo possível.
3. **Dependências técnicas** — Infraestrutura e autenticação geralmente vêm antes de funcionalidades de negócio.
4. **Feedback** — Entregas que permitem validação com usuários reais devem ser priorizadas.

| Entrega | Prioridade | Dependências | Justificativa |
|---------|-----------|--------------|---------------|
| {{ENT-001}} | {{Must / Should / Could}} | {{Nenhuma / ENT-XXX}} | {{Por que esta entrega está nesta posição}} |
| {{ENT-002}} | {{Must / Should / Could}} | {{Nenhuma / ENT-XXX}} | {{Por que esta entrega está nesta posição}} |
| {{ENT-003}} | {{Must / Should / Could}} | {{Nenhuma / ENT-XXX}} | {{Por que esta entrega está nesta posição}} |

---

## Riscos Técnicos

> Quais são os maiores riscos técnicos do projeto? Identifique-os cedo para poder mitigá-los.

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| {{Descrição do risco}} | {{Alto / Médio / Baixo}} | {{Alta / Média / Baixa}} | {{Ação para reduzir ou eliminar o risco}} |
| {{Descrição do risco}} | {{Alto / Médio / Baixo}} | {{Alta / Média / Baixa}} | {{Ação para reduzir ou eliminar o risco}} |
| {{Descrição do risco}} | {{Alto / Médio / Baixo}} | {{Alta / Média / Baixa}} | {{Ação para reduzir ou eliminar o risco}} |

<!-- APPEND:technical-risks -->

---

## Dependências Externas

> Quais equipes, sistemas ou fornecedores externos são necessários para o sucesso do projeto?

| Dependência | Tipo | Responsável | Status | Impacto se Atrasar |
|-------------|------|-------------|--------|---------------------|
| {{Sistema ou equipe externa}} | {{API / Serviço / Equipe / Fornecedor}} | {{Pessoa ou time responsável}} | {{Pendente / Em andamento / Resolvida}} | {{Descrição do impacto no cronograma}} |
| {{Sistema ou equipe externa}} | {{API / Serviço / Equipe / Fornecedor}} | {{Pessoa ou time responsável}} | {{Pendente / Em andamento / Resolvida}} | {{Descrição do impacto no cronograma}} |

<!-- APPEND:external-dependencies -->

> Agende alinhamentos regulares com as dependências externas de maior impacto. Não espere para descobrir atrasos.

---

## Exemplo: Plano para um MVP de E-commerce

### ENT-001: Fundação

**Objetivo:** Estabelecer infraestrutura base, autenticação e CI/CD.

**Prioridade:** Must

**Itens:**
- Setup do repositório com estrutura de pastas e linting
- Pipeline de CI/CD (build, testes, deploy em staging)
- Sistema de autenticação (registro, login, recuperação de senha)
- Banco de dados provisionado com migrações iniciais

**Dependências:**
- Nenhuma (entrega inicial)

**Critérios de Aceite:**
- Deploy automatizado funciona do push ao staging
- Usuário consegue criar conta, fazer login e recuperar senha

**Estimativa:** M

---

### ENT-002: Catálogo e Carrinho

**Objetivo:** Permitir que o usuário navegue por produtos e monte um carrinho de compras.

**Prioridade:** Must

**Itens:**
- CRUD de produtos (admin)
- Listagem e busca de produtos (cliente)
- Carrinho de compras com persistência

**Dependências:**
- ENT-001 concluída

**Critérios de Aceite:**
- Admin consegue cadastrar, editar e remover produtos
- Cliente consegue buscar produtos e adicionar ao carrinho

**Estimativa:** M

---

### ENT-003: Checkout e Pagamento

**Objetivo:** Fechar o ciclo de compra com integração de pagamento.

**Prioridade:** Must

**Itens:**
- Fluxo de checkout (endereço, frete, resumo)
- Integração com gateway de pagamento
- Notificações por e-mail (confirmação de pedido)

**Dependências:**
- ENT-002 concluída
- Contrato com gateway de pagamento assinado

**Critérios de Aceite:**
- Cliente consegue finalizar compra e receber confirmação por e-mail
- Pagamento é processado e status do pedido atualizado automaticamente

**Estimativa:** L

<!-- APPEND:deliverables -->
