
# Correções: Layout do Chat e Indicadores no Pipeline

## Resumo dos Problemas

### Problema 1: Layout do Chat
Pelo screenshot, o utilizador quer que:
1. A resposta da IA apareça primeiro
2. O **input de chat** fique logo abaixo da resposta (para permitir continuar a conversa)
3. As **notícias relacionadas** fiquem no final, abaixo do input

### Problema 2: Indicadores no Pipeline de Reformulação
Na coluna "Em Reformulação" falta:
1. Indicador visual claro no artigo que está a ser reformulado
2. Contador de tempo até o agente processar o próximo artigo

---

## Alterações Detalhadas

### 1. ChatPage.tsx - Reorganizar Layout

**Ficheiro:** `src/pages/ChatPage.tsx`

**Alteração da ordem dos elementos (linhas 281-315):**

| Antes | Depois |
|-------|--------|
| 1. Resposta da IA | 1. Resposta da IA |
| 2. Notícias relacionadas | 2. **Input de chat** (movido para aqui) |
| 3. Input no fundo | 3. Notícias relacionadas (movidas para baixo) |

**Nova estrutura:**
```tsx
{/* Mensagem do assistente */}
<div className="flex gap-3">
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
    <Sparkles className="h-4 w-4 text-primary" />
  </div>
  <div className="flex-1 rounded-2xl rounded-tl-md bg-muted/50 px-4 py-3">
    <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
  </div>
</div>

{/* Input inline - DEPOIS da resposta */}
{msgIndex === messages.length - 1 && (
  <form onSubmit={handleFormSubmit} className="ml-11 mt-4">
    <div className="flex gap-2">
      <Input ... />
      <Button ... />
    </div>
  </form>
)}

{/* Notícias relacionadas - DEPOIS do input */}
{msgIndex === messages.length - 1 && relatedArticles.length > 0 && (
  <div className="ml-11 mt-6 space-y-3">
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      Notícias relacionadas
    </p>
    ...
  </div>
)}
```

---

### 2. RewritingColumn.tsx - Adicionar Indicadores Visuais

**Ficheiro:** `src/admin/components/pipeline/RewritingColumn.tsx`

#### 2.1 Contador de Tempo para Próximo Processamento

Adicionar contador regressivo baseado no `rewrite_interval_minutes` das configurações:

```tsx
// Imports adicionais
import { useAgentSettings } from '../../hooks/useAgentSettings';
import { Timer, Clock } from 'lucide-react';

// Dentro do componente
const { data: agentSettings } = useAgentSettings();
const [countdown, setCountdown] = useState<number>(0);

// Effect para countdown
useEffect(() => {
  if (!processingArticle && queuedItems.length > 0 && agentSettings) {
    const intervalMinutes = parseInt(agentSettings.rewrite_interval_minutes) || 2;
    const intervalSeconds = intervalMinutes * 60;
    
    // Calcular tempo restante até próxima execução
    setCountdown(intervalSeconds);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) return intervalSeconds;
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }
}, [processingArticle, queuedItems.length, agentSettings]);

// Formatar tempo
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

#### 2.2 UI do Artigo em Processamento

```tsx
{/* Currently processing */}
{processingArticle && (
  <div className="space-y-2 rounded-lg bg-primary/10 p-3 border border-primary/30">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs font-medium text-primary">
        <Loader2 className="h-3 w-3 animate-spin" />
        A REFORMULAR AGORA
      </div>
      {processingItem?.started_at && (
        <div className="flex items-center gap-1 text-xs text-primary">
          <Clock className="h-3 w-3" />
          {/* Tempo decorrido */}
          <span>{getElapsedTime(processingItem.started_at)}</span>
        </div>
      )}
    </div>
    <PipelineCard
      article={processingArticle}
      isProcessing
      showCheckbox={false}
    />
    <div className="space-y-1">
      <Progress value={progress} className="h-2 bg-primary/20" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Bot className="h-3 w-3 animate-pulse text-primary" />
          Reformulando com IA...
        </span>
        <span className="font-mono">{Math.round(progress)}%</span>
      </div>
    </div>
  </div>
)}
```

#### 2.3 Indicador de Próximo Processamento

```tsx
{/* Próximo processamento */}
{!processingArticle && queuedItems.length > 0 && (
  <div className="mb-3 flex items-center justify-between rounded-lg bg-muted/50 p-2 text-xs">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Timer className="h-4 w-4" />
      <span>Próximo processamento em:</span>
    </div>
    <div className="flex items-center gap-1 font-mono font-medium text-primary">
      <span>{formatTime(countdown)}</span>
    </div>
  </div>
)}
```

---

## Ficheiros a Modificar

| Ficheiro | Alterações |
|----------|-----------|
| `src/pages/ChatPage.tsx` | Mover input para depois da resposta; Notícias relacionadas no final |
| `src/admin/components/pipeline/RewritingColumn.tsx` | Adicionar countdown timer; Melhorar indicadores visuais do processamento |

---

## Layout Visual Final

### ChatPage
```text
┌────────────────────────────────────────────────┐
│ Pergunta do utilizador                         │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ ✨ Resposta da IA                              │
│    Lorem ipsum dolor sit amet...               │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ [Escreva a sua pergunta...           ] [>]     │ ← INPUT AQUI
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ NOTÍCIAS RELACIONADAS                          │
│ ┌──────────────────────────────────────────┐   │
│ │ 📰 Artigo 1                              │   │
│ └──────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────┐   │
│ │ 📰 Artigo 2                              │   │
│ └──────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
```

### Pipeline - Coluna "Em Reformulação"
```text
┌────────────────────────────────────────────────┐
│ 🤖 Em Reformulação                        [3]  │
├────────────────────────────────────────────────┤
│                                                 │
│ ┌──────────────────────────────────────────┐   │
│ │ 🔄 A REFORMULAR AGORA         ⏱️ 0:45    │   │
│ │ ┌────────────────────────────────────────┐   │
│ │ │ Título do artigo...                    │   │
│ │ │ Club of Mozambique | Alta              │   │
│ │ └────────────────────────────────────────┘   │
│ │ ████████████████████░░░░░░░░░░  72%      │   │
│ │ 🤖 Reformulando com IA...                │   │
│ └──────────────────────────────────────────┘   │
│                                                 │
│ ┌──────────────────────────────────────────┐   │
│ │ ⏲️ Próximo processamento em: 1:45        │   │
│ └──────────────────────────────────────────┘   │
│                                                 │
│ ⚡ FILA DE ESPERA (3)                          │
│ 1. Artigo 1...                                 │
│ 2. Artigo 2...                                 │
│ 3. Artigo 3...                                 │
│                                                 │
└────────────────────────────────────────────────┘
```

---

## Checklist de Validação

- [ ] Input de chat aparece depois da resposta da IA
- [ ] Notícias relacionadas aparecem abaixo do input
- [ ] Artigo em processamento tem indicador visual claro (fundo destacado)
- [ ] Tempo decorrido desde início do processamento visível
- [ ] Contador regressivo mostra tempo até próximo processamento
- [ ] Barra de progresso animada durante reformulação
