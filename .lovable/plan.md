Perfeito. Aqui vai um **plano executivo**, mais directo, objectivo e orientado à implementação, para entregar ao programador ou colar no Lovable como guia de execução.

# Plano executivo — Redesign da página de artigo do B NEWS

## 1. Objectivo do projecto

Transformar a página de artigo do B NEWS numa experiência de leitura moderna, contínua e integrada com IA, deixando de parecer uma página noticiosa tradicional e passando a funcionar como extensão natural do feed principal.

O foco é:

- melhorar a retenção de leitura;
- reduzir fricção;
- integrar IA no fluxo do artigo;
- aumentar continuidade editorial;
- preparar a base para futuras evoluções.

---

## 2. Resultado esperado

No fim desta implementação, a página de artigo deverá:

- ter leitura mais confortável e visualmente mais premium;
- manter o utilizador dentro do ecossistema do produto;
- incentivar interacção com IA sem parecer um bloco solto;
- ligar melhor o artigo ao feed;
- apresentar continuidade de leitura com próximos conteúdos;
- funcionar bem em desktop e mobile.

---

## 3. Escopo da fase actual

### Incluído nesta fase

- barra de progresso de leitura;
- botão “Voltar ao feed” com lógica correcta;
- hero do artigo redesenhado;
- área de acções melhorada;
- corpo do artigo com melhor tipografia e respiração;
- bloco IA inserido no meio do artigo;
- refactor do bloco de chat no fim;
- secção “Continuar a ler” em coluna única;
- preview do próximo artigo com prefetch;
- ajustes de responsividade e micro-interacções.

### Fora desta fase

- auto-load completo do próximo artigo;
- `pushState` dinâmico da URL;
- sistema avançado de likes;
- double-click na imagem;
- tracking avançado de leitura;
- personalização por comportamento do utilizador.

---

## 4. Entregáveis

### Entregável 1 — Nova estrutura da página de artigo

A página passa a ter esta ordem:

1. ReadingProgressBar
2. BackToFeed
3. ArticleHero
4. ArticleActions
5. ArticleBody intro
6. InlineAIPrompt
7. ArticleBody resto
8. QuickFacts opcional
9. ArticleChat
10. ContinueReading
11. NextArticlePreview

---

### Entregável 2 — Nova experiência visual e funcional

- layout centrado com largura controlada;
- leitura mais respirada;
- integração da IA no meio e no fim do artigo;
- continuidade editorial com próximos artigos;
- comportamento consistente com a homepage feed-first.

---

## 5. Componentes a criar

### `ReadingProgressBar.tsx`

Responsável por mostrar progresso de leitura no topo da página.

### `BackToFeed.tsx`

Responsável por voltar ao feed correctamente:

- `navigate(-1)` quando vier do feed;
- `/` quando não houver origem conhecida.

### `ArticleHero.tsx`

Responsável pelo topo editorial:

- imagem;
- categoria;
- título;
- lead;
- metadata.

### `ArticleActions.tsx`

Responsável pelos botões:

- Conversar;
- Curtir;
- Partilhar.

### `ArticleBody.tsx`

Responsável por renderizar o corpo do artigo com tipografia optimizada e divisão lógica antes e depois do bloco IA.

### `InlineAIPrompt.tsx`

Responsável por inserir um bloco curto no meio da leitura com perguntas sugeridas.

### `ContinueReading.tsx`

Responsável por mostrar 2 a 3 artigos em coluna única, com estilo alinhado ao feed.

### `NextArticlePreview.tsx`

Responsável por mostrar o próximo artigo no fim da leitura e fazer prefetch quando entrar em viewport.

---

## 6. Componentes a refactorizar

### `ArticleChat.tsx`

Deve ser simplificado visualmente e adaptado para:

- aceitar `initialQuestion`;
- preencher input automaticamente;
- focar o campo;
- não enviar automaticamente.

### `ArticlePage.tsx`

Deve passar a ser o orquestrador da nova estrutura e deixar de concentrar demasiada lógica visual num único ficheiro.

