# Comunicação

> Mensagens são extensões do produto. Projete-as como features, não como afterthought.

Define todos os templates de mensagens enviadas ao usuário fora da interface — emails transacionais e de marketing, SMS (quando necessário) e WhatsApp (quando necessário). Documenta estratégia de canais, triggers, templates, variáveis e regras de envio.

---

## Estratégia de Comunicação

> Quais canais de comunicação o sistema utiliza? Qual a prioridade entre eles? Como funciona opt-in/opt-out?

| Aspecto | Definição |
| --- | --- |
| Canal primário | {{Email / WhatsApp / SMS}} |
| Canais secundários | {{Nenhum / SMS / WhatsApp}} |
| Prioridade de canais | {{Email > WhatsApp > SMS}} |
| Opt-in obrigatório | {{Sim — checkbox no cadastro / Sim — double opt-in por email / Não}} |
| Opt-out | {{Link de unsubscribe em todo email / Responder SAIR no SMS/WhatsApp}} |
| Frequência máxima | {{Máximo {{N}} emails/semana, {{N}} SMS/mês}} |
| Horário de envio | {{Seg-Sex, 9h-18h no fuso do usuário / Sem restrição}} |
| Provedor de email | {{SendGrid / AWS SES / Resend / Postmark / outro}} |
| Provedor de SMS | {{Twilio / AWS SNS / Vonage / não aplicável}} |
| Provedor de WhatsApp | {{Twilio / Meta Business API / não aplicável}} |

<!-- APPEND:estrategia-comunicacao -->

---

## Templates de Email

> Quais emails transacionais e de marketing o sistema envia? Para cada template, defina assunto, preheader, corpo, CTA e versão texto.

### Emails Transacionais

> Emails disparados automaticamente por ações do usuário ou do sistema.

#### {{Email: Boas-vindas}}

| Campo | Conteúdo |
| --- | --- |
| Trigger | {{Usuário completa cadastro}} |
| De | {{{{NomeProduto}} <noreply@{{dominio}}>}} |
| Assunto | {{Bem-vindo ao {{NomeProduto}}!}} |
| Preheader | {{Sua conta foi criada com sucesso}} |
| Corpo | {{Olá {{nome}}, sua conta foi criada. Clique no botão abaixo para começar.}} |
| CTA | {{Acessar minha conta}} |
| CTA URL | {{{{baseUrl}}/dashboard}} |
| Fallback texto | {{Olá {{nome}}, acesse sua conta em: {{baseUrl}}/dashboard}} |

<!-- APPEND:email-transacional-boas-vindas -->

#### {{Email: Confirmação de email}}

| Campo | Conteúdo |
| --- | --- |
| Trigger | {{Usuário se cadastra / altera email}} |
| De | {{{{NomeProduto}} <noreply@{{dominio}}>}} |
| Assunto | {{Confirme seu email}} |
| Preheader | {{Clique no link para verificar seu endereço}} |
| Corpo | {{Olá {{nome}}, confirme seu email clicando no botão abaixo. O link expira em {{expiracao}}.}} |
| CTA | {{Confirmar email}} |
| CTA URL | {{{{baseUrl}}/verify?token={{token}}}} |
| Fallback texto | {{Confirme seu email acessando: {{baseUrl}}/verify?token={{token}}}} |

<!-- APPEND:email-transacional-confirmacao -->

#### {{Email: Recuperação de senha}}

| Campo | Conteúdo |
| --- | --- |
| Trigger | {{Usuário solicita reset de senha}} |
| De | {{{{NomeProduto}} <noreply@{{dominio}}>}} |
| Assunto | {{Redefinir sua senha}} |
| Preheader | {{Você solicitou uma nova senha}} |
| Corpo | {{Olá {{nome}}, recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo. O link expira em {{expiracao}}. Se você não fez essa solicitação, ignore este email.}} |
| CTA | {{Redefinir senha}} |
| CTA URL | {{{{baseUrl}}/reset-password?token={{token}}}} |
| Fallback texto | {{Redefina sua senha em: {{baseUrl}}/reset-password?token={{token}}}} |

<!-- APPEND:email-transacional-senha -->

#### {{Email: Outro Transacional}}

