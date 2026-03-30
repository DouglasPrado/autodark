---
name: paper
description: Cria design visual no Paper (paper.design) a partir do frontend blueprint.
---

# Paper — Design Visual a partir do Blueprint

Cria paginas visuais no Paper (paper.design) usando as ferramentas MCP. Fluxo em 6 passos:

1. **Tokens** — cores, tipografia, espacamento, breakpoints no artboard Design System
2. **Planejamento de Telas** — mapa completo de paginas, componentes, acoes e ordem
3. **Componentes no DS** — todos os componentes (shadcn/ui) isolados com variantes
4. **Composicao de Paginas** — monta paginas usando componentes do DS
5. **Fluxos de Interacao** — artboards sequenciais representando estados antes/durante/depois
6. **Atualizacao do DS** — componentes nao previstos revelados durante composicao

**Escopo:** Apenas visual no Paper. NAO gera codigo.

---

## Regras Paper MCP (OBRIGATORIAS)

- Sempre chame `mcp__paper__get_font_family_info` antes de usar qualquer fonte
- Use `px` para font-size, `em` para letter-spacing
- Um grupo visual por `mcp__paper__write_html` (max ~15 linhas HTML)
- Screenshot OBRIGATORIO a cada 2-3 modificacoes via `mcp__paper__get_screenshot`
- Review Checkpoints apos cada screenshot: **Spacing, Typography, Contrast, Alignment, Clipping, Repetition**
- Apenas inline styles com `display: flex` para layout
- NAO use `display: grid`, margins, tabelas HTML
- NAO use emojis como icones — use SVG ou omita
- Sempre chame `mcp__paper__finish_working_on_nodes` ao finalizar cada artboard
- Conversao rem→px (base 16px): 2.25rem=36px, 1.5rem=24px, 1rem=16px, 0.875rem=14px
- **Posicionamento**: artboards de paginas LADO A LADO horizontalmente (mesma Y, X incrementando, gap 100px). DS a esquerda como primeiro artboard.
- **Referencia visual**: shadcn/ui para componentes, Tailwind CSS v4 para tokens. Consulte via Context7 MCP. Traduza classes Tailwind para inline styles no Paper.

---

## Passo 1: Verificar Ambiente Paper

1. `mcp__paper__get_basic_info` — confirmar conexao e artboards existentes
2. `mcp__paper__get_font_family_info` com fontes do blueprint (ex: `["Inter", "JetBrains Mono"]`). Se indisponivel, use fallback (`system-ui`/`monospace`)
3. Se artboards ja existem, perguntar: continuar adicionando ou comecar do zero?

---

## Passo 2: Ler Frontend Blueprint

| Documento | O que extrair |
|-----------|---------------|
| `docs/frontend/03-design-system.md` | Tokens: cores, tipografia, espacamento, breakpoints |
| `docs/frontend/04-components.md` | Hierarquia de componentes, variantes e props |
| `docs/frontend/07-routes.md` | Rotas, layouts, tipos (publica/protegida/admin) |
| `docs/frontend/08-flows.md` | Fluxos de UI e interacoes por pagina |
| `docs/frontend/05-state.md` | Estado gerenciado por pagina |
| `docs/frontend/14-copies.md` | Textos/copies por pagina (se disponiveis) |

> **Versoes:** Para tecnologias com versao, consulte via `mcp__context7__resolve-library-id` → `mcp__context7__query-docs`.

Monte conjuntos internos: **TOKENS** (cores, tipografia px, espacamento, breakpoints), **COMPONENTES** (primitivos/compostos com variantes shadcn/ui), **ROTAS** (layout, tipo, pagina), **FLUXOS** (por rota), **COPIES** (textos por pagina).

---

## Passo 3: Design System — Tokens

### 3.1: Design Brief

Apresentar resumo: cores (N tokens com hex), tipografia (family, weights), espacamento (grid 8px), breakpoints, artboard 1440x1200px, fundo #FFFFFF. Aguardar confirmacao.

### 3.2: Criar Artboard

`mcp__paper__create_artboard` — "Design System" 1440x1200px, flex column, padding 48px, gap 48px, fundo #FFFFFF. Guardar `DS_ID`.

### 3.3: Construir Tokens

Cada secao com `write_html` separados (um grupo visual por chamada):

**A) Header** — Titulo "Design System" (700/36px) + subtitulo com nome do projeto (400/16px). Screenshot.

**B) Paleta de Cores** — Titulo + 2 rows de swatches (80x80px cada: cor + hex + nome). Row 1: primary, secondary, background, surface. Row 2: text, error, warning, success. Screenshot → Review.

**C) Escala Tipografica** — Samples empilhados: Heading 1 (700/36px), Heading 2 (600/24px), Body (400/16px), Caption (400/14px), Code (mono 400/14px). Screenshot → Review.

**D) Espacamento** — Barras horizontais proporcionais (xs=4, sm=8, md=16, lg=24, xl=32, 2xl=48) com labels. Screenshot → Review.

**E) Breakpoints** — 4 indicadores: sm(640/Mobile), md(768/Tablet), lg(1024/Desktop), xl(1280/Wide). Screenshot.