### `FeedPostCard.tsx`

Deve passar `state: { fromFeed: true }` ao navegar para um artigo, para permitir retorno correcto ao feed.

---

## 7. Decisões funcionais

### Navegação de retorno

Só usar `navigate(-1)` quando o artigo for aberto a partir do feed. Caso contrário, voltar para a homepage.

### Inserção do bloco IA

O bloco IA deve aparecer:

- após o 2.º parágrafo em artigos curtos;
- após o 3.º parágrafo em artigos mais longos.

### Chat

Quando o utilizador clicar num chip do bloco IA:

- fazer scroll suave até ao chat;
- preencher a pergunta;
- focar o input;
- aguardar submissão manual.

### Próximo artigo

Nesta fase, mostrar apenas um preview do próximo artigo, sem carregamento automático inline.

---

## 8. Requisitos visuais

### Layout

- container principal: `max-w-2xl mx-auto px-4`
- leitura centrada;
- muito espaço em branco;
- evitar caixas pesadas.

### Tipografia

- título forte;
- lead destacada;
- corpo com `leading-8`;
- espaçamento vertical entre parágrafos.

### Cores

- fundo claro;
- branco nos blocos;
- roxo como cor primária;
- cinzas suaves para metadata e suporte.

### Interacções

- hover suave;
- zoom leve nas imagens;
- fade-in curto no carregamento;
- skeleton ao abrir a página.

---

## 9. Requisitos técnicos

### React / estrutura

- separar claramente apresentação e lógica;
- manter `ArticlePage.tsx` limpo;
- reaproveitar componentes do feed quando fizer sentido.

### Scroll e viewport

- usar `IntersectionObserver` para `NextArticlePreview`;
- usar scroll suave para saltar para o chat.

### Performance

- lazy loading de imagens;
- prefetch do próximo artigo;
- skeleton de carregamento;
- evitar lógica pesada na primeira renderização.

---

## 10. Ordem de execução

### Fase 1 — Base estrutural

- criar `ReadingProgressBar`
- criar `BackToFeed`
- criar `ArticleHero`
- criar `ArticleActions`

### Fase 2 — Leitura e IA

- criar `ArticleBody`
- inserir lógica de split
- criar `InlineAIPrompt`
- refactorizar `ArticleChat`

### Fase 3 — Continuidade editorial

- criar `ContinueReading`
- criar `NextArticlePreview`
- ligar prefetch

### Fase 4 — Polimento final

- hover
- animações leves
- skeletons
- responsividade
- consistência visual com homepage

---

## 11. Critérios de aceitação

O trabalho será considerado concluído quando:

- a página de artigo estiver visualmente mais leve e mais moderna;
- o utilizador conseguir voltar ao feed sem perder contexto;
- a IA estiver integrada no meio e no fim do artigo;
- a leitura estiver mais confortável;
- a secção de continuidade estiver em coluna única;
- o próximo artigo aparecer como preview no fim;
- a experiência estiver estável em desktop e mobile.

---

## 12. Riscos a evitar

- complicar demasiado a primeira versão;
- introduzir auto-load total do próximo artigo demasiado cedo;
- misturar demasiadas lógicas num único componente;
- tornar a IA visualmente invasiva;
- transformar a página de artigo numa salada de blocos.

---

## 13. Recomendação estratégica

A implementação deve priorizar **solidez, clareza e fluidez**.  
A primeira versão deve resolver bem a experiência de leitura e a integração da IA. Funcionalidades mais ambiciosas, como scroll contínuo real entre artigos, devem entrar apenas numa segunda fase.

---

## 14. Resumo executivo final

Esta intervenção tem como finalidade reposicionar a página de artigo do B NEWS como uma experiência de leitura contemporânea, integrada com IA e coerente com a lógica feed-first da plataforma. A prioridade é aumentar conforto, retenção e continuidade editorial, criando uma base sólida para futuras evoluções de personalização e consumo contínuo.

Se quiser, eu posso agora transformar isto num **plano executivo ainda mais curto, em formato de pontos de aprovação para director/produto**.