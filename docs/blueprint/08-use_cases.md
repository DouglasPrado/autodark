# Casos de Uso

> Quais são as ações que os usuários podem realizar no sistema?

Documente aqui todos os casos de uso do sistema. Cada caso de uso descreve uma interação completa entre um ator e o sistema para atingir um objetivo específico.

## Quando usar Casos de Uso vs User Stories

| | Casos de Uso | User Stories |
|--|-------------|-------------|
| **Formato** | Estruturado, com fluxos detalhados passo a passo | Narrativo curto: "Como ___, quero ___, para ___" |
| **Nível de detalhe** | Alto — inclui fluxos alternativos e de exceção | Baixo — foco na intenção, não no "como" |
| **Melhor para** | Sistemas com regras de negócio complexas, integrações, contratos de API | Backlogs ágeis, priorização, comunicação rápida com stakeholders |
| **Recomendação** | Use quando precisar documentar o comportamento completo de uma funcionalidade | Use quando precisar capturar necessidades de forma rápida e iterativa |

> Na dúvida, comece com User Stories para capturar a intenção e evolua para Casos de Uso quando precisar detalhar o comportamento.

---

## Template

### UC-{{ID}}: {{Nome do Caso de Uso}}

**Ator:** {{Ator principal (ex: Usuário, Administrador, Sistema externo)}}

**Pré-condição:** {{O que deve ser verdadeiro antes do fluxo iniciar}}

#### Fluxo Principal

1. {{Ator}} {{realiza ação inicial}}
2. Sistema {{responde ou processa}}
3. {{Ator}} {{realiza próxima ação}}
4. Sistema {{confirma/exibe resultado}}

#### Fluxos Alternativos

- **2a.** {{Condição alternativa no passo 2}}: {{O que acontece de diferente}}
- **3a.** {{Condição alternativa no passo 3}}: {{O que acontece de diferente}}

#### Fluxo de Exceção

- **2b.** {{Condição de erro no passo 2}}: Sistema {{exibe mensagem de erro / registra log / interrompe fluxo}}
- **3b.** {{Condição de erro no passo 3}}: Sistema {{comportamento de erro}}

**Pós-condição:** {{O que deve ser verdadeiro após o fluxo ser concluído com sucesso}}

**Regras de Negócio:** {{RN-01}}, {{RN-02}}

---

## Exemplo 1

### UC-001: Cadastrar Novo Usuário

**Ator:** Visitante

**Pré-condição:** O visitante não possui conta no sistema.

#### Fluxo Principal

1. Visitante acessa a página de cadastro
2. Sistema exibe o formulário de registro
3. Visitante preenche nome, email e senha
4. Sistema valida os dados informados
5. Sistema cria a conta e envia email de confirmação
6. Sistema exibe mensagem de sucesso

#### Fluxos Alternativos

- **3a.** Visitante opta por cadastro via provedor externo (Google, GitHub): Sistema redireciona para autenticação OAuth e retorna ao passo 5
- **4a.** Email já cadastrado: Sistema informa que o email já está em uso e sugere recuperação de senha

#### Fluxo de Exceção

- **4b.** Dados inválidos (email mal formatado, senha fraca): Sistema exibe mensagens de validação e retorna ao passo 3
- **5b.** Falha no envio do email de confirmação: Sistema cria a conta, registra o erro e agenda reenvio automático

**Pós-condição:** Conta criada no sistema; email de confirmação enviado ao visitante.

**Regras de Negócio:** RN-01 (Senha mínima de 8 caracteres), RN-02 (Email deve ser único)

---

## Exemplo 2

### UC-002: Exportar Relatório

**Ator:** Administrador

**Pré-condição:** O administrador está autenticado e possui permissão de acesso aos relatórios.

#### Fluxo Principal

1. Administrador acessa a seção de relatórios
2. Sistema exibe os filtros disponíveis (período, tipo, status)
3. Administrador seleciona os filtros desejados e solicita a exportação
4. Sistema valida os filtros e inicia a geração do relatório
5. Sistema notifica o administrador quando o relatório estiver pronto
6. Administrador faz o download do arquivo

#### Fluxos Alternativos

- **3a.** Administrador solicita exportação sem aplicar filtros: Sistema gera relatório com dados do período padrão (últimos 30 dias)
- **4a.** Volume de dados muito grande: Sistema enfileira a geração e notifica por email quando concluir

#### Fluxo de Exceção

- **4b.** Filtros inválidos (data inicial maior que data final): Sistema exibe mensagem de erro e retorna ao passo 3
- **5b.** Falha na geração do relatório: Sistema registra o erro, notifica o administrador e sugere tentar novamente

**Pós-condição:** Arquivo de relatório gerado e disponível para download.

**Regras de Negócio:** RN-05 (Relatórios expiram após 7 dias), RN-06 (Limite de 10.000 registros por exportação)

---

## UC-{{ID}}: {{Próximo Caso de Uso}}

> Repita o template acima para cada caso de uso identificado.

**Ator:** {{...}}

**Pré-condição:** {{...}}

#### Fluxo Principal

1. {{...}}

#### Fluxos Alternativos

- **Na.** {{...}}

#### Fluxo de Exceção

- **Nb.** {{...}}

**Pós-condição:** {{...}}

**Regras de Negócio:** {{...}}

<!-- APPEND:use-cases -->
