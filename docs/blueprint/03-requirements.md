# Requisitos

---

## Requisitos Funcionais

> O que o sistema precisa fazer para resolver o problema descrito na Visão?

Liste os requisitos funcionais na tabela abaixo. Use a escala MoSCoW para prioridade e atualize o status conforme o projeto avança.

| ID | Descrição | Prioridade | Status |
|----|-----------|------------|--------|
| **Content Engine** | | | |
| RF-001 | Gerar ideias automaticamente baseadas em nicho e diretivas da Strategy | Must | Proposto |
| RF-002 | Gerar roteiro estruturado via template (HOOK → SETUP → ESCALADA → TWIST → PAYOFF → LOOP) | Must | Proposto |
| RF-003 | Gerar múltiplas variantes de hook e selecionar a melhor | Must | Proposto |
| RF-004 | Otimizar roteiro para retenção com base em learning weights | Must | Proposto |
| **Scene Engine** | | | |
| RF-005 | Segmentar roteiro em cenas com duração e timestamps | Must | Proposto |
| RF-006 | Estimar duração por cena | Must | Proposto |
| RF-007 | Gerar visual queries por cena | Must | Proposto |
| **Voice Engine** | | | |
| RF-008 | Gerar voz por cena via TTS (ElevenLabs) | Must | Proposto |
| RF-009 | Aplicar perfil de voz | Must | Proposto |
| RF-010 | Concatenar segmentos de audio | Must | Proposto |
| **Visual Engine** | | | |
| RF-011 | Buscar clips/imagens no Pexels por query | Must | Proposto |
| RF-012 | Ranquear clips por relevância | Must | Proposto |
| RF-013 | Baixar assets visuais | Must | Proposto |
| **Pacing Engine** | | | |
| RF-014 | Aplicar max 2.5s por cena | Must | Proposto |
| RF-015 | Adicionar pattern interrupts | Must | Proposto |
| RF-016 | Aplicar zoom effects em momentos-chave | Must | Proposto |
| RF-017 | Adicionar micro-transitions entre cenas | Must | Proposto |
| **Rendering Engine** | | | |
| RF-018 | Renderizar cena individualmente (audio + visual + legenda) | Must | Proposto |
| RF-019 | Sincronizar audio e video por cena | Must | Proposto |
| RF-020 | Concatenar todas as cenas renderizadas | Must | Proposto |
| RF-021 | Gerar e embutir legendas | Must | Proposto |
| RF-022 | Adicionar música de fundo | Must | Proposto |
| **Thumbnail Engine** | | | |
| RF-023 | Gerar conceitos de thumbnail baseados na ideia | Must | Proposto |
| RF-024 | Gerar múltiplas imagens via IA (DALL-E/SDXL) | Must | Proposto |
| RF-025 | Compor thumbnail (Canvas: texto + overlay + gradiente) | Must | Proposto |
| RF-026 | Pontuar potencial de CTR | Must | Proposto |
| RF-027 | Selecionar melhor thumbnail | Must | Proposto |
| **Performance Engine** | | | |
| RF-028 | Coletar métricas via YouTube Analytics API | Must | Proposto |
| RF-029 | Gerar curva de retenção por segundo | Must | Proposto |
| RF-030 | Detectar pontos de abandono (drop-off) | Must | Proposto |
| RF-031 | Calcular score composto de performance | Must | Proposto |
| **Strategy Engine** | | | |
| RF-032 | Gerar plano de conteúdo baseado em performance | Must | Proposto |
| RF-033 | Clusterizar tópicos relacionados | Must | Proposto |
| RF-034 | Priorizar ideias por potencial | Must | Proposto |
| RF-035 | Criar séries temáticas | Must | Proposto |
| **Learning Engine** | | | |
| RF-036 | Analisar vídeos com baixa performance | Must | Proposto |
| RF-037 | Ajustar pesos dos prompts automaticamente | Must | Proposto |
| RF-038 | Otimizar templates de roteiro com base em dados reais | Must | Proposto |
| **Infraestrutura** | | | |
| RF-039 | Upload automático para YouTube (título, descrição, tags) | Must | Proposto |
| RF-040 | Retry automático por step (3 tentativas) | Must | Proposto |
| RF-041 | Persistir estado do pipeline | Must | Proposto |
| RF-042 | Logs estruturados por step | Must | Proposto |
| RF-043 | Executar voice e visuals em paralelo | Must | Proposto |
| RF-044 | Batch processing (10+ vídeos/dia) | Must | Proposto |

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
| **Performance** | Tempo máximo de produção por vídeo | Tempo total do pipeline | < 10 minutos |
| **Performance** | Throughput de produção | Vídeos por dia | 10+ vídeos/dia |
| **Performance** | Latência de renderização scene-based | Tempo por cena | < 5 segundos/cena |
| **Disponibilidade** | Taxa de falha do pipeline | % de falhas | < 5% |
| **Disponibilidade** | Retry automático | Tentativas por step | 3 tentativas |
| **Disponibilidade** | Recuperação de estado | Capacidade de resume | 100% |
| **Segurança** | Proteção de credenciais | Armazenamento | Variáveis de ambiente apenas |
| **Segurança** | Conteúdo livre de copyright | Fonte de assets | Pexels ou geração IA |
| **Escalabilidade** | Capacidade de batch | Vídeos simultâneos | 10+ vídeos/dia |
| **Manutenibilidade** | Cobertura de testes | % de cobertura | > 70% |
| **Manutenibilidade** | Complexidade de código | Cyclomatic complexity | Baixa (< 10 por função) |
| **Qualidade** | Duração máxima por cena | Segundos | ≤ 2.5 segundos |
| **Qualidade** | Estrutura de roteiro | Template obrigatório | HOOK→SETUP→ESCALADA→TWIST→PAYOFF→LOOP |
| **Qualidade** | Sincronização audio/video | Drift máximo | < 100ms |
| **Observabilidade** | Logs por step | Completude | 100% dos steps |
| **Observabilidade** | Tempo de execução | Granularidade | Por step |
| **Aprendizado** | Delay de métricas YouTube | Tempo | 48-72h (assíncrono) |
| **Aprendizado** | Cold start | Condição | Configurações padrão até dados suficientes |

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
| RF-001: Gerar ideias automáticas | 5 | 3 | 2 | **Alta** |
| RF-002: Gerar roteiro via template | 5 | 2 | 1 | **Alta** |
| RF-005: Segmentar em cenas | 5 | 2 | 2 | **Alta** |
| RF-008: Gerar voz TTS | 5 | 3 | 2 | **Alta** |
| RF-011: Buscar visuais Pexels | 5 | 3 | 2 | **Alta** |
| RF-014: Aplicar pacing | 5 | 3 | 3 | **Alta** |
| RF-018: Renderizar video | 5 | 4 | 3 | **Alta** |
| RF-039: Upload YouTube | 5 | 3 | 2 | **Alta** |
| RF-028: Coletar métricas YouTube | 5 | 3 | 2 | **Alta** |
| RF-036: Analisar performance | 4 | 4 | 3 | **Alta** |
| RF-040: Retry automático | 4 | 3 | 2 | **Média** |
| RF-041: Persistência de estado | 4 | 3 | 2 | **Média** |
| RF-044: Batch processing | 4 | 4 | 3 | **Média** |
| RF-003: Hook variants | 4 | 2 | 1 | **Média** |
| RF-023-027: Thumbnail Engine | 4 | 4 | 2 | **Média** |
| RF-032-035: Strategy Engine | 4 | 4 | 3 | **Média** |
| RF-042: Logs estruturados | 3 | 2 | 1 | **Média** |
| RF-043: Paralelismo | 3 | 3 | 2 | **Baixa** |
| RF-016-017: Zoom/Transitions | 3 | 3 | 2 | **Baixa** |
| RF-034: Priorizar ideias | 3 | 3 | 2 | **Baixa** |
| RF-035: Criar séries | 3 | 4 | 2 | **Baixa** |

> **Dica:** Requisitos com alto valor de negócio e baixo esforço técnico são os candidatos ideais para as primeiras entregas.
