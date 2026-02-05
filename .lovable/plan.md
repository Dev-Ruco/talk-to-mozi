
# Auditoria Geral de UX e Correcções no Dashboard/Pipeline

## Resumo Executivo

Identificadas **6 áreas críticas** a corrigir:

1. Scroll para topo ao abrir artigos
2. Simplificação dos cards de notícias
3. Integração automática de imagens na Media Library
4. Fluxo automático do Pipeline (Inbox → Reformulação)
5. Configurações de ritmo do agente no Dashboard
6. Persistência das definições no banco de dados

---

## 1. Scroll para Topo ao Abrir Artigos

### Problema Identificado
A página de artigo não faz scroll automático para o topo quando é aberta, deixando o utilizador no meio do conteúdo.

### Ficheiros a Modificar
| Ficheiro | Alteração |
|----------|-----------|
| `src/pages/ArticlePage.tsx` | Adicionar `useEffect` com `window.scrollTo(0, 0)` |
| `src/pages/CategoryPage.tsx` | Mesmo tratamento |
| `src/pages/ChatPage.tsx` | Mesmo tratamento |

### Solução Técnica
```tsx
// Adicionar em cada página que precisa de scroll reset
useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'instant' });
}, [id]); // Reset quando o ID muda (navegação entre artigos)
```

---

## 2. Simplificação dos Cards de Notícias

### Problema Identificado (ver screenshot)
Os cards têm elementos redundantes:
- Botão "Abrir" é desnecessário (card já é clicável)
- Botão "Conversar" pode ser mais editorial
- Ícone de coração/favorito cria ruído visual

### Ficheiro a Modificar
`src/components/news/NewsCard.tsx`

### Alterações Específicas

| Antes | Depois |
|-------|--------|
| Botão "Conversar" | "Explorar a notícia" |
| Botão "Abrir" | **Remover** |
| Ícone Heart (favorito) | **Remover** |
| *(novo)* | Ícone Share (partilhar) |

### Código Actualizado (Secção Actions)
```tsx
{/* Actions - Simplificado */}
<div className="mt-4 flex items-center justify-between">
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Button
      variant="default"
      size="sm"
      className="gap-1.5"
      onClick={handleChat}
    >
      <MessageCircle className="h-4 w-4" />
      Explorar a notícia
    </Button>
  </motion.div>
  
  <motion.button
    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
    onClick={handleShare}
    whileTap={{ scale: 0.9 }}
  >
    <Share2 className="h-4 w-4 text-muted-foreground" />
    <span className="sr-only">Partilhar</span>
  </motion.button>
</div>
```

**Remover:**
- Importação de `Heart` de lucide-react (manter apenas em ArticlePage)
- Botão "Abrir" (linhas 204-214)
- Botão de coração/favorito (linhas 216-228)
- Props `isSaved`, `onToggleSave` onde não forem necessárias
- Animação de duplo-clique para like (opcional manter)

---

## 3. Integração Automática de Imagens na Media Library

### Problema Identificado
O hook `useImageUpload` carrega imagens para o Supabase Storage mas **não cria registo na tabela `media`**. A galeria está vazia (confirmado por query).

### Ficheiro a Modificar
`src/admin/hooks/useImageUpload.ts`

### Solução
Após upload bem-sucedido, criar automaticamente registo na tabela `media`:

```tsx
const uploadImage = async (file: File, articleId: string): Promise<string | null> => {
  // ... código existente de upload ...
  
  // NOVO: Após obter publicUrl, inserir na tabela media
  if (publicUrl) {
    // Get image dimensions
    const dimensions = await getImageDimensions(file);
    
    // Insert into media library
    const { error: mediaError } = await supabase
      .from('media')
      .insert({
        file_name: file.name,
        file_path: data.path,
        url: publicUrl,
        title: `Imagem - ${articleId}`,
        file_size: file.size,
        mime_type: file.type,
        width: dimensions.width,
        height: dimensions.height,
        tags: ['artigo', 'upload'],
      });
    
    if (mediaError) {
      console.warn('Failed to add to media library:', mediaError);
      // Não bloquear - imagem já foi carregada
    }
  }
  
  return publicUrl;
};

// Helper function
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
}
```

---

## 4. Auditoria ao Pipeline (Inbox → Reformulação)

### Problema Identificado
Os artigos **não saem automaticamente** do Inbox para reformulação. O mecanismo actual requer:
1. Utilizador adicionar manualmente à fila (`addToQueue`)
2. Ou o `news-agent` fazer auto-rewrite imediato (limitado a 5-10 artigos)

### Análise do Fluxo Actual

