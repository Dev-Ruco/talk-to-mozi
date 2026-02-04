
# Melhorias de Design Mobile-First para B NEWS

Redesenho completo da interface focado na experiência mobile e no chat com notícias.

---

## Alterações Visuais

### 1. Novo Logotipo
Substituir o logotipo actual pelo novo ficheiro de alta resolução no header.

### 2. Header Minimalista
Actual: Header com navegação completa e múltiplos links.

**Novo design:**
- Layout: Logo (esquerda) | Pesquisa + Guardados (direita)
- Remover todos os links de navegação do header
- Manter apenas ícones de Pesquisa e Guardados
- Altura reduzida para dar mais espaço ao conteúdo

### 3. Hero Chat Dominante (70% do ecrã mobile)
Actual: Hero com decorações, badge, e cards de sugestões

**Novo design:**
- Ocupar 70vh no mobile (quase ecrã inteiro)
- Fundo branco limpo, sem decorações visuais
- Título enorme centralizado: "O que aconteceu hoje em Moçambique?"
- Campo de chat grande com placeholder: "Pergunte algo sobre as notícias de hoje"
- Sugestões em lista simples abaixo do campo (texto sem cards)
- Estética minimalista inspirada no ChatGPT

### 4. Feed de Noticias Redesenhado
Actual: Cards com imagem, em grid

**Novo design:**
- Cards minimalistas sem imagem no feed principal
- Estrutura por card:
  - Categoria colorida + Tempo de leitura
  - Titulo forte
  - Resumo de 2 linhas
  - Botoes: Abrir, Conversar, Guardar
- Layout em coluna única no mobile
- Grid de 2 colunas no desktop

### 5. Layout Desktop com 3 Colunas
Actual: Sidebar esquerda e direita sempre visíveis

**Novo design:**
- Sidebar esquerda: Categorias (sempre visível)
- Centro: Hero + Feed
- Sidebar direita: Só aparece após scroll, com "Tendências"
- Implementar detecção de scroll para mostrar/esconder sidebar direita

### 6. Navegação Mobile Simplificada
- Manter bottom navigation
- Remover navegação duplicada do header

---

## Ficheiros a Modificar

| Ficheiro | Alterações |
|----------|------------|
| `src/assets/logo.png` | Substituir pelo novo logotipo |
| `src/components/layout/Header.tsx` | Header minimalista com apenas logo, pesquisa e guardados |
| `src/components/news/HeroChat.tsx` | Redesenho completo para 70vh, chat dominante, design limpo |
| `src/components/news/NewsCard.tsx` | Versão minimalista sem imagem, nova estrutura de botões |
| `src/components/news/NewsFeed.tsx` | Ajustar layout para coluna única mobile |
| `src/pages/Index.tsx` | Remover elementos extras, apenas Hero + Feed |
| `src/components/layout/Layout.tsx` | Ajustar para sidebar direita aparecer após scroll |
| `src/components/layout/RightSidebar.tsx` | Adicionar lógica de visibilidade por scroll |
| `src/pages/ArticlePage.tsx` | Reordenar elementos conforme especificação |

---

## Detalhes Técnicos

### Hero Chat (70vh mobile)
```text
+----------------------------------+
|                                  |
|    O que aconteceu hoje em       |
|        Moçambique?               |
|                                  |
| +------------------------------+ |
| | “Escreva qualquer tema: inflação, chuvas, política, dólar…”
     [>]
Exemplos do que pode perguntar:
inflação • combustível • chuvas
 • política • dólar • saúde 
• educação| |
| +------------------------------+ |
|                                  |
|  • Economia desceu 1% — entender?|
|  • Nova decisão do Banco Central |
|  • Chuvas afectam o norte        |
|  • Nova lei aprovada — o que muda|
|                                  |
+----------------------------------+
```

### Card de Notícia Minimalista
```text
+----------------------------------+
| Economia • 2 min                 |
|                                  |
| Título forte da notícia aqui     |
|                                  |
| Resumo breve em duas linhas que  |
| dá contexto sobre a notícia...   |
|                                  |
| [Conversar] como botão primário
 (destacado) Abrir secundário   |
+----------------------------------+
```

### Sidebar Direita com Scroll Detection
- Usar `useState` + `useEffect` com `IntersectionObserver` ou scroll position
- Só mostrar após o utilizador fazer scroll para além do Hero
- Conteúdo: Apenas "Tendências" (remover "Últimas" e outras secções)

