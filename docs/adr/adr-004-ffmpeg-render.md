# ADR-004: FFmpeg como motor de renderização scene-based

**Data:** 2026-03-30

**Status:** Aceita

**Autores:** Douglas Prado

---

## Contexto

O sistema precisa renderizar vídeos a partir de cenas com áudio e visual. Cada cena tem no máximo 2.5 segundos. O rendering deve ser scene-based: cada cena é renderizada individualmente e depois concatenada.

---

## Drivers de Decisão

- **Controle granular** — FFmpeg oferece controle total sobre filtros, transições, legendas
- **Scene-based** — Cada cena precisa ter áudio e visual sincronizados
- **Custo** — FFmpeg é open source e gratuito
- **Maturidade** — Referência em processamento de vídeo

---

## Opções Consideradas

### Opção A: FFmpeg CLI

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Controle total; gratuito; amplamente documentado |
| Contras | Requer installation no servidor; CLI pode ser verbosa |
| Esforço | Médio |
| Risco | Baixo |

### Opção B: FFmpeg.wasm (browser)

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Executa no browser; sem servidor de render |
| Contras | Limitações de memória; não serve para vídeos longos |
| Esforço | Médio |
| Risco | Alto |

### Opção C: API de renderização (Cloudinary/Mux)

| Aspecto | Avaliação |
|---------|-----------|
| Prós | Gerenciado; escalável |
| Contras | Custo por minuto; menos controle sobre o resultado |
| Esforço | Baixo |
| Risco | Médio |

---

## Decisão

**Escolhemos a Opção A: FFmpeg CLI** porque oferece o controle necessário para scene-based rendering, é gratuito, e a equipe tem familiaridade. O modelo scene-based resolve o problema de sincronização audio/video.

---

## Consequências

### Positivas

- Controle total sobre rendering
- Scene-based resolve sincronização
- Sem custo adicional de API

### Negativas

- Servidor precisa ter FFmpeg instalado
- Renderização pode ser lenta para vídeos longos

### Riscos

- **FFmpeg não instalado no servidor** — Mitigação: incluir no setup/instalação
- **Vídeos muito longos** — Mitigação: chunking, render em partes

---

## Ações Necessárias

- [ ] Instalar FFmpeg no ambiente
- [ ] Implementar composeScene() com filtros
- [ ] Implementar stitchScenes() com concat demuxer

---

## Referências

- [Rendering Engine — PRD](../prd.md#67-rendering-engine)

---

## Histórico

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-03-30 | Douglas Prado | Criação |
