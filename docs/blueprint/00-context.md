# Contexto do Sistema

Esta seção estabelece a visão de alto nível do sistema: quem o utiliza, com quais sistemas externos ele se comunica, onde terminam suas responsabilidades e quais restrições moldam as decisões de arquitetura. Use-a como ponto de partida para alinhar stakeholders e equipe técnica sobre o escopo do projeto.

---

## Atores

> Quem interage com o sistema? Liste pessoas, sistemas e dispositivos.

| Ator | Tipo | Descrição |
| --- | --- | --- |
| {{Ator 1}} | {{Pessoa / Sistema / Dispositivo}} | {{Breve descrição do papel e motivação}} |
| {{Ator 2}} | {{Pessoa / Sistema / Dispositivo}} | {{Breve descrição do papel e motivação}} |
| {{Ator N}} | {{Pessoa / Sistema / Dispositivo}} | {{Breve descrição do papel e motivação}} |

<!-- APPEND:actors -->

---

## Sistemas Externos

> Com quais sistemas, serviços ou APIs externas o sistema precisa se integrar? Qual o propósito de cada integração?

| Sistema | Protocolo / Tipo de Integração | Função | Observações |
| --- | --- | --- | --- |
| {{Sistema Externo 1}} | {{REST API / Webhook / SMTP / SDK / etc.}} | {{Descrição da função que o sistema externo desempenha}} | {{Criticidade, SLA, limites de uso, etc.}} |
| {{Sistema Externo 2}} | {{REST API / Webhook / SMTP / SDK / etc.}} | {{Descrição da função que o sistema externo desempenha}} | {{Criticidade, SLA, limites de uso, etc.}} |
| {{Sistema Externo N}} | {{REST API / Webhook / SMTP / SDK / etc.}} | {{Descrição da função que o sistema externo desempenha}} | {{Criticidade, SLA, limites de uso, etc.}} |

<!-- APPEND:external-systems -->

---

## Limites do Sistema

> O que está dentro e fora do escopo deste sistema? Definir limites claros evita ambiguidades e retrabalho.

**O sistema É responsável por:**

- {{Responsabilidade 1}}
- {{Responsabilidade 2}}
- {{Responsabilidade N}}

> Quais são as capacidades essenciais que o sistema deve oferecer para cumprir seu propósito?

**O sistema NÃO é responsável por:**

- {{Exclusão 1}}
- {{Exclusão 2}}
- {{Exclusão N}}

> Existem funcionalidades que stakeholders podem assumir como parte do sistema, mas que na verdade pertencem a outro sistema ou estão fora do escopo?

---

## Restrições e Premissas

> Quais restrições técnicas, de negócio ou regulatórias influenciam as decisões de arquitetura? Quais premissas estão sendo assumidas como verdadeiras?

**Restrições:**

| Tipo | Descrição |
| --- | --- |
| {{Técnica / Negócio / Regulatória}} | {{Descrição da restrição}} |
| {{Técnica / Negócio / Regulatória}} | {{Descrição da restrição}} |

<!-- APPEND:constraints -->

**Premissas:**

- {{Premissa 1 — ex.: "O time terá acesso ao ambiente de staging até a data X."}}
- {{Premissa 2 — ex.: "O volume de usuários simultâneos não ultrapassará Y no primeiro ano."}}
- {{Premissa N}}

> Se alguma premissa se provar falsa, quais decisões precisariam ser revisitadas?

---

## Diagrama de Contexto

> Represente visualmente os atores e sistemas externos que interagem com o sistema. Use o diagrama abaixo como ponto de partida (estilo C4 — nível de contexto).

> 📐 Diagrama: [system-context.mmd](../diagrams/context/system-context.mmd)
