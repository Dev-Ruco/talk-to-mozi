
# Plano: Preparar Dashboard para Uso Real

## Situacao Atual

| Item | Estado |
|------|--------|
| Base de dados | Vazia (0 fontes, 0 artigos) |
| Edge function news-agent | Criada mas sem testes |
| Lovable AI | Disponivel (LOVABLE_API_KEY configurada) |
| Monitoramento de etapas | Basico (apenas logs finais) |

---

## O Que Vamos Implementar

### 1. Seed de Fontes RSS Reais (Mocambique e CPLP)

Vou inserir fontes RSS activas para captar noticias reais:

| Fonte | URL RSS | Categoria |
|-------|---------|-----------|
| Jornal Noticias | https://jornalnoticias.co.mz/feed/ | Nacional |
| Verdade | https://verdade.co.mz/feed/ | Nacional |
| O Pais | https://opais.co.mz/feed/ | Nacional |
| Club of Mozambique | https://clubofmozambique.com/feed/ | Nacional |
| Lusa (PT) | https://www.lusa.pt/rss/pais | Internacional |
| RTP Africa | https://www.rtp.pt/noticias/rss/africa | Africa |
| DW Africa | https://rss.dw.com/xml/rss-pt-africa | Africa |

### 2. Sistema de Logs Detalhados em Tempo Real

Actualizar a edge function e a tabela agent_logs para registar CADA etapa:

**Novas accoes a registar:**
```text
fetch_start      - Inicio de fetch da fonte
fetch_complete   - Fetch concluido com sucesso
parse_rss        - A analisar XML
duplicate_check  - A verificar duplicados
article_save     - Artigo guardado
ai_rewrite       - Reescrita IA iniciada
ai_complete      - Reescrita IA concluida
```

**Nova coluna na tabela agent_logs:**
```sql
details JSONB - Para guardar metadados de cada etapa
```

### 3. AgentPage com Actualizacao em Tempo Real

Implementar Supabase Realtime para ver logs a aparecer enquanto o agente executa:

```typescript
// Subscrever a novos logs
supabase
  .channel('agent_logs')
  .on('postgres_changes', { event: 'INSERT', table: 'agent_logs' }, (payload) => {
    // Adicionar log a lista em tempo real
  })
  .subscribe();
```

### 4. Integracao Lovable AI para Reformulacao

Criar edge function `rewrite-article` que:
- Recebe artigo original
- Chama Lovable AI Gateway (google/gemini-3-flash-preview)
- Retorna titulo e conteudo reformulados em portugues de Mocambique

**Accoes disponiveis no ContentPanel:**
- **Reformular**: Reescreve mantendo informacao
- **Encurtar**: Resume para 2-3 paragrafos
- **Tom Jornalistico**: Ajusta para estilo noticioso formal

---

## Ficheiros a Criar

```text
supabase/functions/rewrite-article/index.ts    # Edge function para IA
```

## Ficheiros a Modificar

```text
supabase/functions/news-agent/index.ts         # Logs detalhados por etapa
supabase/config.toml                           # Adicionar nova function
src/admin/pages/AgentPage.tsx                  # Realtime logs + detalhes
src/admin/components/editor/ContentPanel.tsx   # Chamar edge function IA
src/admin/types/admin.ts                       # Adicionar campo details ao AgentLog
```

## Migracao SQL

```sql
-- Adicionar coluna details aos logs
ALTER TABLE agent_logs ADD COLUMN details JSONB;

-- Habilitar realtime na tabela
ALTER PUBLICATION supabase_realtime ADD TABLE agent_logs;
```

---

## Detalhes Tecnicos

### Edge Function: rewrite-article

```typescript
// Recebe: { article_id, action: 'rewrite' | 'shorten' | 'journalistic' }
// Chama: https://ai.gateway.lovable.dev/v1/chat/completions
// Modelo: google/gemini-3-flash-preview
// Retorna: { title, lead, content }
```

### Prompt do Sistema para IA

```text
Es um editor de noticias do B NEWS, um portal de Mocambique.
Escreve em portugues de Mocambique (pt-MZ).
Mantem factos exactos, nunca inventes informacao.
```

### Logs em Tempo Real

A interface mostrara:
- Estado actual (A processar fonte X...)
- Timeline de accoes com timestamps
- Erros em destaque vermelho
- Botao para expandir detalhes JSON

---

## Sequencia de Implementacao

1. Executar migracao SQL (details + realtime)
2. Actualizar news-agent com logs detalhados
3. Criar rewrite-article edge function
4. Actualizar AgentPage com realtime
5. Ligar ContentPanel a edge function
6. Inserir fontes RSS de teste via script
7. Testar fluxo completo

---

## Resultado Final

Apos implementacao, poderas:
- Ver fontes RSS a serem processadas em tempo real
- Acompanhar cada artigo a ser captado
- Detectar erros imediatamente
- Reformular artigos com IA com um clique
- Ter noticias reais de Mocambique no sistema
