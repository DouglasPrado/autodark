# Modelo de Domínio

O modelo de domínio representa as entidades centrais do sistema, suas responsabilidades e como se relacionam entre si. Ele serve como a **linguagem compartilhada** entre equipe técnica e stakeholders, garantindo que todos falem o mesmo idioma ao discutir o produto.

> O modelo de domínio NÃO é o modelo de dados. Aqui focamos no **comportamento e nas regras de negócio**, não na estrutura de armazenamento.

---

## Glossário Ubíquo

> Quais termos do domínio precisam de definição clara para evitar ambiguidade?
> **Fonte unica de termos:** [docs/shared/glossary.md](../shared/glossary.md). Ao preencher esta secao, atualize tambem o glossario compartilhado.

| Termo | Definição |
|-------|-----------|
| {{termo_1}} | {{definição_1}} |
| {{termo_2}} | {{definição_2}} |
| {{termo_3}} | {{definição_3}} |

<!-- APPEND:glossary -->

---

## Entidades

> Quais são os conceitos centrais que o sistema precisa representar? Cada entidade deve ter identidade própria e ciclo de vida bem definido.

### {{nome_da_entidade}}

**Descrição:** {{descrição breve da entidade e seu papel no domínio}}

**Atributos:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|:-----------:|-----------|
| {{atributo_1}} | {{tipo}} | {{sim/não}} | {{descrição}} |
| {{atributo_2}} | {{tipo}} | {{sim/não}} | {{descrição}} |
| {{atributo_3}} | {{tipo}} | {{sim/não}} | {{descrição}} |

**Regras de Negócio:**

- {{regra_1 — ex.: "O nome deve ser único dentro do escopo X"}}
- {{regra_2 — ex.: "Não pode ser removido enquanto houver Y associado"}}
- {{regra_3}}

> Repita este bloco para cada entidade do domínio.

<!-- APPEND:entities -->

---

## Relacionamentos

> Como as entidades se conectam? Quais dependências existem entre elas? Existem relações de composição (parte-todo) ou apenas associação?

| Entidade A | Cardinalidade | Entidade B | Descrição do Relacionamento |
|------------|:-------------:|------------|----------------------------|
| {{entidade_a}} | {{1:N, N:M, 1:1}} | {{entidade_b}} | {{descrição}} |
| {{entidade_a}} | {{1:N, N:M, 1:1}} | {{entidade_b}} | {{descrição}} |

<!-- APPEND:relationships -->

---

## Diagrama de Domínio

> Atualize o diagrama abaixo conforme as entidades e relacionamentos definidos acima.

> 📐 Diagrama: [class-diagram.mmd](../diagrams/domain/class-diagram.mmd)

---

## Referências

- {{link ou documento de referência sobre o domínio}}
- {{material de apoio utilizado para modelagem}}
