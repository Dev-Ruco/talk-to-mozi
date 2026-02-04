

# Remover Etiquetas de IA e Substituir "Guardar" por "Amei"

Vou remover todas as referências a "Alimentado por IA" e substituir a funcionalidade de guardar notícias pelo estilo Instagram "Amei" (coração).

---

## Alterações a Fazer

### 1. Remover Etiquetas de IA

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/news/HeroChat.tsx` | Remover badge "Alimentado por IA" (linhas 45-48) |
| `src/components/news/ArticleChat.tsx` | Mudar "Explore esta notícia com IA" para "Explore esta notícia" |
| `src/pages/ChatPage.tsx` | Remover texto "A IA encontra e explica" |

### 2. Substituir "Guardar" por "Amei" (Estilo Instagram)

| Ficheiro | Alteração |
|----------|-----------|
| `src/hooks/useSavedArticles.ts` | Renomear para `useLikedArticles.ts` com funções: `likeArticle`, `unlikeArticle`, `toggleLike`, `isLiked` |
| `src/components/news/NewsCard.tsx` | Mudar ícone `Bookmark` para `Heart`, texto "Guardar" para "Amei" |
| `src/pages/ArticlePage.tsx` | Mudar botão de Bookmark para Heart com texto "Amei/Curti" |
| `src/components/layout/Header.tsx` | Mudar ícone Bookmark para Heart no header |
| `src/components/layout/MobileNav.tsx` | Mudar "Guardados" para "Amei" com ícone Heart |
| `src/pages/SavedPage.tsx` | Renomear para página "Amei" com textos actualizados |
| `src/pages/ProfilePage.tsx` | Actualizar referência para "artigos curtidos" |
| `src/App.tsx` | Manter rota `/guardados` mas actualizar se necessário |

---

## Detalhes Técnicos

### Novo Hook: `useLikedArticles.ts`
```typescript
// Renomear funções
saveArticle → likeArticle
unsaveArticle → unlikeArticle  
toggleSave → toggleLike
isSaved → isLiked
savedIds → likedIds
```

### Ícone Heart (Instagram Style)
- **Vazio**: `<Heart className="h-4 w-4" />`
- **Cheio (liked)**: `<Heart className="h-4 w-4 fill-red-500 text-red-500" />`

A cor vermelha segue o padrão do Instagram para o coração.

### Textos Actualizados

| Local | Antes | Depois |
|-------|-------|--------|
| NewsCard botão | "Guardar" | (sem texto, só ícone Heart) |
| ArticlePage botão | "Guardado/Guardar" | "Amei/Curtir" |
| MobileNav | "Guardados" | "Amei" |
| SavedPage título | "Guardados" | "Amei" |
| SavedPage descrição | "notícias que guardou" | "notícias que curtiu" |
| Estado vazio | "Nenhuma notícia guardada" | "Nenhuma notícia curtida" |

---

## Ficheiros a Modificar

1. `src/hooks/useSavedArticles.ts` → Renomear hook e funções
2. `src/components/news/HeroChat.tsx` → Remover badge IA
3. `src/components/news/ArticleChat.tsx` → Remover referência IA
4. `src/pages/ChatPage.tsx` → Remover texto IA
5. `src/components/news/NewsCard.tsx` → Heart + vermelho
6. `src/pages/ArticlePage.tsx` → Heart + texto Amei
7. `src/components/layout/Header.tsx` → Heart no header
8. `src/components/layout/MobileNav.tsx` → Heart + "Amei"
9. `src/pages/SavedPage.tsx` → Textos "Amei" e Heart
10. `src/pages/ProfilePage.tsx` → Referência actualizada

---

## Resultado Visual

### Card de Notícia (antes vs depois)
```text
Antes: [Conversar] [Abrir] [🔖]
Depois: [Conversar] [Abrir] [❤️]
```

### Navegação Mobile
```text
Antes: 🏠 📂 💬 🔖 👤
Depois: 🏠 📂 💬 ❤️ 👤
```

O coração ficará vermelho quando curtido, similar ao Instagram.


Plano de Animações e Micro-Interacções (UX Interactivo)

Objectivo: tornar o B NEWS mais intuitivo, fluido e “viciante” como uma rede social, sem poluir a UI. As animações devem ser rápidas, suaves e discretas.

Regras gerais

Duração: 120–220ms (rápidas)

Easing: suave (ease-out)

Nunca usar animações longas, piscantes ou agressivas

Preferir “motion” para feedback de acção (não para decoração)

A) Animações ao clicar (Click / Tap)
1. Botões (Conversar / Abrir / Saber mais)

Estado hover (desktop): leve aumento (scale 1.02) + sombra suave

Estado active (click): compressão curta (scale 0.98)

Estado loading: spinner pequeno no botão (sem bloquear a página)

Ficheiros

NewsCard.tsx

SponsoredCard.tsx

HeroChat.tsx

2. Coração “Amei” (Instagram style)

Interacção

Ao clicar em ❤️:

animação “pop” (scale 0.9 → 1.15 → 1.0)

se liked: preencher + ficar vermelho

se unliked: retirar fill + voltar ao normal

Duplo clique na imagem do card (desktop/mobile):

faz “like” automaticamente

aparece coração grande no centro da imagem por 300ms e desaparece

Ficheiros

NewsCard.tsx

ArticlePage.tsx

Hook useLikedArticles.ts

3. Chips de categoria

Ao seleccionar:

transição suave de fundo e texto

pequeno underline animado (ou pill glow subtil)

Ao clicar:

scroll suave até ao feed (se for na home)

Ficheiros

CategoryChips.tsx

B) Animações ao rolar (Scroll)
4. Entrada dos cards no feed (scroll reveal)

Quando um card entra no viewport:

fade-in + slight translateY (8px → 0)

apenas 1 vez por card

Ficheiros

NewsFeed.tsx

NewsCard.tsx

(usar IntersectionObserver)

5. Sidebar “Tendências” (desktop)

Mantém-se oculta no topo

Surge com transição (fade + slide) após passar o Hero

Não pode “saltar” nem aparecer abrupto

Ficheiros

RightSidebar.tsx

Layout.tsx

6. Header (desktop) e Top bar (mobile)

Ao rolar para baixo:

header encolhe ligeiramente (altura menor)
Ao rolar para cima:

header reaparece

Objectivo: mais espaço para conteúdo.

Ficheiros

Header.tsx

C) Animações de navegação (Page transitions)
7. Abrir notícia

Ao clicar num card:

transição suave de página (fade rápido)

manter scroll position ao voltar (back)

Ficheiros

ArticlePage.tsx

router / layout

8. Abrir /chat (a partir do Hero)

Ao submeter pergunta:

animação curta de “envio” (ícone avião)

transição para /chat com input já preenchido

Ficheiros

HeroChat.tsx

ChatPage.tsx

D) Animações no Chat (para parecer vivo)
9. Resposta do chat (typing + skeleton)

Mostrar “skeleton” (blocos cinza) durante carregamento

Mensagem surge com fade + 6px translate

Cards “Notícias relacionadas” entram em cascata (stagger leve)

Ficheiros

ChatPage.tsx

ArticleChat.tsx

E) Feedback de estados (muito importante)
10. Guardar removido → “Amei”

Toast discreto no canto:

“Adicionado a Amei”

“Removido de Amei”
Duração 1.5s.

Ficheiros

useLikedArticles.ts

NewsCard.tsx

ArticlePage.tsx

11. Infinite scroll

Quando carrega mais notícias:

spinner discreto no fim do feed

placeholder cards (skeleton) para parecer contínuo

Ficheiros

NewsFeed.tsx

F) Biblioteca / Implementação (sugestão)

Preferência:

Framer Motion para micro-interacções e page transitions

IntersectionObserver para scroll reveal

Evitar libs pesadas extra

Resultado esperado

Interface com “vida”

Acções claras e satisfatórias (coração, botões, abrir notícia)

Sensação de produto premium, moderno e intuitivo

Sem ruído visual nem exageros

