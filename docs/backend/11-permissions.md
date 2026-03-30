# Permissões

> **N/A — Sistema mono-usuário (operador).**

O sistema **Mestra AI** é uma ferramenta CLI para um único operador. Não há sistema de autenticação ou permissões multi-usuário.

---

## Modelo de Autorização

| Aspecto | Decisão |
|---------|----------|
| Modelo | Nenhum (mono-usuário) |
| Autenticação | Variáveis de ambiente (API keys) |
| Acesso | Local ao operador |

---

## Configuração de Segurança

O sistema usa autenticação via variáveis de ambiente para APIs externas:

```bash
# .env
OPENROUTER_API_KEY=sk-...
ELEVENLABS_API_KEY=...
PEXELS_API_KEY=...
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REFRESH_TOKEN=...
```

> Ver [docs/blueprint/13-security.md](../blueprint/13-security.md) para detalhes de segurança.

---

> Ver [docs/blueprint/](../blueprint/) para documentação técnica completa.
