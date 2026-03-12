

# Fix: Aumentar altura da imagem nos cards

O problema actual: a imagem tem `h-[180px]` com `object-cover`, o que corta demasiado as fotos. A solução é aumentar a altura da imagem para mostrar mais da foto.

## Alterações

**`src/components/news/NewsCard.tsx`** — default variant (linhas 122, 130):
- Mudar `h-[180px]` para `h-[220px]` nos containers de imagem (tanto para visual carousel como para imagem normal)

**`src/components/news/SponsoredCard.tsx`** — feed variant (linha 56):
- Mudar `h-[180px]` para `h-[220px]` no container de imagem

**`src/components/news/HeroChat.tsx`** — carousel cards (linha 201):
- Mudar `h-[140px]` para `h-[160px]` nos cards do carrossel do hero

Isto dá 40px extra de altura à foto, mostrando muito mais da imagem original sem alterar a largura dos cards.

