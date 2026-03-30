# Arquitetura do Sistema

## Introdução

Esta seção descreve a arquitetura de alto nível do sistema **{{Nome do Sistema}}**, incluindo seus componentes principais, como eles se comunicam e onde são implantados. O objetivo é fornecer uma visão clara da estrutura técnica para que qualquer membro da equipe consiga entender o funcionamento do sistema como um todo.

---

## Componentes

> Quais são os blocos principais do sistema? Cada componente deve ter uma responsabilidade clara.

### {{Componente 1}}

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | {{Nome do componente}}                         |
| **Responsabilidade** | {{Qual o papel deste componente no sistema?}} |
| **Tecnologia**   | {{Linguagem, framework, runtime}}              |
| **Interface**    | {{API REST, gRPC, eventos, fila, etc.}}        |

### {{Componente 2}}

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | {{Nome do componente}}                         |
| **Responsabilidade** | {{Qual o papel deste componente no sistema?}} |
| **Tecnologia**   | {{Linguagem, framework, runtime}}              |
| **Interface**    | {{API REST, gRPC, eventos, fila, etc.}}        |

### {{Componente 3}}

| Campo            | Descrição                                      |
| ---------------- | ---------------------------------------------- |
| **Nome**         | {{Nome do componente}}                         |
| **Responsabilidade** | {{Qual o papel deste componente no sistema?}} |
| **Tecnologia**   | {{Linguagem, framework, runtime}}              |
| **Interface**    | {{API REST, gRPC, eventos, fila, etc.}}        |

> Duplique o template acima para cada componente adicional do sistema.

<!-- APPEND:components -->

---

## Diagrama de Componentes

> 📐 Diagrama: [container-diagram.mmd](../diagrams/containers/container-diagram.mmd)
>
> Para componentes internos de cada container, veja: [api-components.mmd](../diagrams/components/api-components.mmd)
> Duplique o arquivo para cada container, renomeando para `{{container}}-components.mmd`.

> Ajuste o diagrama adicionando ou removendo nós conforme a quantidade real de componentes e sistemas externos.

---

## Comunicação

> Como os componentes se comunicam? REST, gRPC, mensageria, eventos?

| De                    | Para                  | Protocolo          | Tipo (sync/async) | Descrição                                      |
| --------------------- | --------------------- | ------------------ | ----------------- | ---------------------------------------------- |
| {{Componente 1}}      | {{Componente 2}}      | {{REST, gRPC, ...}} | {{sync/async}}   | {{Breve descrição do fluxo de comunicação}}    |
| {{Componente 2}}      | {{Componente 3}}      | {{REST, gRPC, ...}} | {{sync/async}}   | {{Breve descrição do fluxo de comunicação}}    |
| {{Sistema Externo}}   | {{Componente 1}}      | {{REST, gRPC, ...}} | {{sync/async}}   | {{Breve descrição do fluxo de comunicação}}    |

<!-- APPEND:communication -->

> Adicione uma linha para cada fluxo de comunicação relevante entre componentes ou sistemas externos.

---

## Infraestrutura e Deploy

> Onde e como o sistema será executado? Cloud, on-premise, containers?

### Ambientes

| Ambiente    | Finalidade                              | URL / Endpoint                  | Observações                          |
| ----------- | --------------------------------------- | ------------------------------- | ------------------------------------ |
| **Dev**     | {{Desenvolvimento e testes locais}}     | {{http://localhost:xxxx}}       | {{Detalhes do ambiente}}             |
| **Staging** | {{Validação antes de produção}}         | {{https://staging.exemplo.com}} | {{Detalhes do ambiente}}             |
| **Prod**    | {{Ambiente de produção}}                | {{https://app.exemplo.com}}     | {{Detalhes do ambiente}}             |

### Decisões de Infraestrutura

| Aspecto                | Escolha                                          |
| ---------------------- | ------------------------------------------------ |
| **Provedor Cloud**     | {{AWS, GCP, Azure, on-premise, ...}}             |
| **Orquestração**       | {{Kubernetes, ECS, Docker Compose, ...}}         |
| **CI/CD**              | {{GitHub Actions, GitLab CI, Jenkins, ...}}      |
| **Monitoramento**      | {{Datadog, Grafana, CloudWatch, ...}}            |
| **Banco de Dados**     | {{PostgreSQL, MongoDB, Redis, ...}}              |
| **Mensageria/Filas**   | {{RabbitMQ, Kafka, SQS, ...}}                   |

---

## Diagrama de Deploy

> 📐 Diagrama: [production.mmd](../diagrams/deployment/production.mmd)

> Ajuste o diagrama de deploy para refletir a topologia real do sistema, incluindo balanceadores de carga, bancos de dados, caches e filas de mensagens.
