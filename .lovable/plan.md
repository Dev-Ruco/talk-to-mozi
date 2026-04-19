

## Plano: Componente BreakingNewsBanner

### Análise
O schema da tabela `articles` já possui um campo `tags` (ARRAY) e `highlight_type` (text). Vou usar a tag `"ultima-hora"` no array `tags` como critério de detecção, combinado com `published_at` nas últimas 2 horas e `status = 'published'`.

Não existe campo `breaking: true` na tabela — usar `tags @> ARRAY['ultima-hora']` é suficiente e flexível (editor adiciona a tag no editor de artigos via TagsInput existente).

### Implementação

**1. Novo componente: `src/components/news/BreakingNewsBanner.tsx`**
- Hook React Query que busca o artigo mais recente com:
  - `status = 'published'`
  - `tags` contém `'ultima-hora'`
  - `published_at >= now() - 2 hours`
  - Ordenado por `published_at DESC`, limit 1
- Verifica `sessionStorage.getItem('dismissed-breaking-' + article.id)` — se existir, não renderiza
- Estrutura visual:
  - Container: `bg-[#DC2626] text-white w-full min-h-[44px] animate-slide-down`
  - Esquerda: ponto branco `h-2 w-2 rounded-full bg-white animate-pulse`
  - Texto: título do artigo (clicável → `navigate('/artigo/' + id)`)
  - Direita: botão `✕` com handler que guarda ID no sessionStorage e força re-render via state local
- Padding responsivo: `px-4 py-3 md:py-2`, texto `text-sm font-medium`, line-clamp-1 em mobile

**2. Animação: adicionar a `tailwind.config.ts`**
- Keyframe `slide-down`: `from { transform: translateY(-100%); opacity: 0 } to { transform: translateY(0); opacity: 1 }`
- Animation: `slide-down: slide-down 0.3s ease-out`

**3. Integração no Layout: `src/components/layout/Layout.tsx`**
- Renderizar `<BreakingNewsBanner />` logo após `<Header />` e antes do `<div className="container">`
- Ocupa largura total do ecrã (fora do container)

### Ficheiros alterados

| Ficheiro | Alteração |
|---|---|
| `src/components/news/BreakingNewsBanner.tsx` | Criar componente novo |
| `tailwind.config.ts` | Adicionar keyframe e animation `slide-down` |
| `src/components/layout/Layout.tsx` | Renderizar banner abaixo do Header |

### Notas
- O banner é dispensável por sessão (sessionStorage), volta a aparecer numa nova sessão se ainda estiver dentro da janela de 2h
- Editores marcam notícias de última hora simplesmente adicionando a tag `ultima-hora` no editor de artigos
- Refetch a cada 60 segundos para detectar novas breaking news em tempo real

