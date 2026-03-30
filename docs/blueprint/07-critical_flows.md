# Fluxos Críticos

> Documente os 3 a 5 fluxos mais importantes do sistema. Estes são os caminhos que, se falharem, impactam diretamente o valor entregue.

Para cada fluxo crítico, utilize o template abaixo. O objetivo é garantir que qualquer pessoa da equipe consiga entender o caminho completo, os pontos de falha e as expectativas de performance.

---

## Fluxo: {{Nome do Fluxo}}

**Descrição:** {{Descreva em 1-2 frases o que este fluxo realiza e por que ele é crítico para o sistema.}}

**Atores envolvidos:** {{Ator 1}}, {{Ator 2}}, {{Serviço externo (se aplicável)}}

### Passos

1. {{Ator}} {{realiza ação inicial}}
2. {{Componente 1}} {{processa/valida a requisição}}
3. {{Componente 1}} {{envia dados para Componente 2}}
4. {{Componente 2}} {{executa operação principal}}
5. {{Componente 2}} {{retorna resultado para Componente 1}}
6. {{Componente 1}} {{entrega resultado final ao Ator}}

### Diagrama de Sequência

> 📐 Diagrama template: [template-flow.mmd](../diagrams/sequences/template-flow.mmd)

### Tratamento de Erros

| Passo | Falha possível | Comportamento esperado |
|-------|---------------|----------------------|
| {{Passo N}} | {{Descrição da falha}} | {{O que o sistema faz: retry, fallback, mensagem ao usuário, etc.}} |
| {{Passo N}} | {{Descrição da falha}} | {{Comportamento esperado}} |

### Requisitos de Performance

| Métrica | Valor esperado |
|---------|---------------|
| Latência total (p95) | {{ex: < 500ms}} |
| Latência total (p99) | {{ex: < 1s}} |
| Throughput mínimo | {{ex: 100 req/s}} |

---

## Exemplo: Autenticação de Usuário

**Descrição:** O usuário realiza login no sistema fornecendo suas credenciais. Este fluxo é crítico porque bloqueia o acesso a todas as funcionalidades caso falhe.

**Atores envolvidos:** Usuário, API Gateway, Serviço de Autenticação, Banco de Dados

### Passos

1. Usuário envia credenciais (email e senha) pela interface
2. API Gateway recebe a requisição e encaminha ao Serviço de Autenticação
3. Serviço de Autenticação valida o formato dos dados
4. Serviço de Autenticação consulta o Banco de Dados para verificar as credenciais
5. Banco de Dados retorna os dados do usuário
6. Serviço de Autenticação gera um token de acesso (JWT)
7. API Gateway retorna o token ao Usuário

### Diagrama de Sequência

> 📐 Diagrama exemplo: [auth-flow.mmd](../diagrams/sequences/auth-flow.mmd)

### Tratamento de Erros

| Passo | Falha possível | Comportamento esperado |
|-------|---------------|----------------------|
| 2 | API Gateway indisponível | Cliente exibe mensagem de erro e orienta a tentar novamente |
| 4 | Banco de Dados indisponível | Serviço de Autenticação retorna 503; API Gateway aplica circuit breaker |
| 4 | Credenciais inválidas | Retorna 401; incrementa contador de tentativas; bloqueia após 5 falhas |
| 6 | Falha na geração do token | Retorna 500; registra log de erro para investigação |

### Requisitos de Performance

| Métrica | Valor esperado |
|---------|---------------|
| Latência total (p95) | < 300ms |
| Latência total (p99) | < 800ms |
| Throughput mínimo | 200 req/s |

---

## Fluxo: {{Nome do Fluxo 2}}

> Repita o template acima para cada fluxo crítico identificado.

**Descrição:** {{...}}

**Atores envolvidos:** {{...}}

### Passos

1. {{...}}

### Diagrama de Sequência

> 📐 Duplique o template acima para cada fluxo crítico. Veja: [sequences/](../diagrams/sequences/)

### Tratamento de Erros

| Passo | Falha possível | Comportamento esperado |
|-------|---------------|----------------------|
| {{Passo N}} | {{Descrição da falha}} | {{Comportamento esperado}} |

### Requisitos de Performance

| Métrica | Valor esperado |
|---------|---------------|
| Latência total (p95) | {{valor}} |
| Latência total (p99) | {{valor}} |
| Throughput mínimo | {{valor}} |

<!-- APPEND:flows -->
