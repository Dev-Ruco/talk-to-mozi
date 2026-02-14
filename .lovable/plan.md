# Diagnostico end-to-end da Edge Function rss-fetch

## 1. Corrigir CORS na Edge Function

O ficheiro `supabase/functions/rss-fetch/index.ts` tem CORS incompleto. O SDK do Supabase envia headers adicionais que nao estao na whitelist actual.

**Actual (incompleto):**

```
"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
```

**Correcto (com headers do SDK):**

```
"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version"
```


| Ficheiro                                | Alteracao                                           |
| --------------------------------------- | --------------------------------------------------- |
| `supabase/functions/rss-fetch/index.ts` | Actualizar corsHeaders com headers completos do SDK |


## 2. Adicionar botao de diagnostico em SourcesPage

Adicionar um botao temporario "Debug rss-fetch" no topo da pagina `/admin/sources` que executa duas chamadas em paralelo:

- **Via SDK**: `supabase.functions.invoke("rss-fetch", { body: { dry_run: true } })`
- **Via fetch directo**: `fetch("https://cmxhvptjfezxjjrrlwgx.supabase.co/functions/v1/rss-fetch", ...)`

O resultado aparece num modal com:

- URL chamado
- Status code (do fetch directo)
- Resposta completa (JSON formatado)
- Diagnostico automatico baseado no status:
  - 404 = function nao deployada
  - 401/403 = problema de autenticacao
  - 400/415 = body ou headers errados
  - 500 = erro interno na function
  - 200 = tudo OK


| Ficheiro                          | Alteracao                                              |
| --------------------------------- | ------------------------------------------------------ |
| `src/admin/pages/SourcesPage.tsx` | Adicionar botao "Debug rss-fetch" + modal de resultado |


## 3. O que NAO muda

- `client.ts` -- ja esta correcto, nao se toca
- `.env` -- nao se usa para as chamadas (o client tem valores hardcoded)
- Nenhum outro ficheiro e alterado

## 4. Apos implementacao

Depois de aprovado e implementado:

1. Voce precisa de fazer deploy manual da function actualizada (com CORS corrigido) no projecto externo:
  ```
   supabase functions deploy rss-fetch --project-ref cmxhvptjfezxjjrrlwgx
  ```
2. Abrir `/admin/sources` e clicar "Debug rss-fetch"
3. O modal mostrara exactamente o status, URL e resposta -- prova real da conectividade  
  
Confirmar no Supabase externo que a function aparece em “Edge Functions” e está activa.
4. Se der **500**, ver os logs da function no projecto externo (não no Lovable Cloud).

## 5) Resultado esperado: quase certo, mas corrige esta frase

> “Se CORS bloqueia: o fetch directo falha mas o diagnostico indica a causa”

## Resultado esperado

- Se a function esta deployada em `cmxhv...`: modal mostra status 200 + dados JSON
- Se nao esta deployada: modal mostra 404 com diagnostico claro
- Se CORS bloqueia: o fetch directo falha mas o diagnostico indica a causa  
Recomendações finais (curtas)
  1. **CORS**: ou amplia a whitelist (como no plano) ou usa “echo” do `Access-Control-Request-Headers` no OPTIONS (mais robusto).
  2. **Debug modal**: inclui caso “sem status” e mostra `error.message` → é aí que apanhas CORS.
  3. **Deploy**: garante que estás a ver o projecto `cmxhv…` e não `kwwz…` quando checas logs.
  Se quiseres, posso reescrever este plano numa versão “pronta para colar no Lovable” com as melhorias acima, mantendo a mesma estrutura.