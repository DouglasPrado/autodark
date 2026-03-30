# Services

Define todos os services do backend — metodos, parametros, retorno, dependencias e fluxos detalhados. Esta e a camada de orquestracao de logica de negocio.

---

## Convencoes de Services

> Quais regras se aplicam a todos os services?

- {{Services orquestram logica de negocio — NAO acessam banco diretamente}}
- {{Services recebem DTOs e retornam entidades de dominio ou DTOs de response}}
- {{Toda operacao critica e executada dentro de transacao}}
- {{Services emitem eventos de dominio apos operacoes bem-sucedidas}}
- {{Services nao conhecem HTTP — sem req/res, headers ou status codes}}

---

## Catalogo de Services

> Para cada service, documente responsabilidade, dependencias e metodos.

### {{NomeService}}

**Responsabilidade:** {{O que este service faz no sistema}}

**Nao faz:** {{O que este service NAO faz — delimite fronteiras}}

**Dependencias:**

| Dependencia | Tipo | Funcao |
| --- | --- | --- |
| {{NomeRepository}} | {{Repository}} | {{Acesso a dados da entidade}} |
| {{OutroService}} | {{Service}} | {{Funcao que usa do outro service}} |
| {{EventBus}} | {{Infrastructure}} | {{Emissao de eventos}} |
| {{CacheService}} | {{Infrastructure}} | {{Cache de consultas}} |

**Metodos:**

| Metodo | Parametros | Retorno | Descricao |
| --- | --- | --- | --- |
| {{create(dto)}} | {{CreateDTO}} | {{Entidade}} | {{Cria recurso, valida regras, emite evento}} |
| {{findById(id)}} | {{UUID}} | {{Entidade \| null}} | {{Busca por ID, verifica permissao}} |
| {{update(id, dto)}} | {{UUID, UpdateDTO}} | {{Entidade}} | {{Valida, atualiza, invalida cache}} |
| {{delete(id)}} | {{UUID}} | {{void}} | {{Verifica permissao, soft delete, emite evento}} |
| {{list(filters)}} | {{ListFiltersDTO}} | {{PaginatedResult}} | {{Aplica filtros, paginacao, ordenacao}} |

<!-- APPEND:services -->

---

## Fluxos Detalhados

> Para cada metodo critico, descreva o fluxo passo-a-passo.

### {{Service.metodo()}} — Fluxo Detalhado

```
1. Recebe {{DTO}}
2. Valida {{campos/regras}}
3. Chama {{Repository.metodo()}}
4. Se {{condicao}} → lanca {{ErroEspecifico}}
5. Executa {{logica de negocio}}
6. Chama {{Repository.save()}} — dentro de transacao
7. Emite evento {{NomeEvento}} via EventBus
8. Invalida cache {{chave}} (se aplicavel)
9. Retorna {{resultado}}
```

**Transacao:** {{Sim/Nao — quais operacoes estao dentro da transacao}}
**Idempotencia:** {{Como evitar duplicidade — ex: idempotency key, dedup por campo unico}}

<!-- APPEND:fluxos -->

<details>
<summary>Exemplo — UserService.register()</summary>

### UserService.register() — Fluxo Detalhado

```
1. Recebe CreateUserDTO { email, name, password }
2. Valida formato de email e forca da senha
3. Chama UserRepository.findByEmail(email)
4. Se usuario existe → lanca UserAlreadyExistsError
5. Hash da senha com bcrypt (salt rounds: 12)
6. Cria instancia User.create({ email, name, hashedPassword })
7. BEGIN TRANSACTION
8.   Chama UserRepository.save(user)
9. COMMIT
10. Emite evento UserCreated via EventBus
11. Enfileira job SendWelcomeEmail via queue
12. Retorna User criado (sem passwordHash)
```

**Transacao:** Sim — save esta dentro de transacao
**Idempotencia:** Email unico garante dedup natural

</details>

---

## Injecao de Dependencias

> Como os services recebem suas dependencias?

| Estrategia | Descricao |
| --- | --- |
| {{Constructor injection}} | {{Dependencias passadas via construtor}} |
| {{Container DI}} | {{Ex: tsyringe, inversify, Nest.js @Inject}} |
| {{Factory functions}} | {{Funcoes que montam o service com deps}} |

> (ver [07-controllers.md](07-controllers.md) para como controllers chamam os services)
