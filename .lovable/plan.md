O plano está **muito bem montado**. Tem lógica editorial, separa bem os blocos e já está suficientemente claro para implementação no Lovable. Ainda assim, eu refinaria alguns pontos para ficar **mais sólido, mais coerente e mais pronto para executar sem ambiguidades**.

## Versão refinada do plano

# Plano final — Reestruturação da Homepage B NEWS

Vou reestruturar a homepage do **B NEWS** para lhe dar uma hierarquia mais editorial, melhorar a percepção da **Pesquisa IA** e tornar a secção de notícias mais forte visualmente, mais actual e mais útil para descoberta de conteúdo.

O redesenho vai manter a identidade visual existente da marca — **roxo principal, fundo cinza claro e cards brancos** — mas com melhor organização, mais densidade informativa e maior clareza de navegação.

---

## 1. Estrutura final da homepage

```txt
Header
BreakingNewsBanner
HeroSearch
TrendingTopics
FeaturedStory
LatestNewsBlock
MostReadList
CategoryBlocks
FinalCta
Footer

```

### Ordem editorial pretendida

- primeiro, o utilizador percebe imediatamente que pode **perguntar**
- depois, vê os **temas do momento**
- em seguida, encontra um **grande destaque editorial**
- depois, consome as **últimas notícias**
- a seguir, descobre o que está em evidência
- por fim, explora por categorias e volta a ser convidado a usar a IA

---

## 2. Componentes a criar ou refactorizar

### 2.1 `HeroSearch.tsx`

Substitui a função actual do `HeroChat` como bloco principal da homepage.

#### Objectivo

Transformar a pesquisa IA no elemento mais forte da página, com aspecto de assistente noticioso e não apenas de campo de pesquisa.

#### Conteúdo

- título principal:  
**Pergunte o que aconteceu hoje em Moçambique**
- subtítulo:  
**Receba respostas rápidas com base nas notícias mais recentes, organizadas por tema, sector ou acontecimento.**
- linha de confiança:  
**Actualizado com notícias recentes e verificadas**
- input principal com botão de envio
- placeholder dinâmico com rotação de exemplos
- chips clicáveis que **preenchem o input**, sem disparar pesquisa automática

#### Comportamento

- o utilizador pode clicar num chip e depois editar antes de enviar
- o botão envia para `/chat?q={query}`
- se o input estiver vazio, o botão fica desactivado ou mostra estado neutro
- placeholder muda a cada 4 segundos, sem ser intrusivo

#### Estilo

- bloco centralizado
- `py-16 md:py-20`
- largura confortável: `max-w-4xl` ou `max-w-5xl`
- tipografia forte no título
- botão de envio visualmente destacado

#### Nota importante

O carrossel actual deve sair deste bloco para evitar ruído visual. O hero deve ser limpo, directo e focado em conversão.

---

### 2.2 `TrendingTopics.tsx`

Novo bloco para reforçar descoberta rápida.

#### Objectivo

Dar ao utilizador pontos de entrada imediatos para temas quentes do dia.

#### Conteúdo

- título:  
**🔥 Tópicos do momento**
- lista horizontal com chips maiores
- tópicos reais puxados de `useTrendingTopics`

#### Comportamento

- clique num tópico leva directamente para `/chat?q={topic}`
- scroll horizontal suave em mobile
- em desktop, mostrar o máximo possível antes de quebrar

#### Sugestão

Evitar tópicos demasiado genéricos. Priorizar expressões editoriais reais, por exemplo:

- Crise de combustíveis
- Chuvas intensas
- Inflação
- Investimento chinês
- Energia
- Educação

---

### 2.3 `FeaturedStory.tsx`

Substitui o actual destaque por um bloco mais editorial.

#### Objectivo

Criar um ponto focal forte logo após os tópicos do momento.

#### Layout

- grid de 2 colunas em `md+`
- imagem grande à esquerda
- conteúdo textual à direita
- em mobile, empilhar imagem em cima e texto em baixo

#### Conteúdo

- categoria
- título com maior peso visual
- lead ou resumo com 2 a 3 linhas
- metadata
- botão “Ler notícia →”

#### Fonte de dados

- usar `useFeaturedArticle`

#### Nota de qualidade

Se não houver artigo destacado, fazer fallback automático para o artigo mais recente com imagem.

---

### 2.4 `LatestNewsBlock.tsx`

Novo bloco para substituir a actual secção de últimas notícias.

#### Objectivo

Dar mais ritmo, hierarquia e densidade informativa.

#### Layout

- à esquerda: card principal grande
- à direita: lista lateral com 3 a 5 notícias compactas
- em mobile: primeiro o card principal, depois a lista

#### Estrutura

**Card principal**

- imagem 16:9
- categoria
- título
- resumo curto
- metadata

**Lista lateral**

- miniatura pequena
- categoria
- título
- tempo ou data
- sem resumo

#### Regra editorial

Se a secção se chama “Últimas notícias”, então os itens devem ser realmente recentes. Se o feed tiver conteúdo antigo, é melhor mudar o título para:

- **Últimas actualizações**  
ou
- **Destaques recentes**

Isto evita incoerência editorial.

---

### 2.5 `MostReadList.tsx`

Novo bloco para reforçar prova social e descoberta.

#### Objectivo

Mostrar o que está a captar mais atenção.

#### Estrutura

- header:  
**Mais lidas**
- lista numerada de 1 a 5
- número grande à esquerda
- título da notícia à direita
- metadata opcional por baixo

#### Situação actual

Como a base de dados não tem coluna de visualizações, o comportamento real de “mais lidas” ainda não existe.

#### Decisão de implementação

Para já, implementar como solução transitória:

**Opção A**

