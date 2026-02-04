
# Transformacao Visual: B NEWS como Rede Social de Noticias

Redesenho completo para um look moderno tipo Instagram/Twitter, com foco em imagens grandes, scroll vertical fluido e integracao de publicidade nativa.

---

## 1. Hero com Carousel Visual

**Ficheiro:** `src/components/news/HeroChat.tsx`

**Actual:** Lista textual de sugestoes em botoes simples.

**Novo:**
- Manter titulo grande e campo de chat (70vh mobile)
- Remover lista textual de sugestoes ("Sugestoes de hoje")
- Adicionar carousel visual com 4 cards:
  - Imagem da noticia em destaque
  - Titulo sobreposto com gradiente
  - Botao "Conversar" sobreposto
- Usar Embla Carousel (ja instalado) para slideshow
- 1 dos 4 cards pode ser patrocinado (com etiqueta PATROCINADO)

**Estrutura do carousel:**
```text
+------------------------------------------+
|  [Imagem grande com gradiente escuro]    |
|                                          |
|  Titulo da noticia aqui                  |
|  [Conversar]                             |
+------------------------------------------+
   o   o   o   o  (indicadores)
```

---

## 2. Feed Estilo Rede Social

**Ficheiro:** `src/components/news/NewsCard.tsx`

**Actual:** Cards minimalistas sem imagem, em grid de 2 colunas no desktop.

**Novo layout vertical completo:**
```text
+----------------------------------+
| [IMAGEM GRANDE - aspect 16:9]    |
|                                  |
+----------------------------------+
| Economia  •  3 min               |
|                                  |
| Titulo completo da noticia       |
|                                  |
| Resumo em duas linhas cortadas   |
| com reticencias no fim...        |
|                                  |
| [Conversar]  [Abrir]  [Guardar]  |
+----------------------------------+
```

- Imagem ocupa topo do card (aspect-ratio 16:9)
- Categoria + tempo de leitura em linha
- Titulo completo (sem truncar)
- Lead de 2 linhas (line-clamp-2)
- Botoes: Conversar (primario com icone), Abrir (secundario), Guardar (icone)

**Ficheiro:** `src/components/news/NewsFeed.tsx`

**Actual:** Grid de 2 colunas no desktop.

**Novo:**
- Coluna unica sempre (mobile e desktop)
- Largura maxima de 600px centrada
- Scroll vertical infinito
- Inserir Sponsored Card a cada 8-10 noticias

---

## 3. Sponsored Cards (Publicidade)

**Novo ficheiro:** `src/components/news/SponsoredCard.tsx`

Estrutura identica ao NewsCard mas com:
- Etiqueta "PATROCINADO" no topo
- Imagem
- Titulo
- Link externo (botao "Saber mais")

**Mock data para teste:**
```typescript
const sponsoredAds = [
  {
    id: 'ad-1',
    title: 'Abra a sua conta no Millennium bim',
    imageUrl: 'https://...',
    sponsor: 'Millennium bim',
    link: '#'
  },
  // mais 2-3 anuncios de teste
];
```

---

## 4. Paleta de Cores Unificada

**Ficheiro:** `src/index.css`

**Remover:** Cores diferentes por categoria (verde, vermelho, amarelo, etc.)

**Nova paleta:**
- Roxo principal: `hsl(271, 81%, 50%)` - manter
- Roxo claro (badges): `hsl(271, 81%, 95%)`
- Cinza escuro (texto): `hsl(240, 10%, 20%)`
- Cinza medio (secundario): `hsl(240, 5%, 46%)`
- Branco (fundo): `hsl(0, 0%, 100%)`

Badges de categoria usam roxo claro com texto roxo escuro (monocromatico).

**Ficheiro:** `src/data/categories.ts`

**Actual:** Icones emoji coloridos (emoji, emoji, etc.)

**Novo:** Icones Lucide monocromaticos
```typescript
import { TrendingUp, Landmark, Users, Music, Cpu, Globe, Trophy } from 'lucide-react';

export const categories = [
  { id: 'economia', name: 'Economia', icon: TrendingUp },
  { id: 'politica', name: 'Politica', icon: Landmark },
  { id: 'sociedade', name: 'Sociedade', icon: Users },
  { id: 'entretenimento', name: 'Entretenimento', icon: Music },
  { id: 'tecnologia', name: 'Tecnologia', icon: Cpu },
  { id: 'internacional', name: 'Internacional', icon: Globe },
  { id: 'desporto', name: 'Desporto', icon: Trophy },
];
```

---

## 5. Sidebar Tendencias Visual

**Ficheiro:** `src/components/layout/RightSidebar.tsx`

**Actual:** Lista textual com numeros e titulos.

**Novo:** Cards visuais compactos
```text
+---------------------------+
| Tendencias                |
+---------------------------+
| [Imagem pequena] Titulo   |
| Categoria                 |
+---------------------------+
| [Imagem pequena] Titulo   |
| Categoria                 |
+---------------------------+
| [Imagem] PATROCINADO      |
| Titulo do anuncio         |
+---------------------------+
```

- Imagem quadrada pequena (48x48 ou 64x64)
- Titulo em 2 linhas max
- Badge de categoria pequeno
- Ultimo item pode ser patrocinado

---

## 6. CategoryChips e DesktopSidebar

**Ficheiro:** `src/components/news/CategoryChips.tsx`

**Alteracoes:**
- Remover emojis
- Adicionar icones Lucide monocromaticos
- Cores apenas roxo/cinza

**Ficheiro:** `src/components/layout/DesktopSidebar.tsx`

**Alteracoes:**
- Remover emojis
- Usar icones Lucide
- Manter estilo actual mas com icones

---

## 7. Tipos e Dados

**Ficheiro:** `src/types/news.ts`

Adicionar interface para anuncios:
```typescript
export interface SponsoredAd {
  id: string;
  title: string;
  imageUrl: string;
  sponsor: string;
  link: string;
}
```

**Ficheiro:** `src/data/ads.ts` (novo)

Mock data de 3-4 anuncios para demonstracao.

---

## Resumo de Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/news/HeroChat.tsx` | Adicionar carousel visual 4 cards |
| `src/components/news/NewsCard.tsx` | Layout vertical com imagem grande |
| `src/components/news/NewsFeed.tsx` | Coluna unica, inserir ads |
| `src/components/news/SponsoredCard.tsx` | NOVO - Card publicitario |
| `src/components/layout/RightSidebar.tsx` | Cards visuais em vez de lista |
| `src/components/news/CategoryChips.tsx` | Icones Lucide monocromaticos |
| `src/components/layout/DesktopSidebar.tsx` | Icones Lucide monocromaticos |
| `src/data/categories.ts` | Icones Lucide em vez de emojis |
| `src/data/ads.ts` | NOVO - Mock data publicidade |
| `src/types/news.ts` | Interface SponsoredAd |
| `src/index.css` | Remover cores categoria, uniformizar |
| `tailwind.config.ts` | Ajustar variaveis de cor |

---

## Resultado Visual Esperado

O site vai parecer uma mistura de:
- **Instagram** - Cards verticais com imagens grandes
- **Twitter** - Feed fluido de scroll infinito
- **Medium** - Tipografia limpa e elegante
- **ChatGPT** - Interface de chat integrada

Nao vai parecer um portal de noticias tradicional com grids e sidebars pesadas.
