# Visao do Backend

Define a stack tecnologica, principios de design e objetivos do backend. Este documento e o ponto de partida para qualquer decisao de implementacao.

---

## Stack Tecnologica

> Quais tecnologias formam a fundacao do backend?

| Camada | Tecnologia | Versao | Justificativa |
| --- | --- | --- | --- |
| {{Linguagem}} | {{Ex: TypeScript}} | {{5.x}} | {{Tipagem estatica, ecossistema npm}} |
| {{Framework}} | {{Ex: Fastify}} | {{4.x}} | {{Performance, schema-based validation}} |
| {{ORM}} | {{Ex: Prisma}} | {{5.x}} | {{Type-safety, migrations, studio}} |
| {{Banco principal}} | {{Ex: PostgreSQL}} | {{16}} | {{ACID, JSONB, extensoes}} |
| {{Cache}} | {{Ex: Redis}} | {{7.x}} | {{Sessions, cache, rate limiting}} |
| {{Fila}} | {{Ex: BullMQ}} | {{5.x}} | {{Jobs assincronos, retry, backoff}} |
| {{Storage}} | {{Ex: S3}} | {{—}} | {{Arquivos, imagens, documentos}} |

<!-- APPEND:stack -->

---

## Padrao Arquitetural

> Qual padrao arquitetural o backend segue? Descreva as camadas e suas responsabilidades.

{{Descreva o padrao escolhido: monolito modular, microsservicos, clean architecture, hexagonal, etc. Inclua diagrama de camadas.}}

**Camadas:**

| Camada | Responsabilidade | Depende de | Nao depende de |
| --- | --- | --- | --- |
| {{Presentation}} | {{Receber HTTP, validar, responder}} | {{Application}} | {{Infrastructure}} |
| {{Application}} | {{Orquestrar logica de negocio}} | {{Domain}} | {{Presentation}} |
| {{Domain}} | {{Entidades, regras, eventos}} | {{Nada}} | {{Tudo externo}} |
| {{Infrastructure}} | {{Banco, cache, filas, APIs externas}} | {{Domain (interfaces)}} | {{Presentation}} |

<!-- APPEND:camadas -->

---

## Principios de Design

> Quais principios guiam as decisoes de implementacao do backend?

| Principio | Descricao | Implicacao Pratica |
| --- | --- | --- |
| {{Ex: Fail-fast}} | {{Erros devem ser detectados o mais cedo possivel}} | {{Validacao na borda, sem try-catch generico}} |
| {{Ex: Observabilidade}} | {{Todo comportamento deve ser rastreavel}} | {{Logs estruturados, traces em cada request}} |
| {{Ex: Idempotencia}} | {{Operacoes devem ser seguras para retry}} | {{Idempotency keys em POST, eventos com dedup}} |

<!-- APPEND:principios -->

---

## Objetivos e Metricas

> Quais resultados o backend deve atingir?

| Metrica | Meta | Como Medir |
| --- | --- | --- |
| {{Latencia p95}} | {{< 200ms}} | {{APM / Prometheus}} |
| {{Uptime}} | {{99.9%}} | {{Health checks / UptimeRobot}} |
| {{Taxa de erro}} | {{< 0.1%}} | {{Metricas de 5xx / total}} |
| {{Throughput}} | {{1000 RPS}} | {{Load test com k6}} |

<!-- APPEND:metricas -->

---

## Nao-objetivos

> O que o backend deliberadamente NAO faz nesta versao?

- {{Nao-objetivo 1 — ex: nao faz renderizacao de frontend (SSR)}}
- {{Nao-objetivo 2 — ex: nao implementa busca full-text (sera ElasticSearch futuro)}}
- {{Nao-objetivo 3 — ex: nao suporta multi-tenancy nesta fase}}

---

## Provedores e Infraestrutura

> Quais servicos de cloud e provedores externos o backend utiliza?

| Servico | Provedor | Funcao | Ambiente |
| --- | --- | --- | --- |
| {{Banco de dados}} | {{AWS RDS / Supabase / Neon}} | {{Dados transacionais}} | {{Dev, Staging, Prod}} |
| {{Cache}} | {{Redis Cloud / ElastiCache}} | {{Cache e sessoes}} | {{Staging, Prod}} |
| {{Object Storage}} | {{S3 / R2}} | {{Arquivos}} | {{Todos}} |
| {{Email}} | {{Resend / SES}} | {{Transacional}} | {{Prod}} |

<!-- APPEND:provedores -->

> (ver [01-architecture.md](01-architecture.md) para detalhes de deploy e infraestrutura)