- usar artigos recentes
- ordenar por `published_at DESC`
- renomear para **Em destaque** se se quiser máxima correcção editorial

#### Recomendação

Se o nome **Mais lidas** for mantido já, convém assumir isso como aproximação temporária e não solução final.

---

### 2.6 `CategoryBlocks.tsx`

Novo bloco de exploração por secção editorial.

#### Objectivo

Permitir leitura mais estruturada por áreas temáticas.

#### Estrutura

Criar 3 blocos iniciais:

- Economia
- Política
- Sociedade

Cada bloco deve ter:

- cabeçalho com nome da categoria
- link “Ver mais”
- 3 cards horizontais ou mini-cards

#### Sugestão

Se a base permitir, puxar os artigos mais recentes por categoria.  
Se não houver 3 artigos suficientes numa categoria, mostrar apenas os disponíveis sem quebrar o layout.

---

### 2.7 `FinalCta.tsx`

Bloco final para voltar a empurrar o uso da IA.

#### Objectivo

Fechar a homepage com acção clara.

#### Conteúdo

**Não encontrou o que procura?**  
**Pergunte directamente à nossa Pesquisa IA e receba um resumo imediato das notícias.**

Botão:  
**Fazer uma pergunta**

#### Comportamento

- botão aponta para `/chat`
- bloco centralizado
- fundo suave com `bg-primary/10`

---

## 3. Alterações no `Index.tsx`

### Nova ordem dos blocos

- Header
- BreakingNewsBanner
- HeroSearch
- TrendingTopics
- FeaturedStory
- LatestNewsBlock
- MostReadList
- CategoryBlocks
- FinalCta
- Footer

### Remoções da homepage

- remover `CategoryChips` da homepage
- remover `NewsFeed` da homepage na forma actual
- manter estes componentes disponíveis para outras páginas, se necessário

### Nota

`HeroChat.tsx` pode ser preservado no projecto temporariamente, mas já não deve ser usado na homepage.

---

## 4. Sistema visual a reforçar

### Cards

```txt
rounded-2xl shadow-sm hover:shadow-md transition

```

### Imagens

```txt
aspect-[16/9] object-cover

```

### Títulos

```txt
font-display font-bold

```

### Interacções

- hover na imagem com leve zoom
- hover no título com mudança subtil para a cor primária
- skeleton loading para blocos com fetch
- lazy loading de imagens

---

## 5. Melhorias funcionais importantes

### 5.1 Hero mais inteligente

- placeholder rotativo
- chips que preenchem o campo
- botão apenas activo quando houver texto

### 5.2 Consistência editorial

- evitar chamar “Últimas notícias de hoje” a conteúdos antigos
- usar metadata clara:
  - Hoje
  - Há 1h
  - Actualizado às 14h20
  - ou data completa, quando necessário

### 5.3 Responsividade

- garantir boa leitura em mobile
- evitar blocos com espaço vazio excessivo
- listas laterais devem empilhar bem em ecrãs pequenos

---

## 6. Nota técnica — recomendação melhorada sobre “Mais lidas”

A observação técnica está correcta, mas eu escreveria assim para ficar mais executável:

### Fase actual

Implementar o bloco com os artigos mais recentes e apresentar como:

- **Em destaque**, se quisermos rigor editorial imediato  
ou
- **Mais lidas**, apenas como solução provisória de interface

### Melhoria futura recomendada

Adicionar na tabela `articles`:

```txt
view_count INTEGER DEFAULT 0

```

Depois:

- incrementar contagem ao abrir `ArticlePage`
- ordenar por `view_count DESC`
- filtrar por janela temporal, por exemplo últimos 7 dias, para não cristalizar artigos antigos

Isto tornará o bloco realmente útil.

---

## 7. Lista final de ficheiros


| Ficheiro                                  | Acção                                     |
| ----------------------------------------- | ----------------------------------------- |
| `src/components/news/HeroSearch.tsx`      | Novo                                      |
| `src/components/news/TrendingTopics.tsx`  | Novo                                      |
| `src/components/news/FeaturedStory.tsx`   | Novo                                      |
| `src/components/news/LatestNewsBlock.tsx` | Novo                                      |
| `src/components/news/MostReadList.tsx`    | Novo                                      |
| `src/components/news/CategoryBlocks.tsx`  | Novo                                      |
| `src/components/news/FinalCta.tsx`        | Novo                                      |
| `src/pages/Index.tsx`                     | Reorganizar                               |
| `src/components/news/HeroChat.tsx`        | Preservar, mas deixar sem uso na homepage |


---

## 8. Ajustes finais que eu recomendo acrescentar ao plano

Estas três notas valem muito a pena incluir:

### A. Estados vazios

Cada bloco deve ter fallback visual quando não houver dados suficientes.

Exemplos:

- sem notícia destacada
- sem tópicos do momento
- sem artigos em determinada categoria

### B. Loading states

Todos os blocos que dependem de fetch devem ter skeletons simples e consistentes.

### C. Coerência de imagens

Se uma notícia não tiver imagem:

- usar placeholder editorial limpo
- nunca deixar o card quebrado visualmente

---

## 9. Veredicto sobre o plano

O plano está **bom e executável**.  
Com estes refinamentos, passa a estar **mais preciso, mais editorialmente correcto e mais robusto para implementação real**.

A única correcção que eu faria mesmo questão de deixar clara é esta:

### Em vez de:

> “Mais lidas” com `published_at DESC`

### Melhor:

> implementar já como **Em destaque** e só mudar para **Mais lidas** quando existir `view_count`

Isso evita prometer ao utilizador algo que o sistema ainda não mede.

Se quiser, no passo seguinte eu posso transformar isto num **prompt final, limpo e profissional para colar directamente no Lovable**, já em tom técnico de execução.