| Campo | Conteúdo |
| --- | --- |
| Trigger | {{Evento que dispara o envio}} |
| De | {{{{NomeProduto}} <noreply@{{dominio}}>}} |
| Assunto | {{Assunto do email}} |
| Preheader | {{Texto de preheader}} |
| Corpo | {{Corpo do email}} |
| CTA | {{Texto do botão}} |
| CTA URL | {{URL de destino}} |
| Fallback texto | {{Versão texto puro}} |

<!-- APPEND:email-transacional -->

### Emails de Marketing / Lifecycle

> Emails enviados em campanhas, nurturing ou lifecycle (onboarding, reengajamento, etc.).

#### {{Email: Onboarding — Dia 1}}

| Campo | Conteúdo |
| --- | --- |
| Trigger | {{1 dia após cadastro}} |
| Segmento | {{Usuários que não completaram setup}} |
| De | {{{{NomePessoa}} do {{NomeProduto}} <{{email}}>}} |
| Assunto | {{Dica rápida para começar}} |
| Preheader | {{Complete seu perfil em 2 minutos}} |
| Corpo | {{Olá {{nome}}, vi que você criou sua conta ontem. Aqui vai uma dica rápida para tirar o máximo do {{NomeProduto}}...}} |
| CTA | {{Completar meu perfil}} |
| CTA URL | {{{{baseUrl}}/onboarding}} |

<!-- APPEND:email-marketing -->

---

## Templates de SMS

> O sistema envia SMS? Se sim, quais mensagens? Lembre-se: máximo 160 caracteres por segmento.

| Status | {{Ativo / Não aplicável}} |
| --- | --- |

> Se "Não aplicável", pule esta seção.

#### {{SMS: Verificação}}

| Campo | Conteúdo |
| --- | --- |
| Trigger | {{2FA / verificação de telefone}} |
| Mensagem | {{Seu código de verificação do {{NomeProduto}} é: {{codigo}}. Não compartilhe.}} |
| Caracteres | {{~70}} |
| Expiração | {{10 minutos}} |

<!-- APPEND:sms-verificacao -->

#### {{SMS: Outro}}

| Campo | Conteúdo |
| --- | --- |
| Trigger | {{Evento que dispara}} |
| Mensagem | {{Texto da mensagem (max 160 chars)}} |
| Caracteres | {{~N}} |

<!-- APPEND:sms -->

---

## Templates de WhatsApp

> O sistema envia mensagens via WhatsApp? Se sim, quais templates aprovados?

| Status | {{Ativo / Não aplicável}} |
| --- | --- |

> Se "Não aplicável", pule esta seção. Templates de WhatsApp precisam ser aprovados pela Meta antes do uso.

#### {{WhatsApp: Confirmação de pedido}}