### Ordem na Página do Artigo
1. Título
2. Meta informações (data, categoria, tempo de leitura)
3. Imagem
4. Texto (tipografia optimizada)
5. Bloco "Factos rápidos"
6. Notícias relacionadas
7. Chat com a notícia (no final)

Nova página: Pesquisa Inteligente (Chat Global)

Criar página /chat acessível pelo ícone de pesquisa no header e bottom nav.

Layout:

Título: “Pergunte algo sobre as notícias”

Campo de chat grande

Resultados aparecem como:

resposta explicativa

lista de notícias relacionadas

Funciona como um ChatGPT alimentado pelas notícias do site.

Extensões Críticas de UX para B NEWS (incluir no plano)

Estas melhorias refinam a experiência e tornam o produto verdadeiramente intuitivo, viciante e coerente com o conceito “conversar com as notícias”.

7. Transição Suave Hero → Feed
Objectivo

Evitar que o feed apareça de forma brusca após o Hero.

Implementação

Adicionar um separador visual logo após o Hero:

Texto:

“Últimas notícias de hoje”

Estilo discreto, tipografia leve, apenas para guiar o olhar do utilizador.

8. Comportamento Correcto do Chat no Hero
Objectivo

O Hero é apenas ponto de entrada, não local de resposta.

Implementação

Ao submeter uma pergunta no Hero:

Redireccionar automaticamente para a página /chat

A pergunta já vai preenchida no campo de chat

A resposta acontece apenas na página /chat

9. Botão “Conversar” com Identidade Visual Forte
Objectivo

Destacar a acção principal do produto.

Implementação no Card:

Botão primário: 💬 Conversar (com ícone)

Botão secundário: Abrir

Guardar discreto

10. Sinal de Inteligência no Card de Notícia
Objectivo

Mostrar que o sistema entende relações entre conteúdos.

Implementação

Adicionar no final do resumo uma linha pequena:

“Relacionado com: Banco de Moçambique, Taxa de juro”

Gerado automaticamente por IA.

11. Destaque do Chat na Página do Artigo
Objectivo

O chat não pode parecer secção de comentários.

Implementação

Antes do chat inserir um bloco com destaque:

Explore esta notícia com IA

Só depois apresentar o chat e as perguntas sugeridas.

12. Estrutura Correcta da Página /chat (Pesquisa Inteligente)
Objectivo

Transformar o site no “Google das notícias”.

Layout da resposta do chat:

Texto explicativo da IA

Bloco:

Notícias relacionadas

Cards de notícias ligadas ao tema

O chat nunca responde só com texto. Sempre liga ao conteúdo do site.

13. Botão Flutuante no Artigo (Mobile)
Objectivo

Incentivar o uso do chat enquanto lê.

Implementação

Durante a leitura do artigo em mobile, mostrar botão fixo no fundo:

💬 Conversar sobre esta notícia

Sempre visível até ao fim da página.

14. Micro-copy Correcta no Campo do Hero

Alterar placeholder para:

“Escreva qualquer tema: inflação, chuvas, política, dólar…”

E abaixo do campo:

Exemplos do que pode perguntar:
inflação • combustível • chuvas • política • dólar • saúde • educação

Regras de Comportamento do Sistema (UX Lógico + IA)

Estas regras definem como o site se comporta em uso real.

15. Regra de Prioridade do Chat

Em todo o site, a acção Conversar tem prioridade sobre Ler.

Aplicações:

No card: botão Conversar é primário

No artigo: botão flutuante Conversar (mobile)

No hero: entrada directa para /chat

16. Regra de Resposta do Chat (obrigatória)

O chat nunca responde apenas com texto.

Toda resposta da IA deve ter esta estrutura:

Explicação em texto simples

Bloco: Notícias relacionadas

Lista de cards clicáveis

Isto mantém o utilizador dentro do feed.

17. Regra de Contexto Automático (RAG)

Quando o utilizador conversa:

No artigo → chat só usa aquela notícia + relacionadas

No /chat → usa todas as notícias da base de dados

18. Regra de Continuidade

Depois de conversar, mostrar sempre no fim da resposta:

“Quer explorar mais sobre este tema?”

Com mais 3 cards.

19. Regra do Feed Inteligente

O feed não é cronológico puro.

Prioridade:

Notícias relacionadas com temas que o utilizador já conversou

Últimas notícias

Tendências

20. Regra do Estado Vazio

Se não houver notícias numa categoria:

Mostrar:

“Ainda não há notícias aqui. Experimente perguntar no chat sobre este tema.”

