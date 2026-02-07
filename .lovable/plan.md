
# Redesign do Carrossel, Slideshow Visual e Galeria de Imagens

## 1. Carrossel de Destaques da Homepage

### Problema Actual
O carrossel (em `HeroChat.tsx`, linhas 169-226) usa overlays escuros (`bg-gradient-to-t from-black/80`) com titulo e texto sobrepostos na imagem. Altura fixa de apenas `h-40`. Inclui texto "Conversar" dentro da imagem.

### Alteracoes

**Ficheiro: `src/components/news/HeroChat.tsx`**

Redesenhar o bloco do carrossel (linhas 178-213) para separar imagem e titulo:

- Remover o gradiente overlay (`bg-gradient-to-t from-black/80 via-black/40 to-transparent`)
- Remover o titulo e o bloco "Conversar" de dentro da imagem
- Aumentar a altura da imagem de `h-40` para `aspect-[16/10]` (mais alto que 16:9)
- Colocar o titulo FORA da imagem, abaixo, com padding `p-3`
- Card inteiro clicavel (ja esta com `motion.button`)
- Aplicar `rounded-xl` na imagem e no card
- Titulo com `font-display text-sm font-semibold line-clamp-2 leading-tight`

Nova estrutura do card:
```text
+----------------------------------+
| [IMAGEM - 100% limpa, sem texto] |
| [aspect-ratio 16/10, object-fit  |
|  cover, sem gradientes]          |
+----------------------------------+
| Titulo da noticia (fora da       |
| imagem, 2 linhas max)            |
+----------------------------------+
```

Para o card de anuncio patrocinado, aplicar a mesma altura e estrutura.

---

## 2. Slideshow de Fotografias (VisualCarousel) dentro dos Cards

### Problema Actual
O `VisualCarousel.tsx` no formato vertical usa `aspect-[4/5]` que e muito alto e quebra a grelha. As setas e dots ficam fora do card. As dimensoes variam entre formato vertical e horizontal.

### Alteracoes

**Ficheiro: `src/components/news/VisualCarousel.tsx`**

- Ambos os formatos (vertical e horizontal) devem usar `aspect-video` (16:9) como dimensao fixa do painel, IGUAL ao `AspectRatio` do `NewsCard` normal
- As imagens devem usar `object-cover` para preencher o painel sem alterar as dimensoes do card
- Setas de navegacao e dots DENTRO do painel (posicao absoluta), sem alterar a altura
- Remover a variacao de tamanho no formato vertical (o efeito de "imagem central grande, laterais pequenas" era bonito mas quebra a consistencia com os cards normais)
- Manter `rounded-xl` e `overflow-hidden` para conter tudo dentro do painel

O formato vertical vs horizontal passa a ser apenas uma diferenca de **como o carousel se comporta** (transicao/efeito), nao de dimensoes:
- Vertical: transicao tipo fade/slide suave, sem efeito de escala
- Horizontal: carousel classico standard

**Ficheiro: `src/components/news/NewsCard.tsx`**

- Remover o `onClick={(e) => e.preventDefault()}` no wrapper do VisualCarousel (linha 147) -- o carousel deve ser clicavel como link para o artigo
- Garantir que o VisualCarousel fica dentro do mesmo `AspectRatio ratio={16/9}` usado para artigos normais

---

## 3. Galeria de Imagens (Admin) -- Upload em Lote com Metadados

### Problema Actual
O botao "Carregar Imagens" (linhas 142-158 de `MediaPage.tsx`) usa um `<label>` com `<input type="file">` escondido que faz upload directo sem modal, sem previews, sem campos de titulo/legenda. Funciona, mas nao tem a UX pretendida.

### Alteracoes

**Novo ficheiro: `src/admin/components/media/MediaUploadModal.tsx`**

Criar modal completo de upload em lote:

