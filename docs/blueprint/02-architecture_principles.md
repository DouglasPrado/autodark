# Princípios Arquiteturais

Liste 3 a 7 princípios que guiam todas as decisões técnicas do sistema. Esses princípios funcionam como um filtro: quando houver dúvida entre duas abordagens, os princípios devem apontar o caminho.

> Se dois engenheiros discordarem sobre uma decisão técnica, quais princípios devem guiar a resolução?

---

## Modelo de Princípio

Copie o bloco abaixo para cada princípio e preencha os campos `{{...}}`.

```
### {{Nome do Princípio}}

**Descrição:** {{Explique o princípio em uma ou duas frases claras.}}

**Justificativa:** {{Por que esse princípio é importante para este sistema especificamente?}}

**Implicações:**
- {{Consequência prática 1 — o que muda no dia a dia do time}}
- {{Consequência prática 2}}
- {{Consequência prática 3}}
```

---

## Exemplos de Referência

Use os exemplos abaixo como inspiração. Substitua ou adapte conforme o contexto do seu projeto.

### Simplicidade sobre complexidade

**Descrição:** Prefira a solução mais simples que atenda ao requisito. Complexidade só é adicionada quando há evidência concreta de necessidade.

**Justificativa:** Sistemas simples são mais fáceis de entender, testar e manter. Complexidade acidental é a maior fonte de bugs e atrasos em projetos de software.

**Implicações:**
- Novas abstrações precisam de justificativa documentada
- Code reviews devem questionar complexidade desnecessária
- Bibliotecas externas só são adicionadas quando o custo de manter uma solução interna é comprovadamente maior

---

### Segurança por padrão

**Descrição:** Todo componente nasce seguro. Tornar algo menos seguro exige decisão explícita e documentada.

**Justificativa:** Corrigir falhas de segurança depois é mais caro e arriscado do que projetar com segurança desde o início.

**Implicações:**
- Criptografia obrigatória para dados em trânsito e em repouso
- Autenticação e autorização são pré-requisitos, não funcionalidades opcionais
- Dependências são auditadas antes de serem incorporadas

---

### Falhe rápido e explicitamente

**Descrição:** Quando algo dá errado, o sistema deve falhar imediatamente e com uma mensagem clara, em vez de continuar em estado inconsistente.

**Justificativa:** Falhas silenciosas são muito mais difíceis de diagnosticar e podem corromper dados ou causar efeitos colaterais inesperados.

**Implicações:**
- Validações acontecem na entrada, não no meio do processamento
- Erros são logados com contexto suficiente para reprodução
- Timeouts e circuit breakers são configurados em toda comunicação entre serviços

---

## Seus Princípios

### {{Nome do Princípio 1}}

**Descrição:** {{Descrição do princípio}}

**Justificativa:** {{Justificativa}}

**Implicações:**
- {{Implicação 1}}
- {{Implicação 2}}
- {{Implicação 3}}

---

### {{Nome do Princípio 2}}

**Descrição:** {{Descrição do princípio}}

**Justificativa:** {{Justificativa}}

**Implicações:**
- {{Implicação 1}}
- {{Implicação 2}}
- {{Implicação 3}}

---

### {{Nome do Princípio 3}}

**Descrição:** {{Descrição do princípio}}

**Justificativa:** {{Justificativa}}

**Implicações:**
- {{Implicação 1}}
- {{Implicação 2}}
- {{Implicação 3}}

<!-- APPEND:principles -->