21. Regra de Performance (muito importante)

Feed carrega sem imagens (texto primeiro)

Imagens só dentro do artigo

Chat responde rápido (prioridade de carregamento)

Isto deixa o site extremamente rápido em mobile.

22. Regra de Descoberta

Após 3 interacções no site (abrir, conversar, guardar), mostrar sugestão discreta:

“Sabia que pode perguntar qualquer coisa sobre as notícias no topo da página?”

Educa o utilizador.

23. Regra do Botão Pesquisa

O ícone de pesquisa não abre um campo.
Abre directamente a página /chat.

Porque aqui pesquisar = conversar.

24. Regra de Identidade do Produto

O site nunca deve parecer:

portal tradicional

blog

jornal clássico

Deve sempre parecer:

uma interface para explorar informação com IA.

Resultado

Com esta secção adicionada, o seu documento deixa de ser:

plano de design

E passa a ser:

especificação funcional completa de produto.

Isto é exactamente o tipo de documento que equipas sérias usam para construir produtos digitais de raiz, sem ambiguidade.

Se quiser, o próximo passo já não é UX — é arquitectura técnica do RAG e do chat para isto funcionar na prática.

Plano de Integração de Publicidade — B NEWS (Venda Directa a Marcas)

Este plano define como a publicidade será integrada no B NEWS de forma elegante, não intrusiva e alinhada com o conceito central do produto: conversar com as notícias.

Princípio orientador

A publicidade no B NEWS:

Não interrompe a leitura

Integra-se na experiência do utilizador

Respeita a credibilidade editorial

Aproveita a inovação do chat como diferencial

Formatos Oficiais de Publicidade
1. Sponsored Card no Feed (formato principal)

Descrição
Card publicitário inserido no feed de notícias, visualmente semelhante aos restantes, com identificação clara:

PATROCINADO / PUBLICIDADE

Posicionamento

Inserido entre notícias reais

Frequência: 1 em cada 8–10 cards (mobile) | 1 em cada 10–12 (desktop)

Estrutura do card

Título forte

2 linhas de texto

Botão “Saber mais”

Link externo ou landing page da marca

2. Conteúdo de Marca (Branded Content)

Descrição
Artigo patrocinado publicado dentro do site, com categoria própria:

Conteúdo de Marca

Características

Mesmo layout das notícias

Selo identificativo no topo e no rodapé

Pode incluir chat no final do artigo

3. Patrocínio do Chat (formato premium e exclusivo)

Descrição
Associação da marca à funcionalidade mais inovadora do site.

Implementação
Antes do chat no artigo:

Chat apoiado por: [Marca]

A marca patrocina a funcionalidade, sem interferir no conteúdo.

4. Bloco Patrocinado na Página /chat (Pesquisa Inteligente)

Descrição
Bloco contextual apresentado no fim da resposta do chat.

Estrutura

Etiqueta: Sugestão patrocinada

Relacionado com o tema pesquisado pelo utilizador

Link para serviço/produto da marca

Regras de Credibilidade e Transparência

Para proteger a confiança do leitor:

Publicidade sempre claramente identificada

Nunca disfarçar publicidade como notícia

Nenhuma marca influencia conteúdos editoriais

Nenhuma marca influencia respostas da IA

Ausência total de pop-ups ou formatos intrusivos

Integração Técnica no Produto
Área	Implementação
Feed	Inserção programada de Sponsored Cards
Artigo	Banner discreto após 2º/3º parágrafo + patrocínio do chat
Chat do artigo	Bloco “Chat apoiado por”
Página /chat	Bloco “Sugestão patrocinada” contextual
Pacotes Comerciais a Disponibilizar
Pacote Presença

1 Sponsored Card por dia

Duração: 30 dias

Pacote Destaque

1 Sponsored Card por dia

1 Conteúdo de Marca por mês

Presença no bloco patrocinado da página /chat

Pacote Autoridade

1 Sponsored Card por dia

2 Conteúdos de Marca por mês

Patrocínio do chat em todos os artigos

Presença prioritária na página /chat

Tipologia de Marcas Prioritárias

Este modelo é especialmente adequado para:

Bancos e instituições financeiras

Operadoras de telecomunicações

Seguradoras

Universidades privadas

Fintechs

Energia, combustíveis e retalho

Objectivo Estratégico

Posicionar o B NEWS como:

O primeiro portal noticioso em Moçambique onde as marcas não aparecem como anúncios, mas como parte de uma experiência inteligente de exploração da informação.
