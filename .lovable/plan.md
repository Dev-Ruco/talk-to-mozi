# Corrigir edgeFunctions.ts para apontar ao Supabase externo

## Problema

O ficheiro `src/lib/edgeFunctions.ts` usa `import.meta.env.VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, que apontam para o projecto Lovable Cloud (`kwwz...`). As Edge Functions (como `rss-fetch`) estao deployadas no Supabase externo (`cmxh...`), logo as chamadas falham.

## Solucao

Substituir as variaveis de ambiente pelos valores hardcoded do Supabase externo -- exactamente os mesmos valores que ja estao em `src/integrations/supabase/client.ts`:

- URL: `https://cmxhvptjfezxjjrrlwgx.supabase.co`
- Anon Key: a mesma key ja presente em `client.ts`

## Ficheiro a modificar


| Ficheiro                   | Alteracao                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/edgeFunctions.ts` | Substituir `import.meta.env.VITE_SUPABASE_URL` e `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY` pelos valores do Supabase externo |


## Detalhe tecnico

O helper passara a construir o URL como:

```
https://cmxhvptjfezxjjrrlwgx.supabase.co/functions/v1/{name}
```

E enviar o Authorization header com o anon key do projecto externo. Nenhum outro ficheiro precisa de ser alterado -- `SourcesPage.tsx` ja importa e usa `invokeEdgeFunction` correctamente.  
  
  
OBJECTIVO: Remover dependência do Lovable Cloud nas Edge Functions.

1) Apagar completamente o ficheiro:

   src/lib/edgeFunctions.ts

2) Procurar em todo o código por:

   invokeEdgeFunction(

   e substituir por:

   supabase.functions.invoke(

3) Garantir que todas as chamadas a:

   - rss-fetch

   - pipeline-run

   - chat-article

   - trending-topics

   usam exclusivamente:

   supabase.functions.invoke()

4) Confirmar que:

   - O client.ts usa [https://cmxhvptjfezxjjrrlwgx.supabase.co](https://cmxhvptjfezxjjrrlwgx.supabase.co)

   - Nenhuma referência a kwwz permanece no src/

5) Não usar VITE_SUPABASE_URL para construir URLs manualmente.

   Apenas usar o client supabase já configurado.

No final, mostrar:

- Lista de ficheiros alterados

- Confirmação de que não existe nenhuma referência a kwwz no src/

&nbsp;