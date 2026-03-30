# Evolução

> Software é um organismo vivo. Planeje como ele vai evoluir.

---

## Roadmap Técnico

> Quais melhorias técnicas são planejadas para os próximos 3-6 meses?

| Item                     | Prioridade | Justificativa                          | Fase estimada         |
|--------------------------|------------|----------------------------------------|-----------------------|
| {{item_roadmap_1}}       | Alta       | {{justificativa_roadmap_1}}            | {{fase_roadmap_1}}    |
| {{item_roadmap_2}}       | Média      | {{justificativa_roadmap_2}}            | {{fase_roadmap_2}}    |
| {{item_roadmap_3}}       | Baixa      | {{justificativa_roadmap_3}}            | {{fase_roadmap_3}}    |

<!-- APPEND:technical-roadmap -->

---

## Débitos Técnicos

> Quais atalhos foram tomados que precisam ser corrigidos?

| Débito                     | Impacto                        | Esforço para resolver | Prioridade |
|----------------------------|--------------------------------|-----------------------|------------|
| {{debito_1}}               | {{impacto_debito_1}}           | {{esforco_debito_1}}  | Alta       |
| {{debito_2}}               | {{impacto_debito_2}}           | {{esforco_debito_2}}  | Média      |
| {{debito_3}}               | {{impacto_debito_3}}           | {{esforco_debito_3}}  | Baixa      |

<!-- APPEND:technical-debt -->

### Processo de Gestão de Débitos

- **Registro:** {{como_registrar_debitos}}
- **Revisão:** {{frequencia_revisao_debitos}}
- **Priorização:** {{criterio_priorizacao_debitos}}

---

## Estratégia de Versionamento

> Como versionar APIs e releases sem quebrar clientes existentes?

### Versionamento Semântico (SemVer)

O projeto segue o padrão **MAJOR.MINOR.PATCH**:

- **MAJOR** — mudanças incompatíveis com versões anteriores (breaking changes)
- **MINOR** — novas funcionalidades retrocompatíveis
- **PATCH** — correções de bugs retrocompatíveis

Versão atual: **{{versao_atual}}**

### Versionamento de APIs

- **Estratégia:** {{estrategia_versionamento_api}}
- **Formato da versão na URL/Header:** {{formato_versao_api}}
- **Versões ativas atualmente:** {{versoes_ativas_api}}
- **Política de suporte a versões anteriores:** {{politica_suporte_versoes}}

---

## Plano de Deprecação

Como retirar funcionalidades e APIs antigas de forma segura e previsível.

### Processo de Deprecação

1. **Anúncio** — comunicar a deprecação com antecedência mínima de {{antecedencia_deprecacao}}
2. **Período de transição** — manter ambas as versões funcionando por {{periodo_transicao}}
3. **Migração** — oferecer guia de migração e suporte
4. **Remoção** — remover a funcionalidade após o período de transição

### Itens em Deprecação

| Funcionalidade            | Data de deprecação       | Alternativa                     | Data de remoção          |
|---------------------------|--------------------------|---------------------------------|--------------------------|
| {{funcionalidade_dep_1}}  | {{data_deprecacao_1}}    | {{alternativa_dep_1}}           | {{data_remocao_1}}       |
| {{funcionalidade_dep_2}}  | {{data_deprecacao_2}}    | {{alternativa_dep_2}}           | {{data_remocao_2}}       |

<!-- APPEND:deprecations -->

---

## Critérios para Revisão do Blueprint

> Quando este blueprint deve ser revisado? A cada sprint? A cada quarter?

### Gatilhos de Revisão

Este documento deve ser revisado quando:

- {{gatilho_revisao_1}}
- {{gatilho_revisao_2}}
- {{gatilho_revisao_3}}
- Mudança significativa de arquitetura ou tecnologia
- Entrada de novos membros no time
- Incidentes que revelem lacunas na documentação

### Cadência de Revisão

- **Revisão completa:** {{cadencia_revisao_completa}}
- **Revisão parcial (seções críticas):** {{cadencia_revisao_parcial}}
- **Responsável pela revisão:** {{responsavel_revisao}}

### Histórico de Revisões

| Data               | Autor                | Seções alteradas             | Motivo                      |
|--------------------|----------------------|------------------------------|-----------------------------|
| {{data_revisao_1}} | {{autor_revisao_1}}  | {{secoes_alteradas_1}}       | {{motivo_revisao_1}}        |

<!-- APPEND:revision-history -->
