

# Correcção: Imagens dos Artigos Não Carregam

## Problema Identificado

Os artigos publicados têm URLs de imagem temporárias do tipo `blob:` que são inválidas:

| Artigo | image_url |
|--------|-----------|
| Macaneta: Estrada de acesso... | `blob:https://talk-to-mozi.lovable.app/74dd5dc5...` |
| Jornalista da STV sobrevive... | `blob:https://talk-to-mozi.lovable.app/30f3475f...` |

**Estas URLs `blob:` deixam de funcionar** porque:
- São criadas localmente no browser quando se selecciona uma imagem
- Só existem na memória do browser durante aquela sessão
- Nunca foram enviadas para o Supabase Storage

### Configuração de Storage (Confirmada OK)
- Bucket `article-images` existe e é público
- Políticas RLS correctas para upload/leitura

---

## Plano de Correcção

### Correcção 1: Validar Imagem Antes de Publicar

Modificar `PublishPanel.tsx` para bloquear publicação se a imagem for uma URL `blob:`:

```typescript
// Validar se imagem é temporária
const hasValidImage = article.image_url && !article.image_url.startsWith('blob:');

// Desactivar botão de publicar se imagem inválida
<Button 
  onClick={onPublish}
  disabled={isSaving || !article.title || !article.content || !hasValidImage}
>
  Publicar agora
</Button>

// Mostrar aviso se imagem é temporária
{article.image_url?.startsWith('blob:') && (
  <p className="text-xs text-destructive">
    ⚠️ Imagem temporária - clique "Alterar" para guardar permanentemente
  </p>
)}
```

### Correcção 2: Fallback de Imagem no Frontend

Modificar `NewsCard.tsx` e `HeroChat.tsx` para mostrar placeholder quando imagem falha:

```typescript
// Detectar URLs inválidas
const isValidImageUrl = (url?: string) => {
  if (!url) return false;
  if (url.startsWith('blob:')) return false;
  return true;
};

// Usar placeholder
const imageUrl = isValidImageUrl(article.imageUrl) 
  ? article.imageUrl 
  : '/placeholder.svg';
```

### Correcção 3: Hook de Upload com Preview Melhorado

Modificar `handleImageUpload` para mostrar preview temporário enquanto faz upload:

```typescript
const handleImageUpload = async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file && article.id) {
      // Mostrar preview temporário imediatamente
      const previewUrl = URL.createObjectURL(file);
      onUpdate({ image_url: previewUrl }); // Temporário para preview
      
      // Fazer upload real ao Storage
      const permanentUrl = await uploadImage(file, article.id);
      if (permanentUrl) {
        onUpdate({ image_url: permanentUrl }); // Substituir por URL permanente
        URL.revokeObjectURL(previewUrl); // Limpar blob
      }
    }
  };
  input.click();
};
```

---

## Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/admin/components/editor/PublishPanel.tsx` | Validar imagem antes de publicar, mostrar aviso |
| `src/components/news/NewsCard.tsx` | Fallback para placeholder em imagens inválidas |
| `src/components/news/HeroChat.tsx` | Fallback para placeholder em imagens inválidas |
| `src/hooks/usePublishedArticles.ts` | Validar URLs de imagem no adaptador |

---

## Corrigir Artigos Existentes

Para os 2 artigos já publicados com URLs `blob:`, será necessário:
1. Ir ao editor de cada artigo
2. Clicar "Alterar" na imagem
3. Seleccionar nova imagem (será feito upload real)
4. Guardar o artigo

---

## Resultado Esperado

Após implementação:

| Antes | Depois |
|-------|--------|
| Imagens `blob:` não carregam | URLs permanentes do Storage |
| Publicar com imagem temporária | Bloqueado até imagem ser guardada |
| Sem feedback de erro | Aviso claro sobre imagem inválida |
| Imagem quebrada no feed | Placeholder elegante |

---

## Fluxo Visual Corrigido

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUXO DE IMAGEM CORRIGIDO                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. SELECCIONAR                2. PREVIEW                 3. UPLOAD        │
│   ──────────────                ─────────                  ──────────       │
│   Utilizador escolhe            Mostra preview             Envia para       │
│   ficheiro local                temporário (blob:)         Supabase Storage │
│                                                                             │
│   4. URL PERMANENTE             5. PUBLICAR                                 │
│   ─────────────────             ──────────                                  │
│   Guarda URL do Storage         Só permite publicar                         │
│   na base de dados              com URL válida                              │
│                                                                             │
│   RESULTADO: https://kwwzfhpamciilgmknsov.supabase.co/storage/v1/object/... │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
Adicionar ao dashboard do portal uma gestão completa de imagens integrada ao fluxo editorial.

Na sessão de edição de artigos e upload de novas imagens, deve existir uma opção para:

Seleccionar imagens já existentes na base de dados de media;

Pesquisar imagens por nome, descrição ou data;

Pré-visualizar antes de inserir no artigo;

Inserir a imagem directamente no conteúdo do artigo.

O sistema deve possuir uma base de dados própria para armazenamento de imagens (media library), onde todas as imagens enviadas ficam organizadas e reutilizáveis.

Criar uma página exclusiva de Galeria no dashboard, independente da edição de artigos, onde o utilizador possa:

Visualizar todas as imagens carregadas;

Fazer upload local de novas imagens;

Adicionar informações básicas a cada imagem:

Título

Descrição da fotografia

Data

Tags/palavras-chave

Editar ou remover imagens.

Esta galeria deve funcionar como um arquivo fotográfico central do portal, permitindo reutilização rápida das imagens durante o processo editorial, sem necessidade de novo upload.

O objectivo é tornar o fluxo de produção de notícias mais rápido, organizado e profissional, evitando uploads repetidos e criando um acervo visual próprio do portal.
