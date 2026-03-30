# Validacao

Define as regras de validacao por campo, validacoes cross-field, schemas e mensagens de erro.

---

## Estrategia de Validacao

> Em quais camadas a validacao acontece?

| Camada | O que Valida | Ferramenta | Exemplo |
| --- | --- | --- | --- |
| {{Presentation}} | {{Formato de entrada (tipos, required, min/max)}} | {{Zod / Joi / class-validator}} | {{email e string valida}} |
| {{Application}} | {{Regras de negocio simples}} | {{Service logic}} | {{email unico no sistema}} |
| {{Domain}} | {{Invariantes da entidade}} | {{Metodos da entidade}} | {{status so transiciona conforme maquina}} |
| {{Infrastructure}} | {{Constraints do banco}} | {{ORM / DB constraints}} | {{UNIQUE, NOT NULL, FK}} |

---

## Regras por Entidade

> Para CADA campo que recebe input, documente tipo, regras e mensagem.

### {{NomeEntidade}}

| Campo | Tipo | Regras | Mensagem de Erro |
| --- | --- | --- | --- |
| {{email}} | {{string}} | {{required, email, max(255), unique}} | {{"Email invalido" / "Email ja cadastrado"}} |
| {{password}} | {{string}} | {{required, min(8), regex(1 maiusc + 1 num + 1 especial)}} | {{"Senha deve ter min 8 chars, 1 maiuscula, 1 numero"}} |
| {{name}} | {{string}} | {{required, min(2), max(100), trim}} | {{"Nome deve ter entre 2 e 100 caracteres"}} |
| {{phone}} | {{string}} | {{optional, regex(formato telefone)}} | {{"Telefone em formato invalido"}} |
| {{birthDate}} | {{date}} | {{optional, past, min age 13}} | {{"Data de nascimento invalida"}} |

<!-- APPEND:regras -->

<details>
<summary>Exemplo — Schema Zod para CreateUser</summary>

```typescript
const CreateUserSchema = z.object({
  email: z.string().email("Email invalido").max(255),
  name: z.string().min(2, "Nome muito curto").max(100, "Nome muito longo").trim(),
  password: z.string()
    .min(8, "Senha deve ter no minimo 8 caracteres")
    .regex(/[A-Z]/, "Senha deve ter ao menos 1 letra maiuscula")
    .regex(/[0-9]/, "Senha deve ter ao menos 1 numero"),
})
```

</details>

---

## Validacoes Cross-Field

> Quais validacoes dependem de multiplos campos?

| Regra | Campos | Logica | Mensagem |
| --- | --- | --- | --- |
| {{Datas coerentes}} | {{startDate, endDate}} | {{endDate > startDate}} | {{"Data final deve ser posterior a inicial"}} |
| {{Confirmacao de senha}} | {{password, confirmPassword}} | {{password === confirmPassword}} | {{"Senhas nao conferem"}} |
| {{Desconto valido}} | {{discount, total}} | {{discount <= total * 0.5}} | {{"Desconto nao pode exceder 50%"}} |

<!-- APPEND:cross-field -->

---

## Validacoes de Parametros de URL e Query

> Quais validacoes se aplicam a params e query strings?

| Parametro | Tipo | Regras | Mensagem |
| --- | --- | --- | --- |
| {{:id}} | {{string}} | {{UUID v4 valido}} | {{"ID invalido"}} |
| {{?page}} | {{number}} | {{integer, min(1), default(1)}} | {{"Pagina deve ser >= 1"}} |
| {{?limit}} | {{number}} | {{integer, min(1), max(100), default(20)}} | {{"Limite deve ser entre 1 e 100"}} |
| {{?sort}} | {{string}} | {{enum(created_at, name, email)}} | {{"Campo de ordenacao invalido"}} |
| {{?order}} | {{string}} | {{enum(asc, desc), default(desc)}} | {{"Ordem deve ser asc ou desc"}} |

---

## Sanitizacao

> Quais campos sao sanitizados antes de processar?

| Campo | Sanitizacao | Motivo |
| --- | --- | --- |
| {{email}} | {{lowercase, trim}} | {{Evitar duplicatas por case}} |
| {{name}} | {{trim, normalize whitespace}} | {{Remover espacos extras}} |
| {{HTML inputs}} | {{strip tags, escape}} | {{Prevenir XSS}} |
| {{URLs}} | {{validate protocol (https only)}} | {{Prevenir SSRF}} |

> (ver [11-permissions.md](11-permissions.md) para controle de acesso)