```text
┌─────────────────────────────────────────────────────────────────────┐
│                      FLUXO ACTUAL (MANUAL)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   news-agent (RSS)                                                  │
│        │                                                            │
│        ▼                                                            │
│   [Captura artigos] ──► status='captured' ──► INBOX                 │
│        │                                                            │
│        ├── auto_rewrite=true (5-10 artigos)                         │
│        │        │                                                   │
│        │        ▼                                                   │
│        │   [Reformula inline] ──► status='rewritten' ──► PENDENTES  │
│        │                                                            │
│        └── Restantes ficam em 'captured' ❌ PARADOS NO INBOX        │
│                                                                      │
│   PROBLEMA: Artigos além do limite ficam parados indefinidamente    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Solução: Processamento Automático via rewrite_queue

```text
┌─────────────────────────────────────────────────────────────────────┐
│                      FLUXO CORRIGIDO (AUTOMÁTICO)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   news-agent (RSS)                                                  │
│        │                                                            │
│        ▼                                                            │
│   [Captura artigos] ──► status='captured'                           │
│        │                                                            │
│        ▼                                                            │
│   [Auto-adiciona à rewrite_queue com prioridade baseada em hora]    │
│        │                                                            │
│        ▼                                                            │
│   pg_cron (a cada X minutos) ──► invoca process-queue               │
│        │                                                            │
│        ▼                                                            │
│   [Processa 1 artigo da fila] ──► status='rewritten' ──► PENDENTES  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `supabase/functions/news-agent/index.ts` | Após salvar artigo, inserir automaticamente na `rewrite_queue` |
| Nova SQL migration | Criar cron job para invocar `process-queue` periodicamente |

### Alteração em news-agent
```typescript
// Após inserir artigo com sucesso (linha ~498)
if (insertedArticle) {
  // Auto-add to rewrite queue
  await supabase
    .from('rewrite_queue')
    .insert({
      article_id: insertedArticle.id,
      priority: 0, // Normal priority
      status: 'queued',
    });
  
  articlesToRewrite.push({
    id: insertedArticle.id,
    title: item.title,
    content: originalContent || '',
  });
}
```

---

## 5. Configurações de Ritmo do Agente

### Problema Identificado
As definições na página Settings (`SettingsPage.tsx`) são apenas estado local - **não persistem** nem controlam o agente real.

### Solução: Tabela de Configurações

### Nova Tabela SQL
```sql
CREATE TABLE IF NOT EXISTS agent_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Configurações iniciais
INSERT INTO agent_settings (key, value, description) VALUES
  ('capture_interval_minutes', '5', 'Intervalo entre capturas de novas notícias'),
  ('rewrite_interval_minutes', '2', 'Intervalo entre reformulações de artigos'),
  ('max_rewrites_per_run', '3', 'Máximo de artigos reformulados por execução'),
  ('agent_enabled', 'true', 'Agente de captura activo'),
  ('auto_rewrite_enabled', 'true', 'Reformulação automática activa'),
  ('duplicate_threshold', '0.85', 'Limiar de similaridade para duplicados');

-- RLS
ALTER TABLE agent_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins to read settings" ON agent_settings
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor_chefe'));

CREATE POLICY "Allow admins to update settings" ON agent_settings
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));
```

### Ficheiro a Modificar
`src/admin/pages/SettingsPage.tsx`

### Alterações Necessárias
1. Carregar configurações da tabela `agent_settings`
2. Guardar alterações na tabela
3. Adicionar novos controlos específicos:
   - Intervalo de captura (minutos)
   - Intervalo de reformulação (minutos)
   - Máximo de reformulações por execução

### Novo Hook: useAgentSettings
```tsx
// src/admin/hooks/useAgentSettings.ts
export function useAgentSettings() {
  return useQuery({
    queryKey: ['agent-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_settings')
        .select('*');
      if (error) throw error;
      
      // Convert to key-value map
      return data.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>);
    },
  });
}

export function useUpdateAgentSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('agent_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-settings'] });
    },
  });
}
```

