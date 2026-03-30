# Requisitos

---

## Requisitos Funcionais

> O que o sistema precisa fazer para resolver o problema descrito na Visão?

Liste os requisitos funcionais na tabela abaixo. Use a escala MoSCoW para prioridade e atualize o status conforme o projeto avança.

| ID | Descrição | Prioridade | Status |
|----|-----------|------------|--------|
| RF-001 | {{Descrição do requisito funcional}} | Must | {{Proposto / Aprovado / Em desenvolvimento / Concluído}} |
| RF-002 | {{Descrição do requisito funcional}} | Should | {{Status}} |
| RF-003 | {{Descrição do requisito funcional}} | Could | {{Status}} |
| RF-004 | {{Descrição do requisito funcional}} | Won't | {{Status}} |

<!-- APPEND:functional-requirements -->

**Legenda de Prioridade (MoSCoW):**
- **Must** — obrigatório para o lançamento; sem ele o sistema não resolve o problema
- **Should** — importante, mas o sistema funciona sem ele no curto prazo
- **Could** — desejável se houver tempo e recurso disponível
- **Won't** — fora do escopo desta versão, mas documentado para o futuro

---

## Requisitos Não Funcionais

> Quais são os limites aceitáveis de performance, disponibilidade e segurança?

Defina os requisitos não funcionais com métricas objetivas e thresholds mensuráveis.

| Categoria | Requisito | Métrica | Threshold |
|-----------|-----------|---------|-----------|
| Performance | {{Ex: Tempo de resposta da API}} | {{Ex: Latência p95}} | {{Ex: < 200ms}} |
| Performance | {{Requisito}} | {{Métrica}} | {{Threshold}} |
| Disponibilidade | {{Ex: Uptime do sistema}} | {{Ex: SLA mensal}} | {{Ex: 99.9%}} |
| Disponibilidade | {{Requisito}} | {{Métrica}} | {{Threshold}} |
| Segurança | {{Ex: Proteção de dados sensíveis}} | {{Ex: Conformidade}} | {{Ex: LGPD / SOC 2}} |
| Segurança | {{Requisito}} | {{Métrica}} | {{Threshold}} |
| Escalabilidade | {{Ex: Crescimento de usuários}} | {{Ex: Requisições por segundo}} | {{Ex: 10.000 RPS}} |
| Manutenibilidade | {{Ex: Cobertura de testes}} | {{Ex: % de cobertura}} | {{Ex: > 80%}} |
| Usabilidade | {{Ex: Tempo para completar tarefa principal}} | {{Ex: Tempo médio}} | {{Ex: < 30 segundos}} |

<!-- APPEND:nonfunctional-requirements -->

**Categorias sugeridas:**
- **Performance** — latência, throughput, tempo de processamento
- **Disponibilidade** — uptime, RPO, RTO, tolerância a falhas
- **Segurança** — criptografia, autenticação, conformidade regulatória
- **Escalabilidade** — limites de carga, crescimento esperado, elasticidade
- **Manutenibilidade** — cobertura de testes, tempo de deploy, complexidade do código
- **Usabilidade** — acessibilidade, tempo de aprendizado, taxa de erro do usuário

---

## Matriz de Priorização

Use esta seção para resolver conflitos entre requisitos concorrentes.

**Como priorizar:**

1. **Classifique cada requisito** usando MoSCoW (funcionais) ou impacto vs. esforço (não funcionais)
2. **Identifique dependências** — requisitos que bloqueiam outros devem subir de prioridade
3. **Valide com stakeholders** — a priorização final deve refletir o valor de negócio, não apenas a viabilidade técnica
4. **Reavalie a cada ciclo** — prioridades mudam conforme o projeto avança e novas informações surgem

| Requisito | Valor de Negócio (1-5) | Esforço Técnico (1-5) | Risco (1-5) | Prioridade Final |
|-----------|------------------------|----------------------|-------------|-------------------|
| {{ID do requisito}} | {{1-5}} | {{1-5}} | {{1-5}} | {{Alta / Média / Baixa}} |
| {{ID do requisito}} | {{1-5}} | {{1-5}} | {{1-5}} | {{Alta / Média / Baixa}} |
| {{ID do requisito}} | {{1-5}} | {{1-5}} | {{1-5}} | {{Alta / Média / Baixa}} |

> Dica: Requisitos com alto valor de negócio e baixo esforço técnico são os candidatos ideais para as primeiras entregas.
