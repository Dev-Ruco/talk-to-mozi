
# Correcao do Visual Editor e Fluxo de Publicacao de Noticias Visuais

## Problemas Identificados

### 1. Publicacao duplicada
O PublishPanel (painel direito) exige imagem de capa + conteudo textual para publicar (`disabled={!article.title || !article.content || !hasValidImage}`), e mostra campos de "Imagem de Capa" separados da galeria do VisualEditor. Isto forca o utilizador a carregar uma foto extra e cria publicacao duplicada (uma como artigo, outra como visual).

### 2. Preview do carousel nao funciona correctamente
O VisualEditor na linha 141 ainda usa `aspect-[4/5]` para formato vertical nos thumbnails do editor. O preview do carousel funciona, mas as imagens do editor mostram aspect ratios diferentes conforme o formato.

### 3. MediaPicker oculta o botao de seleccionar
O MediaPicker (`MediaPicker.tsx`) usa `ScrollArea` para a grelha de imagens mas o botao "Inserir Imagem" (linhas 146-157) fica fora do scroll. Quando ha muitas imagens, a grelha empurra o conteudo e o botao pode ficar oculto ou inacessivel.

### 4. Feed: carousel sem autoplay
O VisualCarousel no feed usa navegacao manual (setas/dots) mas nao tem autoplay com possibilidade de pausar.

---

## Solucao

### Parte 1: Simplificar PublishPanel para Noticias Visuais

**Ficheiro: `src/admin/components/editor/PublishPanel.tsx`**

Quando `content_type === 'visual'`:
- Esconder completamente a seccao "Imagem de Capa" (linhas 121-214) -- a galeria no VisualEditor e suficiente
- Esconder campos de legenda da imagem
- Alterar a condicao do botao "Publicar" de `!article.content || !hasValidImage` para `!article.gallery_urls || article.gallery_urls.length === 0` -- exigir apenas titulo + pelo menos 1 imagem na galeria
- Usar a primeira imagem da galeria como `image_url` automaticamente ao publicar

### Parte 2: Corrigir ArticleEditorPage - Publicacao unica

**Ficheiro: `src/admin/pages/ArticleEditorPage.tsx`**

Na funcao `handlePublish`:
- Se `content_type === 'visual'`, definir automaticamente `image_url` como a primeira imagem de `gallery_urls` (para o card no feed)
- Nao exigir `content` para publicar noticias visuais (o conteudo textual existe da reformulacao IA mas nao e obrigatorio editar)

### Parte 3: Carousel com autoplay no Feed

**Ficheiro: `src/components/news/VisualCarousel.tsx`**

- Adicionar prop `autoplay?: boolean` (default `false`)
- Quando `autoplay=true`, usar `embla-carousel-autoplay` (ja instalado) com intervalo de 4 segundos
- Pausar autoplay ao hover ou ao tocar (mobile)
- O autoplay so activa no feed (NewsCard), nao no editor ou pagina do artigo

**Ficheiro: `src/components/news/NewsCard.tsx`**

- Passar `autoplay={true}` ao VisualCarousel no card do feed

### Parte 4: Corrigir MediaPicker - Scroll e botao visivel

**Ficheiro: `src/admin/components/media/MediaPicker.tsx`**

- Reestruturar o layout da tab "library" para que o botao "Inserir Imagem" fique sempre fixo no fundo do dialog, visivel independentemente do scroll
- Dar altura fixa ao ScrollArea da grelha de imagens (ex: `max-h-[50vh]`) para nao empurrar o botao
- Manter o mesmo fix na tab "upload"

### Parte 5: Corrigir thumbnails do VisualEditor

**Ficheiro: `src/admin/components/editor/VisualEditor.tsx`**

- Linha 141: remover a condicao `format === 'vertical' ? 'aspect-[4/5]' : 'aspect-video'` e usar sempre `aspect-video` para os thumbnails, consistente com o que aparece no feed
- Garantir que o formato "horizontal" funciona correctamente no preview (ja funciona, o carousel usa `aspect-video`)

---

## Detalhes Tecnicos

### PublishPanel - Condicao de publicacao para visual
```typescript
// Antes (exige content + imagem de capa separada):
disabled={isSaving || !article.title || !article.content || !hasValidImage}

// Depois (para visual, exige apenas titulo + galeria):
const isVisual = article.content_type === 'visual';
const canPublish = isVisual
  ? !!article.title && (article.gallery_urls?.length ?? 0) > 0
  : !!article.title && !!article.content && hasValidImage;

disabled={isSaving || !canPublish}
```

### ArticleEditorPage - Auto-preencher image_url
```typescript
// No handlePublish, antes do update:
const imageUrl = article.content_type === 'visual' && article.gallery_urls?.length
  ? article.gallery_urls[0]  // Primeira imagem da galeria como capa
  : article.image_url;
```

### VisualCarousel - Autoplay
```typescript
import Autoplay from 'embla-carousel-autoplay';

// Usar plugin condicionalmente
const plugins = autoplay ? [Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })] : [];
const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, ... }, plugins);
```

### MediaPicker - Layout fixo
```typescript
// Estrutura corrigida da tab library:
<TabsContent value="library" className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
  {/* Search - fixo no topo */}
  <div className="relative mb-4 shrink-0">...</div>
  
  {/* Grid com scroll proprio */}
  <ScrollArea className="flex-1 min-h-0">
    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 pr-4">...</div>
  </ScrollArea>
  
  {/* Botao - fixo no fundo */}
  <div className="flex justify-end gap-2 mt-4 pt-4 border-t shrink-0">...</div>
</TabsContent>
```

---

## Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/admin/components/editor/PublishPanel.tsx` | Esconder seccao imagem de capa para visual; ajustar condicao de publicacao |
| `src/admin/pages/ArticleEditorPage.tsx` | Auto-preencher image_url da galeria ao publicar visual |
| `src/components/news/VisualCarousel.tsx` | Adicionar prop autoplay com embla-carousel-autoplay |
| `src/components/news/NewsCard.tsx` | Passar autoplay=true ao carousel no feed |
| `src/admin/components/media/MediaPicker.tsx` | Fixar botao de seleccao no fundo, scroll na grelha |
| `src/admin/components/editor/VisualEditor.tsx` | Usar sempre aspect-video nos thumbnails |

---

## Resultado Esperado

- Uma unica opcao de publicacao para noticias visuais (sem pedir imagem de capa separada)
- Seleccionar fotos na galeria e publicar directamente
- Carousel com autoplay no feed (4s por imagem, pausa ao interagir)
- MediaPicker com botao sempre visivel e imagens com scroll
- Thumbnails consistentes no editor independentemente do formato
