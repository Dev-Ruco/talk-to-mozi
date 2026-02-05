
# Auditoria Completa: Problemas de Acesso no CRM

Apos uma analise detalhada do codigo, base de dados e configuracao de autenticacao, identifiquei os seguintes problemas que impedem as paginas do dashboard de abrirem correctamente.

---

## Problema Principal Identificado

### O `AdminLayout` retorna `null` silenciosamente quando `isAuthenticated` e `false`

**Codigo actual em `AdminLayout.tsx` (linhas 35-37):**
```typescript
if (!isAuthenticated) {
  return null;  // <-- PROBLEMA: Nao mostra nada nem redireciona
}
```

**Como `isAuthenticated` e calculado em `useAdminAuth.ts` (linha 98):**
```typescript
isAuthenticated: !!session && !!role
```

**Isto significa que:**
1. Se o utilizador tem sessao mas NAO tem role na tabela `user_roles` → `isAuthenticated = false`
2. Se a sessao expirou → `isAuthenticated = false`
3. Resultado: A pagina aparece em branco ou fica a carregar infinitamente

---

## Problemas Secundarios

### 1. Timing Problem no `useEffect`

O `useEffect` em `AdminLayout` so redireciona UMA vez quando `isLoading` passa a `false`. Se houver um problema posterior, o utilizador fica preso.

### 2. Falta de Feedback Visual

Nao ha mensagem de erro quando:
- O utilizador nao tem role
- A sessao expirou
- A query ao `user_roles` falha

### 3. RLS Policy no `user_roles`

A policy `user_roles_select_own_or_admin` permite que um utilizador veja apenas o seu proprio role:
```sql
((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
```

Isto esta correcto, mas se a query falhar por outro motivo, o sistema falha silenciosamente.

---

## Estado Actual da Base de Dados

| Tabela | Registos |
|--------|----------|
| `articles` | 25 (todos em status `captured`) |
| `sources` | 5 fontes activas |
| `user_roles` | 1 admin registado |

**Nota:** Se o utilizador que reporta o problema nao e o admin registado, ele nao conseguira aceder.

---

## Plano de Correccoes

### Correccao 1: Melhorar o Tratamento de Erros no AdminLayout

Modificar `src/admin/components/layout/AdminLayout.tsx`:
- Adicionar estado de erro quando a autenticacao falha
- Mostrar mensagem amigavel em vez de pagina em branco
- Forcar redirect para login quando nao autenticado

**Antes:**
```typescript
if (!isAuthenticated) {
  return null;
}
```

**Depois:**
```typescript
if (!isAuthenticated) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Sessao expirada ou sem permissoes</p>
        <Button onClick={() => navigate('/admin/login')}>
          Iniciar sessao
        </Button>
      </div>
    </div>
  );
}
```

### Correccao 2: Melhorar o useAdminAuth com Debug

Modificar `src/admin/hooks/useAdminAuth.ts`:
- Adicionar logs de debug para identificar problemas
- Adicionar estado de erro explicito
- Retornar razao da falha de autenticacao

### Correccao 3: Adicionar Pagina de Forbidden

Criar componente para quando utilizador esta autenticado mas nao tem role adequado para a pagina.

### Correccao 4: Proteger Rotas Individuais

Cada pagina do pipeline deve verificar o role do utilizador e mostrar mensagem adequada se nao tiver acesso.

---

## Ficheiros a Modificar

```text
src/admin/components/layout/AdminLayout.tsx    # Melhorar fallback
src/admin/hooks/useAdminAuth.ts                # Adicionar debug e error state
src/admin/components/layout/ForbiddenPage.tsx  # NOVO - pagina de acesso negado
```

---

## Verificacoes Adicionais Recomendadas

1. **Verificar se o utilizador tem role:** Confirmar que existe registo na tabela `user_roles` para o email do utilizador
2. **Verificar sessao activa:** O token JWT pode ter expirado
3. **Verificar consola do browser:** Pode haver erros de RLS nao vistos

---

## Resumo Executivo

| Problema | Causa | Solucao |
|----------|-------|---------|
| Paginas em branco | `AdminLayout` retorna `null` | Mostrar feedback visual |
| Sem redirect | `useEffect` timing | Melhorar logica de redirect |
| Role nao detectado | Query pode falhar | Adicionar error handling |
| Sem feedback | Nao ha UI de erro | Criar pagina de erro/forbidden |

---

## Accoes Imediatas

1. Modificar `AdminLayout` para mostrar feedback quando autenticacao falha
2. Adicionar logs de debug no hook de autenticacao
3. Verificar se utilizador tem role atribuido na base de dados
4. Criar UI para estados de erro e acesso negado