### 3.4: Finalizar Tokens

`mcp__paper__finish_working_on_nodes` com DS_ID. Screenshot final. Resumo: N cores, N tipografia, N espacamento, N breakpoints.

---

## Passo 4: Planejamento de Telas

Planejar TODAS as telas antes de criar componentes ou paginas.

### 4.1: Mapear Componentes por Tela

Cruzar ROTAS + FLUXOS + COMPONENTES. Para cada rota: Layout (componentes), Componentes de pagina (primitivos/compostos), Componentes de feature (dominio), Estados (loading/empty/error/success), Acoes por componente (evento + destino/efeito).

### 4.2: Apresentar Plano

Tabela: #, Rota, Layout, Componentes de Layout, Componentes de Pagina, Estados. + Mapa de Acoes por Tela (Componente | Acao | Destino/Efeito). + Lista completa de componentes: Componente | Tipo | Variantes | Usado em. + Ordem sugerida de construcao. Aguardar aprovacao.

---

## Passo 5: Criar Componentes no Design System

TODOS os componentes antes de montar qualquer pagina.

### 5.1: Expandir Artboard

`mcp__paper__update_styles` — DS_ID com height "fit-content".

### 5.2: Titulo de Componentes

"Componentes" (700/36px) + "N componentes · N variantes" (400/14px). Screenshot.

### 5.3: Renderizar por Grupo

**A) Primitivos** — Para cada: nome (600/20px), "Usado em: rotas" (400/12px), variantes lado a lado com labels, estados (default/hover/disabled/error). Screenshot a cada 2-3 componentes → Review.

**B) Compostos** — Nome + descricao, "Usado em: rotas", renderizacao completa com primitivos reais. Screenshot a cada 2-3.

**C) Layout** — Nome, rotas que usam, renderizacao em miniatura mostrando estrutura. Screenshot.

**D) Feature** — Nome + dominio, rotas, renderizacao usando primitivos/compostos. Screenshot a cada 2-3.

### 5.4: Finalizar DS Completo

`mcp__paper__finish_working_on_nodes` com DS_ID. Screenshot final. Resumo: tokens + tabela Componente | Variantes | Usado em. Confirmar antes de compor paginas.

---

## Passo 6: Composicao de Paginas

Montar paginas USANDO componentes do DS. Visual identico ao DS.

### 6.1: Anunciar Pagina

Informar: pagina N/total, nome, rota, componentes DS que serao usados.

### 6.2: Design Brief da Pagina

Layout, artboard 1440x900, componentes (todos do DS), estados, conteudo (flows + copies), tokens. Tabela de acoes: Componente | Acao | Destino/Efeito. Aguardar confirmacao.

### 6.3: Criar Artboard

Posicionar ao lado do anterior: `X = DS_WIDTH + GAP + (pagina_index * (1440 + GAP))` (GAP=100). `mcp__paper__create_artboard` — "Page — {{rota}}" 1440x900.

### 6.4: Construir Incrementalmente

Ordem: 1) Shell do layout, 2) Navbar, 3) Sidebar, 4) Screenshot checkpoint, 5) Header da pagina, 6) Conteudo principal (1 grupo por `write_html`), 7) Screenshot a cada 2-3 writes, 8) Review completa. Use `mcp__paper__duplicate_nodes` para copiar componentes do DS.

### 6.5: Fluxos de Interacao

Para cada fluxo critico (baseado em `docs/frontend/08-flows.md`), criar artboards sequenciais:
1. **Estado inicial** (ja criado), 2. **Interacao ativa** (input focado, dropdown aberto), 3. **Feedback** (loading, toast, validacao), 4. **Estado final** (dados atualizados, redirect)

**Nomenclatura:** `Page — /login`, `Page — /login → Preenchendo form`, `Page — /login → Loading`, `Page — /login → Erro validacao`

**Posicionamento:** Gap 60px entre frames do mesmo fluxo, 100px entre paginas diferentes. Labels entre artboards descrevendo a acao (12px, cor secundaria).

**Obrigatorio:** Happy path + erro mais comum. **NAO simular:** navegacao simples (Link → outra rota) se destino ja existe.

### 6.6: Finalizar Pagina

`mcp__paper__finish_working_on_nodes` para todos os artboards. Screenshot final. Apresentar com resumo dos fluxos.

### 6.7: Componentes Nao Previstos

Se surgir componente nao planejado: informar usuario, adicionar ao DS como componente, screenshot DS, usar na pagina.

### 6.8: Proxima Pagina

Informar progresso N/total. Proxima na fila ou escolha do usuario. Voltar ao 6.1.

---

## Passo 7: Resumo Final

Tabela: Artboard | Rota | Tipo (DS/Pagina/Fluxo) | Dimensao. DS final: N cores, N tipografia, N espacamento, N breakpoints + N primitivos, N compostos, N layout, N feature. Paginas compostas: N/total. Fluxos: N frames (N happy paths + N erros). Paginas restantes (se houver). Para ajustar: selecionar elementos e descrever. Para mais paginas: `/paper`.
