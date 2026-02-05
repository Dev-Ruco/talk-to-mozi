
# Reformulacao Automatica de Artigos pelo Agente

## Fluxo Actual (Confirmado pela Analise)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUXO ACTUAL                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. AGENTE                    2. INBOX                    3. EDITOR        │
│   ─────────                    ─────────                   ─────────        │
│   Puxa RSS                     Usuario ve artigos          Usuario clica    │
│   Guarda artigos               em status "captured"        "Reformular"     │
│   status = "captured"          Manualmente                 IA reformula     │
│                                                            status="rewritten"│
│                                                                             │
│   4. EDITOR (cont.)            5. PUBLICACAO                                │
│   ─────────────────            ──────────────                               │
│   Usuario adiciona:            Usuario publica             MUITOS PASSOS    │
│   - Foto                       ou agenda                   MANUAIS!         │
│   - Tags                                                                    │
│   - Categoria                                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Problema actual:**
- O agente apenas captura artigos (status `captured`)
- A reformulacao depende de clique manual no botao "Reformular"
- Existem 24 artigos no status `captured` que precisam de reformulacao manual

---

## Novo Fluxo Proposto

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NOVO FLUXO AUTOMATIZADO                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. AGENTE (AUTOMATICO)                                                    │
│   ──────────────────────                                                    │
│   a) Puxa RSS                                                               │
│   b) Para cada artigo NOVO:                                                 │
│      - Guarda artigo temporariamente                                        │
│      - Chama Lovable AI com prompt "tom jornalistico"                       │
│      - Guarda titulo, lead e conteudo reformulados                          │
│      - Define status = "rewritten" (JA reformulado!)                        │
│                                                                             │
│   2. INBOX / EDICAO                                                         │
│   ─────────────────                                                         │
│   Usuario ve artigos JA reformulados                                        │
│   Pode EDITAR o texto (opcional)                                            │
│   Adiciona:                                                                 │
│   - Foto (obrigatorio para publicar)                                        │
│   - Tags                                                                    │
│   - Categoria                                                               │
│                                                                             │
│   3. PUBLICACAO                                                             │
│   ─────────────                                                             │
│   Usuario publica ou agenda                                                 │
│                                                                             │
│   APENAS 2-3 PASSOS MANUAIS!                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Alteracoes Tecnicas

### 1. Modificar Edge Function `news-agent`

O agente actual salva artigos e termina. O novo fluxo deve:

**Apos salvar cada artigo:**
```typescript
// Depois de inserir o artigo com sucesso
if (insertedArticle?.id) {
  // Chamar a funcao de reescrita automaticamente
  await rewriteArticle(supabase, insertedArticle.id, item.title, cleanText(...));
}
```

**Nova funcao interna `rewriteArticle`:**
```typescript
async function rewriteArticle(
  supabase: any, 
  articleId: string, 
  originalTitle: string, 
  originalContent: string
) {
  // 1. Chamar Lovable AI Gateway com prompt "journalistic"
  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: JOURNALISTIC_PROMPT },
        { role: 'user', content: `TÍTULO: ${originalTitle}\n\nCONTEÚDO: ${originalContent}` },
      ],
      temperature: 0.7,
    }),
  });

  // 2. Parsear resposta JSON da IA
  const { title, lead, content } = parseAIResponse(aiResponse);

  // 3. Actualizar artigo na base de dados
  await supabase
    .from('articles')
    .update({
      title: title,           // Titulo reformulado
      lead: lead,             // Lead gerado
      content: content,       // Conteudo reformulado
      status: 'rewritten',    // JA REFORMULADO!
    })
    .eq('id', articleId);
}
```

### 2. Logs de Monitoramento

Adicionar novas accoes de log:
- `ai_auto_rewrite` - Inicio da reformulacao automatica
- `ai_auto_complete` - Reformulacao concluida
- `ai_auto_error` - Erro na reformulacao (artigo fica como `captured`)

### 3. Tratamento de Erros

Se a reformulacao falhar (rate limit, erro de IA):
- Artigo permanece com status `captured`
- Log de erro e registado
- Usuario pode reformular manualmente no editor

### 4. Opcao de Configuracao (Opcional)

Adicionar toggle na pagina AgentPage para activar/desactivar reformulacao automatica:
```typescript
[x] Reformular automaticamente com tom jornalistico
```

---

## Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `supabase/functions/news-agent/index.ts` | Adicionar funcao `rewriteArticle` e integrar no loop de artigos |
| `src/admin/pages/AgentPage.tsx` | (Opcional) Adicionar toggle para activar reformulacao automatica |
| `src/admin/types/admin.ts` | Adicionar novos tipos de log |

---

## Prompt de Tom Jornalistico (Reutilizado)

O prompt ja existe na funcao `rewrite-article`:

```text
Es um jornalista senior do B NEWS com decadas de experiencia.

INSTRUCOES:
- Reescreve o texto com tom jornalistico formal e profissional
- Usa a estrutura da piramide invertida (mais importante primeiro)
- Escreve em portugues de Mocambique (pt-MZ)
- Adiciona contexto quando necessario sem inventar factos
- Usa citacoes directas se existirem no original
- Linguagem neutra e objectiva

FORMATO DE RESPOSTA (JSON):
{
  "title": "Titulo noticioso formal",
  "lead": "Lead jornalistico respondendo as perguntas essenciais",
  "content": "Texto em estilo jornalistico profissional"
}
```

---

## Consideracoes de Performance

1. **Rate Limits**: O Lovable AI tem limites de pedidos/minuto. Para evitar bloqueios:
   - Processar artigos sequencialmente (nao em paralelo)
   - Adicionar pequeno delay entre reformulacoes (500ms-1s)
   - Se houver rate limit (429), parar e continuar na proxima execucao

2. **Timeout do Edge Function**: Edge functions tem timeout de ~60s. Se houver muitos artigos:
   - Limitar a 5-10 reformulacoes por execucao
   - Artigos restantes serao reformulados na proxima execucao

3. **Custos**: Cada reformulacao usa creditos de IA. Considerar:
   - Apenas reformular artigos com conteudo suficiente (>100 caracteres)
   - Nao reformular artigos duplicados

---

## Resultado Final

Apos implementacao:

| Antes | Depois |
|-------|--------|
| Agente captura artigos crus | Agente captura E reformula automaticamente |
| Usuario clica "Reformular" manualmente | Artigos ja chegam reformulados |
| Workflow: Captura → Manual → Editar → Publicar | Workflow: Captura+Reformula → Editar(opcional) → Publicar |
| 4-5 passos manuais | 2-3 passos manuais |

---

## Seguranca e Fallback

- Se LOVABLE_API_KEY nao estiver configurada, agente continua a funcionar sem reformulacao
- Se reformulacao falhar, artigo fica como `captured` e pode ser reformulado manualmente
- Logs detalhados permitem monitorar o processo

