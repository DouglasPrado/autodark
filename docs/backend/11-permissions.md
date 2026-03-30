# Permissoes

Define roles, permissoes, matriz de acesso por recurso e regras de ownership.

---

## Modelo de Autorizacao

> Qual modelo de autorizacao o sistema usa?

| Aspecto | Decisao |
| --- | --- |
| {{Modelo}} | {{RBAC / ABAC / Hibrido}} |
| {{Metodo de autenticacao}} | {{JWT / Session / OAuth 2.0}} |
| {{Provedor}} | {{Auth0 / Cognito / Keycloak / Proprio}} |
| {{Onde verificar}} | {{Middleware de Authorization}} |
| {{Multi-tenancy}} | {{Sim/Nao — se sim, tenant_id em todo recurso}} |

---

## Roles

> Quais perfis de acesso existem?

| Role | Descricao | Herda de | Pode criar |
| --- | --- | --- | --- |
| {{admin}} | {{Acesso total ao sistema}} | {{—}} | {{Tudo}} |
| {{manager}} | {{Gerencia equipe e recursos do time}} | {{user}} | {{Usuarios, recursos do time}} |
| {{user}} | {{Acesso aos proprios dados}} | {{viewer}} | {{Proprio perfil, proprios recursos}} |
| {{viewer}} | {{Somente leitura}} | {{—}} | {{Nada}} |

<!-- APPEND:roles -->

---

## Matriz de Permissoes por Recurso

> Quem pode fazer o que em cada recurso?

### {{Recurso}} (ex: Users)

| Acao | admin | manager | user | viewer | Regra Especial |
| --- | --- | --- | --- | --- | --- |
| {{GET /recurso (listar)}} | {{todos}} | {{proprio time}} | {{proprio}} | {{—}} | {{manager filtra por team_id}} |
| {{GET /recurso/:id}} | {{todos}} | {{proprio time}} | {{proprio}} | {{proprio}} | {{user/viewer so ve si mesmo}} |
| {{POST /recurso}} | {{sim}} | {{sim}} | {{nao}} | {{nao}} | {{—}} |
| {{PATCH /recurso/:id}} | {{sim}} | {{proprio time}} | {{proprio}} | {{nao}} | {{user so edita a si mesmo}} |
| {{DELETE /recurso/:id}} | {{sim}} | {{nao}} | {{nao}} | {{nao}} | {{Soft delete}} |

<!-- APPEND:matriz -->

---

## Regras de Ownership

> Quais recursos pertencem a um usuario/time e como o acesso e controlado?

| Recurso | Owner Field | Regra |
| --- | --- | --- |
| {{User}} | {{id}} | {{Cada user so acessa/edita a si mesmo (exceto admin)}} |
| {{Order}} | {{userId}} | {{Cada user so ve seus pedidos (exceto admin/manager)}} |
| {{Team}} | {{managerId}} | {{Manager acessa dados do time, membros acessam proprio}} |

---

## Campos Visiveis por Role

> Existem campos que so determinados roles podem ver?

| Entidade | Campo | admin | manager | user | viewer |
| --- | --- | --- | --- | --- | --- |
| {{User}} | {{email}} | {{sim}} | {{sim (time)}} | {{proprio}} | {{nao}} |
| {{User}} | {{role}} | {{sim}} | {{sim}} | {{sim}} | {{sim}} |
| {{User}} | {{lastLoginAt}} | {{sim}} | {{sim (time)}} | {{proprio}} | {{nao}} |
| {{Order}} | {{internalNotes}} | {{sim}} | {{sim}} | {{nao}} | {{nao}} |

<!-- APPEND:campos-visiveis -->

---

## Token e Claims

> Quais informacoes o token JWT carrega?

```json
{
  "sub": "{{userId}}",
  "email": "{{email}}",
  "role": "{{role}}",
  "teamId": "{{teamId (se aplicavel)}}",
  "iat": {{issued_at}},
  "exp": {{expiration}},
  "iss": "{{issuer}}"
}
```

| Tipo de Token | Expiracao | Uso |
| --- | --- | --- |
| {{Access Token}} | {{15 min}} | {{Header Authorization em cada request}} |
| {{Refresh Token}} | {{7 dias}} | {{POST /auth/refresh para renovar access}} |

> (ver [12-events.md](12-events.md) para eventos e mensageria)