### UI Actualizada para SettingsPage (Tab Agente IA)
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Bot className="h-5 w-5 text-primary" />
      Ritmo do Agente
    </CardTitle>
    <CardDescription>
      Configure os intervalos de operação do agente
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* Intervalo de Captura */}
    <div className="space-y-2">
      <Label>Intervalo de Captura de Notícias</Label>
      <Select 
        value={settings.capture_interval_minutes} 
        onValueChange={(v) => updateSetting('capture_interval_minutes', v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 minuto</SelectItem>
          <SelectItem value="5">5 minutos</SelectItem>
          <SelectItem value="15">15 minutos</SelectItem>
          <SelectItem value="30">30 minutos</SelectItem>
          <SelectItem value="60">1 hora</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        A cada quantos minutos o agente verifica novas notícias nas fontes RSS
      </p>
    </div>
    
    <Separator />
    
    {/* Intervalo de Reformulação */}
    <div className="space-y-2">
      <Label>Intervalo de Reformulação</Label>
      <Select 
        value={settings.rewrite_interval_minutes} 
        onValueChange={(v) => updateSetting('rewrite_interval_minutes', v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 minuto</SelectItem>
          <SelectItem value="2">2 minutos</SelectItem>
          <SelectItem value="5">5 minutos</SelectItem>
          <SelectItem value="10">10 minutos</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Intervalo entre cada processamento de artigos na fila de reformulação
      </p>
    </div>
    
    <Separator />
    
    {/* Artigos por execução */}
    <div className="space-y-2">
      <Label>Artigos por Execução</Label>
      <Select 
        value={settings.max_rewrites_per_run} 
        onValueChange={(v) => updateSetting('max_rewrites_per_run', v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 artigo</SelectItem>
          <SelectItem value="3">3 artigos</SelectItem>
          <SelectItem value="5">5 artigos</SelectItem>
          <SelectItem value="10">10 artigos</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Quantos artigos reformular em cada execução do cron job
      </p>
    </div>
  </CardContent>
</Card>
```

---

## 6. Cron Jobs para Automatização

### Nova Migration SQL para pg_cron
```sql
-- Habilitar extensão pg_cron (se não estiver)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Cron job para captura de notícias (a cada 5 minutos)
SELECT cron.schedule(
  'news-agent-capture',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://kwwzfhpamciilgmknsov.supabase.co/functions/v1/news-agent',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{"auto_rewrite": false}'
  );
  $$
);

-- Cron job para processamento da fila (a cada 2 minutos)
SELECT cron.schedule(
  'process-rewrite-queue',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://kwwzfhpamciilgmknsov.supabase.co/functions/v1/process-queue',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'
  );
  $$
);
```

---

## Ficheiros a Modificar/Criar

| Ficheiro | Acção | Descrição |
|----------|-------|-----------|
| `src/pages/ArticlePage.tsx` | Modificar | Adicionar scroll to top |
| `src/components/news/NewsCard.tsx` | Modificar | Simplificar UI (remover Abrir, Heart, renomear Conversar) |
| `src/admin/hooks/useImageUpload.ts` | Modificar | Auto-inserir na tabela media |
| `supabase/functions/news-agent/index.ts` | Modificar | Auto-adicionar à rewrite_queue |
| `src/admin/hooks/useAgentSettings.ts` | Criar | Hook para configurações persistentes |
| `src/admin/pages/SettingsPage.tsx` | Modificar | Usar configurações do banco + novos controlos |
| SQL Migration | Criar | Tabela agent_settings + cron jobs |

---

## Fluxo Final Esperado

```text
┌─────────────────────────────────────────────────────────────────────┐
│                      FLUXO AUTOMATIZADO COMPLETO                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  CRON: news-agent (a cada 5min)                                │ │
│  │    │                                                           │ │
│  │    ▼                                                           │ │
│  │  [Captura RSS] ──► articles (status=captured)                  │ │
│  │    │                                                           │ │
│  │    ▼                                                           │ │
│  │  [Auto-add] ──► rewrite_queue (status=queued)                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                       │
│                              ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  CRON: process-queue (a cada 2min)                             │ │
│  │    │                                                           │ │
│  │    ▼                                                           │ │
│  │  [Pega próximo da fila]                                        │ │
│  │    │                                                           │ │
│  │    ▼                                                           │ │
│  │  [Reformula com IA] ──► articles (status=rewritten)            │ │
│  │    │                                                           │ │
│  │    ▼                                                           │ │
│  │  [Atualiza queue] ──► rewrite_queue (status=completed)         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                       │
│                              ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  PIPELINE UI (tempo real)                                      │ │
│  │                                                                │ │
│  │  INBOX ──► EM REFORMULAÇÃO ──► PENDENTES ──► PUBLICADOS        │ │
│  │  (captured)   (processing)     (rewritten)   (published)       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Checklist de Validação

- [ ] Artigos abrem com scroll no topo
- [ ] Cards sem botão "Abrir" e sem ícone de coração
- [ ] Botão renomeado para "Explorar a notícia"
- [ ] Ícone de partilha visível
- [ ] Imagens carregadas aparecem na Galeria
- [ ] Artigos entram automaticamente na fila de reformulação
- [ ] Cron jobs executam nos intervalos configurados
- [ ] Definições persistem na base de dados
- [ ] Ritmo do agente configurável via Dashboard
