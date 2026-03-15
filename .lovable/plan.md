# Problema: Quota OpenAI Esgotada

## Diagnóstico

Os logs da Edge Function `chat` mostram claramente o erro:

```
"You exceeded your current quota, please check your plan and billing details."
```

O `OPENAI_API_KEY` configurado não tem créditos disponíveis na conta OpenAI. Todas as funções que usam esta chave (chat, process-queue, rewrite-article, news-agent) estão bloqueadas.

## Solução

Solicitar uma nova `OPENAI_API_KEY` com créditos activos. A chave pode ser obtida em:

1. Aceder a [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Criar uma nova chave ou verificar os créditos da conta actual em [https://platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing)
3. Fornecer a nova chave quando solicitado

Nenhuma alteração de código é necessária -- apenas actualizar o valor do segredo `OPENAI_API_KEY` com uma chave válida.  
  
Actualiza a chave: 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

## Ficheiros alterados

Nenhum. Apenas actualização do segredo existente.