```text
+--------------------------------------------------+
| CARREGAR IMAGENS                           [X]    |
|--------------------------------------------------|
|                                                    |
| +----------------------------------------------+ |
| |  Arraste imagens aqui ou clique para          | |
| |  seleccionar ficheiros                        | |
| |  JPG, PNG, WebP ate 10MB (max 5 ficheiros)   | |
| +----------------------------------------------+ |
|                                                    |
| [x] Aplicar mesmo titulo/legenda a todas          |
|                                                    |
| Titulo para todas: [___________________]          |
| Legenda para todas: [___________________]         |
|                                                    |
| -- OU por imagem: --                              |
|                                                    |
| +--------+  Titulo: [___________]                 |
| |  thumb |  Legenda: [___________]     [Remover]  |
| +--------+  Tags: [chip1] [chip2] [+]             |
|                                                    |
| +--------+  Titulo: [___________]                 |
| |  thumb |  Legenda: [___________]     [Remover]  |
| +--------+  Tags: [chip1] [+]                     |
|                                                    |
|                     [Cancelar]  [Carregar (2)]    |
+--------------------------------------------------+
```

Funcionalidades:
- Zona drag and drop + botao de seleccao
- Maximo 5 ficheiros por lote
- Apenas imagens (jpg/png/webp), max 10MB por ficheiro, com validacao e mensagens
- Preview thumbnail de cada imagem antes do upload
- Campos por imagem: Titulo (obrigatorio), Legenda (opcional), Tags (chips)
- Toggle "Aplicar a todas": quando activo, mostra campos globais e oculta individuais
- Botao "Remover" por imagem para tirar da fila
- Progresso de upload por imagem (barra ou spinner)
- Se uma imagem falhar, mostrar erro nessa imagem com botao "Tentar novamente"
- Apos sucesso: fechar modal, recarregar grelha, toast "Imagens carregadas com sucesso"

**Ficheiro: `src/admin/pages/MediaPage.tsx`**

- Substituir o `<label><input type="file">` por um `<Button>` que abre o `MediaUploadModal`
- Adicionar estado `showUploadModal` e renderizar o modal
- Manter toda a logica existente de visualizacao, edicao e eliminacao

**Ficheiro: `src/admin/hooks/useMedia.ts`**

- O hook `useUploadMedia` ja suporta `title`, `description` e `tags` como parametros -- nao precisa de alteracoes no hook
- Apenas o modal novo vai chamar `uploadMedia.mutateAsync({ file, title, description, tags })` com os campos preenchidos

---

## Resumo de Ficheiros

| Ficheiro | Accao |
|----------|-------|
| `src/components/news/HeroChat.tsx` | Redesenhar carrossel: imagem limpa + titulo fora |
| `src/components/news/VisualCarousel.tsx` | Padronizar dimensoes para aspect-video, setas/dots dentro do painel |
| `src/components/news/NewsCard.tsx` | Ajustar wrapper do VisualCarousel |
| `src/admin/components/media/MediaUploadModal.tsx` | **Novo** - Modal de upload em lote com metadados |
| `src/admin/pages/MediaPage.tsx` | Usar o novo modal em vez do input file directo |

---

## Secacao Tecnica

### HeroChat.tsx - Estrutura do card redesenhado
```tsx
<motion.button
  onClick={() => handleArticleChat(item.data.id)}
  className="group block w-full overflow-hidden rounded-xl border bg-card text-left"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  {/* Imagem limpa - sem overlay */}
  <div className="overflow-hidden">
    <img
      src={getValidImageUrl(item.data.imageUrl)}
      alt={item.data.title}
      className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-105"
      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
    />
  </div>
  {/* Titulo fora da imagem */}
  <div className="p-3">
    <h3 className="font-display text-sm font-semibold leading-tight line-clamp-2">
      {item.data.title}
    </h3>
  </div>
</motion.button>
```

### VisualCarousel.tsx - Padronizacao
- Remover o efeito de escala/opacidade no formato vertical
- Usar `aspect-video` em ambos os formatos
- Posicionar setas e dots com `absolute` dentro do container `overflow-hidden`
- Manter dots abaixo da imagem mas dentro do card

### MediaUploadModal.tsx - Estado interno
```tsx
interface UploadItem {
  file: File;
  preview: string;         // URL.createObjectURL
  title: string;
  caption: string;
  tags: string[];
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}
```
- Usa o hook `useUploadMedia` existente para cada ficheiro
- Validacao: tipo MIME (image/jpeg, image/png, image/webp), tamanho <= 10MB, max 5 ficheiros
- Cleanup de `URL.createObjectURL` no unmount