| Campo | Conteúdo |
| --- | --- |
| Categoria | {{Transactional / Marketing / Authentication}} |
| Trigger | {{Evento que dispara}} |
| Template name (Meta) | {{order_confirmation_v1}} |
| Idioma | {{pt_BR}} |
| Header | {{Pedido confirmado!}} |
| Corpo | {{Olá {{nome}}, seu pedido #{{pedido}} foi confirmado. Previsão de entrega: {{data}}.}} |
| Footer | {{{{NomeProduto}}}} |
| Botões | {{Ver pedido (URL: {{baseUrl}}/orders/{{pedido}})}} |

<!-- APPEND:whatsapp-template -->

#### {{WhatsApp: Outro}}

| Campo | Conteúdo |
| --- | --- |
| Categoria | {{Transactional / Marketing / Authentication}} |
| Trigger | {{Evento}} |
| Template name (Meta) | {{template_name}} |
| Idioma | {{pt_BR}} |
| Header | {{Texto ou imagem}} |
| Corpo | {{Corpo da mensagem com {{variaveis}}}} |
| Footer | {{Texto do footer}} |
| Botões | {{Texto (URL / Quick Reply)}} |

<!-- APPEND:whatsapp -->

---

## Variáveis e Personalização

> Quais variáveis dinâmicas estão disponíveis nos templates de comunicação?

| Variável | Descrição | Exemplo | Disponível em |
| --- | --- | --- | --- |
| {{nome}} | {{Nome do usuário}} | {{Maria}} | {{Email, SMS, WhatsApp}} |
| {{email}} | {{Email do usuário}} | {{maria@email.com}} | {{Email}} |
| {{NomeProduto}} | {{Nome do produto}} | {{MeuApp}} | {{Email, SMS, WhatsApp}} |
| {{baseUrl}} | {{URL base do produto}} | {{https://app.meuapp.com}} | {{Email, WhatsApp}} |
| {{token}} | {{Token de verificação/reset}} | {{abc123...}} | {{Email}} |
| {{codigo}} | {{Código OTP}} | {{482910}} | {{SMS}} |

<!-- APPEND:variaveis -->

---

## Regras de Envio

> Quais eventos disparam cada comunicação? Existem condições, cooldowns ou prioridades?

### Mapa de Triggers

| Evento | Canal | Template | Condição | Cooldown |
| --- | --- | --- | --- | --- |
| {{Usuário se cadastra}} | {{Email}} | {{Boas-vindas}} | {{Nenhuma}} | {{Único}} |
| {{Usuário solicita reset}} | {{Email}} | {{Recuperação de senha}} | {{Nenhuma}} | {{1 por hora}} |
| {{2FA ativado}} | {{SMS}} | {{Verificação}} | {{Telefone verificado}} | {{30 segundos}} |

<!-- APPEND:triggers -->

### Prioridade entre Canais

> Quando uma mensagem pode ser enviada por mais de um canal, qual a ordem de preferência?

| Prioridade | Canal | Condição de fallback |
| --- | --- | --- |
| 1 | {{Email}} | {{Sempre disponível}} |
| 2 | {{WhatsApp}} | {{Se usuário tem WhatsApp opt-in}} |
| 3 | {{SMS}} | {{Se WhatsApp indisponível e telefone verificado}} |

<!-- APPEND:prioridade-canais -->

### Rate Limits e Throttling

| Canal | Rate limit | Janela |
| --- | --- | --- |
| {{Email transacional}} | {{Sem limite}} | {{—}} |
| {{Email marketing}} | {{{{N}} por semana}} | {{7 dias}} |
| {{SMS}} | {{{{N}} por dia}} | {{24 horas}} |
| {{WhatsApp}} | {{{{N}} por dia}} | {{24 horas}} |

<!-- APPEND:rate-limits -->

---

## Convenções de Escrita por Canal

> Quais regras de tom de voz e formatação se aplicam a cada canal?

### Email

| Regra | Exemplo correto | Exemplo incorreto |
| --- | --- | --- |
| Use o nome do usuário no greeting | Olá Maria, | Prezado usuário, |
| Assunto com máximo {{60}} caracteres | Sua conta foi criada | Notificação importante sobre a criação da sua nova conta no sistema |
| Um CTA principal por email | [Acessar conta] | [Acessar conta] [Ver planos] [Ler blog] |
| Preheader complementa o assunto | Comece a usar agora | Sua conta foi criada |
| Inclua fallback texto para todo email | Acesse: https://... | (sem versão texto) |

<!-- APPEND:convencoes-email -->

### SMS

| Regra | Exemplo correto | Exemplo incorreto |
| --- | --- | --- |
| Máximo 160 caracteres | Seu código: 482910. Não compartilhe. | Olá! Informamos que o seu código de verificação para acessar sua conta é: 482910. Por favor não compartilhe. |
| Identifique o remetente | {{NomeProduto}}: Seu código... | Seu código é 482910 |
| Inclua instrução de opt-out quando exigido | Resp SAIR para cancelar | (sem opt-out) |

<!-- APPEND:convencoes-sms -->

### WhatsApp

| Regra | Exemplo correto | Exemplo incorreto |
| --- | --- | --- |
| Siga o template aprovado pela Meta | (template registrado) | (mensagem livre fora da janela de 24h) |
| Use botões para ações | [Ver pedido] (botão) | Acesse: https://... (link no texto) |
| Emojis com moderação | Pedido confirmado ✅ | 🎉🎊🥳 SEU PEDIDO FOI APROVADO!!! 🎉🎊🥳 |

<!-- APPEND:convencoes-whatsapp -->

---

## Histórico de Decisões

| Data | Decisão | Motivo |
| --- | --- | --- |
| {{YYYY-MM-DD}} | {{Decisão tomada}} | {{Por que foi decidido}} |

<!-- APPEND:decisoes-comunicacao -->
