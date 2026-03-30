# Controllers

Define todos os controllers do backend — metodos, rotas, entrada/saida, delegacao para services e formatacao de response.

---

## Convencoes de Controllers

> Quais regras se aplicam a todos os controllers?

- {{Controllers recebem HTTP requests e delegam para services}}
- {{Controllers NAO contem logica de negocio}}
- {{Controllers NAO acessam repositories diretamente}}
- {{Controllers sao responsaveis por: parse de parametros, chamar service, formatar response}}
- {{Cada controller mapeia para um recurso/dominio}}

---

## Catalogo de Controllers

> Para cada controller, documente responsabilidade, dependencias e metodos.

### {{NomeController}}

**Responsabilidade:** {{Qual recurso/dominio este controller gerencia}}

**Dependencias:** {{Services que consome}}

**Metodos:**

| Metodo | Rota | HTTP | Recebe | Chama | Response |
| --- | --- | --- | --- | --- | --- |
| {{create(req, res)}} | {{/recurso}} | {{POST}} | {{Body: CreateDTO}} | {{Service.create(dto)}} | {{201 + ResponseDTO}} |
| {{list(req, res)}} | {{/recurso}} | {{GET}} | {{Query: page, limit, filtros}} | {{Service.list(filters)}} | {{200 + PaginatedDTO}} |
| {{findById(req, res)}} | {{/recurso/:id}} | {{GET}} | {{Params: id}} | {{Service.findById(id)}} | {{200 + ResponseDTO}} |
| {{update(req, res)}} | {{/recurso/:id}} | {{PATCH}} | {{Params: id, Body: UpdateDTO}} | {{Service.update(id, dto)}} | {{200 + ResponseDTO}} |
| {{delete(req, res)}} | {{/recurso/:id}} | {{DELETE}} | {{Params: id}} | {{Service.delete(id)}} | {{204}} |

<!-- APPEND:controllers -->

<details>
<summary>Exemplo — UserController</summary>

### UserController

**Responsabilidade:** Gerencia endpoints de User (/api/v1/users)

**Dependencias:** UserService

**Metodos:**

| Metodo | Rota | HTTP | Recebe | Chama | Response |
| --- | --- | --- | --- | --- | --- |
| create(req, res) | /users | POST | Body: CreateUserDTO | UserService.register(dto) | 201 + UserResponseDTO |
| list(req, res) | /users | GET | Query: ListUsersQueryDTO | UserService.list(filters) | 200 + PaginatedResponse |
| findById(req, res) | /users/:id | GET | Params: id | UserService.findById(id) | 200 + UserResponseDTO |
| update(req, res) | /users/:id | PATCH | Params: id, Body: UpdateUserDTO | UserService.update(id, dto) | 200 + UserResponseDTO |
| delete(req, res) | /users/:id | DELETE | Params: id | UserService.softDelete(id) | 204 |

</details>

---

## Registro de Rotas

> Como as rotas sao registradas no framework?

```
// {{Exemplo de registro de rotas — adapte ao framework}}
router.post('/api/v1/users', authenticate, validate(CreateUserSchema), UserController.create)
router.get('/api/v1/users', authenticate, authorize('admin', 'manager'), UserController.list)
router.get('/api/v1/users/:id', authenticate, UserController.findById)
router.patch('/api/v1/users/:id', authenticate, authorizeOwner, validate(UpdateUserSchema), UserController.update)
router.delete('/api/v1/users/:id', authenticate, authorize('admin'), UserController.delete)
```

<!-- APPEND:rotas -->

---

## Serializers / Response Formatters

> Como responses sao formatadas antes de enviar ao cliente?

| Funcao | Entrada | Saida | Remove |
| --- | --- | --- | --- |
| {{toUserResponse(user)}} | {{User entity}} | {{UserResponseDTO}} | {{passwordHash, deletedAt}} |
| {{toPaginatedResponse(data, meta)}} | {{Array + meta}} | {{PaginatedResponseDTO}} | {{—}} |
| {{toErrorResponse(error)}} | {{AppError}} | {{ErrorResponseDTO}} | {{stack trace em prod}} |

<!-- APPEND:serializers -->

> (ver [08-middlewares.md](08-middlewares.md) para o pipeline que executa antes dos controllers)
