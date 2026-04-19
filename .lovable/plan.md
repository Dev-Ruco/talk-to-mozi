Perfeito — aqui tens o **plano completo, consolidado e já organizado de forma executiva e técnica**, incorporando tudo o que definiste:

- captura **não massiva**
- deduplicação forte
- limite diário
- reescrita **manual**
- IA usada só quando decidires
- entrada híbrida:
  - automática
  - texto puro
  - link
- sites bloqueados sem captura automática
- controlo de custos
- pipeline editorial mais limpo

---

# PLANO COMPLETO — REESTRUTURAÇÃO DO PIPELINE EDITORIAL B NEWS

## 1. Objectivo geral

Corrigir o pipeline editorial do B NEWS para passar de um modelo de **captura excessiva + reescrita automática falhada** para um modelo de **captura controlada, filtragem rigorosa, deduplicação forte e reescrita manual assistida por IA**.

O sistema deve:

- captar menos, mas melhor;
- nunca repetir artigos;
- respeitar limites diários de captura;
- permitir ingestão manual por texto ou link;
- bloquear captura automática em fontes problemáticas;
- usar IA apenas nos artigos escolhidos editorialmente;
- reduzir drasticamente falhas, desperdício e consumo desnecessário.

---

## 2. Princípios do novo pipeline

### 2.1 A IA deixa de ser motor automático

A IA passa a ser uma **ferramenta editorial de reformulação**, não um mecanismo automático de processamento massivo.

### 2.2 Nem tudo deve ser captado

A captura deve ser limitada por:

- relevância;
- fonte;
- duplicação;
- capacidade editorial;
- limite diário.

### 2.3 Nada deve ser repetido

O sistema deve impedir repetição por:

- URL;
- título normalizado;
- similaridade textual.

### 2.4 O editor passa a decidir o que vai para reescrita

Só artigos seleccionados por ti entram na fila de reformulação.

### 2.5 O sistema passa a ter duas entradas

- **automática**: RSS/feeds autorizados
- **manual**: texto puro ou link

---

# 3. Novo desenho do pipeline

## Fluxo final desejado

```text
CAPTURA AUTOMÁTICA (RSS permitidos)
                │
                ▼
        FILTRO + DEDUPE + LIMITE
                │
                ▼
        ARTICLES (captured / reviewed)
                │
                ├──> DESCARTAR
                ├──> PUBLICAR DIRECTO (opcional)
                └──> ENVIAR PARA REESCRITA (manual)
                               │
                               ▼
                         REWRITE_QUEUE
                               │
                               ▼
                          IA REFORMULA
                               │
                               ▼
                      ARTICLE REWRITTEN
                               │
                               ▼
                           PUBLICAÇÃO

```

## Entrada manual em paralelo

```text
MANUAL TEXT / MANUAL LINK
             │
             ▼
        ARTICLES (captured / reviewed)
             │
             ├──> DESCARTAR
             ├──> PUBLICAR DIRECTO
             └──> ENVIAR PARA REESCRITA

```

---

# 4. Fases de implementação

---

## FASE 1 — CONTROLO IMEDIATO E TRAVAGEM DE DESPERDÍCIO

### Objectivo

Parar o desperdício actual, travar falhas em massa e impedir crescimento do backlog.

### Acções principais

#### 4.1 Desligar reescrita automática

Remover qualquer auto-rewrite embutido na captura.

A IA deixa de correr:

- dentro do `news-agent`
- em qualquer fluxo automático inline

A reescrita passa a ser apenas:

- manual
- por botão no admin
- via `rewrite_queue`

#### 4.2 Aplicar limite diário de capturas

Criar limite global diário.

Exemplo inicial:

- `MAX_CAPTURE_PER_DAY = 100`  
ou
- `MAX_CAPTURE_PER_DAY = 200`

Quando o limite for atingido:

- o cron deixa de inserir novos artigos nesse dia;
- apenas regista log de bloqueio por limite.

#### 4.3 Pausar ou reduzir um dos colectores

Actualmente tens dois colectores com sobreposição:

- `news-agent`
- `rss-fetch`

Nesta fase, a recomendação é:

- **manter um como principal**
- **desligar ou reduzir o outro**

Recomendação preferencial:

- manter `rss-fetch`
- desactivar o papel de captura do `news-agent`

#### 4.4 Limpar backlog

Os artigos acumulados devem ser:

- descartados, se irrelevantes/duplicados;
- ou marcados com `discarded`

Não devem continuar a alimentar a ilusão de pipeline activo.

---

## FASE 2 — DEDUPLICAÇÃO FORTE E FILTRAGEM ANTES DA INSERÇÃO

### Objectivo

Garantir que o sistema só guarda artigos relevantes e nunca repete o mesmo conteúdo.

### Acções principais

#### 4.5 Deduplicação em 3 camadas

### Camada 1 — URL

Se `source_url` já existir:

- não inserir

### Camada 2 — título normalizado

Normalizar:

- lowercase
- remover espaços extra
- remover pontuação
- remover stopwords principais

Comparar com base guardada.

Se igual:

- não inserir

### Camada 3 — similaridade título + lead

Comparar:

- título
- lead/excerto inicial

Se similaridade acima do limiar definido:

- rejeitar

Limiar sugerido:

- 0.80 a 0.85

### Regra final

Se qualquer uma das três camadas acusar duplicação:

- **não inserir artigo**

#### 4.6 Filtragem antes da captura

Antes de gravar o artigo, aplicar filtros determinísticos:

- fonte activa
- fonte permitida para auto-captura
- idioma
- palavras incluídas
- palavras excluídas
- frescura temporal
- qualidade mínima do conteúdo

Resultado:

- muito menos artigos entram
- muito mais artigos entram já com qualidade

---

## FASE 3 — ENTRADA HÍBRIDA: AUTOMÁTICA + MANUAL

### Objectivo

Permitir que o sistema trabalhe também com conteúdos que não podem ou não devem ser captados automaticamente.

### Acções principais

#### 4.7 Criar captura manual por texto puro

No admin, criar opção:  
**Adicionar notícia manualmente**

Modo 1:

- título
- lead
- corpo
- fonte
- categoria
- data, se necessário

O sistema guarda como:

- artigo captado manualmente
- pronto para revisão, publicação ou reescrita

#### 4.8 Criar captura manual por link

Modo 2:

- colar URL

Comportamento:

- tentar extrair conteúdo, se permitido
- se não for possível, guardar:
  - link
  - título
  - metadados mínimos

E depois permitir:

- completar manualmente
- enviar para reescrita
- publicar

#### 4.9 Bloquear captura automática em certas fontes

Nem todos os sites devem ser captados automaticamente.

O sistema deve suportar:

- fontes com captura automática permitida
- fontes só para ingestão manual
- fontes bloqueadas

---

# 5. Modelo funcional da captura híbrida

## Tipos de entrada

### Automática

- RSS / Atom / feed permitido

### Manual texto

- colagem de conteúdo pelo editor

### Manual link

- colagem de URL para extracção ou referência

---

# 6. Estrutura da base de dados

---

## 6.1 Tabela `articles` — campos novos ou ajustados

Além dos campos existentes, incluir ou garantir:


| Campo            | Tipo             | Finalidade                       |
| ---------------- | ---------------- | -------------------------------- |
| status           | text             | estado editorial                 |
| source_type      | text             | rss / manual / link              |
| ingestion_method | text             | auto / manual_text / manual_link |
| original_url     | text             | URL original                     |
| original_content | text             | conteúdo bruto                   |
| normalized_title | text             | dedupe                           |
| similarity_hash  | text nullable    | dedupe auxiliar                  |
| is_duplicate     | boolean          | marcação                         |
| duplicate_of     | uuid nullable    | referência ao artigo original    |
| curation_score   | integer nullable | score editorial                  |
| captured_at      | timestamptz      | data de entrada                  |


---

## 6.2 Estados editoriais recomendados

A tabela `articles` deve passar a trabalhar com estados claros:

- `captured`
- `filtered`
- `reviewed`
- `queued`
- `rewritten`
- `published`
- `discarded`

### Significado

- `captured`: entrou no sistema
- `filtered`: passou filtros técnicos
- `reviewed`: já foi visto editorialmente
- `queued`: enviado para IA
- `rewritten`: reformulado
- `published`: publicado
- `discarded`: rejeitado

---

## 6.3 Tabela `sources_config`

Criar tabela de configuração de fontes.


| Campo              | Tipo    |
| ------------------ | ------- |
| id                 | uuid    |
| source_name        | text    |
| source_url         | text    |
| active             | boolean |
| allow_auto_capture | boolean |
| allow_manual       | boolean |
| blocked            | boolean |
| priority           | integer |
| language           | text    |
| include_keywords   | text[]  |
| exclude_keywords   | text[]  |
| max_items_per_run  | integer |


### Regras

- `blocked = true` → não capturar
- `allow_auto_capture = false` → só manual
- `active = false` → ignorar

---

## 6.4 Tabela `rewrite_queue`

Garantir que a fila só recebe artigos por decisão manual.

Campos essenciais:

- id
- article_id
- status
- attempts
- created_at
- processed_at
- error_message
- queued_by

Estados:

- `pending`
- `processing`
- `completed`
- `failed`

---

# 7. Regras de captura automática

### 7.1 Limite diário

Não captar acima do tecto diário.

### 7.2 Limite por execução

Cada fonte pode ter:

- `max_items_per_run`

### 7.3 Captura só de fontes activas

Ignorar qualquer fonte:

- inactiva
- bloqueada
- sem auto-captura

### 7.4 Deduplicação obrigatória antes do insert

Nenhum artigo deve ser gravado sem passar por:

- URL
- título normalizado
- similaridade textual

### 7.5 Frescura temporal

Só captar artigos dentro da janela definida, por exemplo:

- últimas 24h
- últimas 48h

---

# 8. Novo papel da IA

## 8.1 O que a IA faz

A IA passa a ser usada apenas para:

- reformular artigos seleccionados
- melhorar título
- gerar lead
- organizar corpo
- extrair quick facts, se necessário

## 8.2 O que a IA deixa de fazer

A IA deixa de:

- procurar artigos
- decidir o que entra
- processar backlog inteiro
- reescrever tudo automaticamente

## 8.3 Como optimizar o payload

Sempre que possível, enviar para IA apenas:

- título original
- lead
- excertos principais
- fonte
- categoria
- link original

Evitar mandar artigo inteiro se não for necessário.

---

# 9. Fluxo editorial manual

## No admin, para cada artigo, devem existir opções:

- **Ver**
- **Descartar**
- **Publicar directo**
- **Enviar para reescrita**

## Regras

- só artigos escolhidos vão para `rewrite_queue`
- nada entra automaticamente na fila
- publicação pode ser:
  - directa
  - após reescrita

---

# 10. Interface do admin — nova funcionalidade

## 10.1 Botão principal

**+ Adicionar notícia manual**

## 10.2 Modal com 2 separadores

### Separador 1 — Texto puro

Campos:

- título
- lead
- conteúdo
- fonte
- categoria
- URL opcional

### Separador 2 — Link

Campos:

- URL
- categoria
- fonte opcional

Comportamento:

- extrair se possível
- senão guardar link e permitir complemento manual

---

# 11. Deduplicação — política oficial

## Regra máxima

**Jamais repetir artigos**

Para isso, o sistema deve:

### Bloquear inserção se:

- URL já existir
- título normalizado coincidir
- similaridade textual superar o limiar

### Opcional

Se quiseres manter histórico, em vez de ignorar totalmente:

- marcar como `is_duplicate = true`
- referenciar `duplicate_of`

Mas não deve aparecer no fluxo editorial normal.

---

# 12. Rate limit e estabilidade da reescrita

## 12.1 Processamento da fila

A fila deve processar:

- 1 artigo por vez
- com limite por hora

Exemplo:

- 10 a 20 reescritas por hora

## 12.2 Retry inteligente

Se houver 429 ou erro transitório:

- reintentar com atraso progressivo
- máximo 3 tentativas

Depois:

- marcar como `failed`

## 12.3 Sem reprocessamento agressivo

Não insistir infinitamente em itens falhados.

---

# 13. Prioridades por impacto e esforço

## Prioridade 1 — impacto máximo / esforço baixo a médio

1. desligar auto-rewrite
2. aplicar limite diário de captura
3. reforçar dedupe
4. filtrar antes de inserir
5. limpar backlog

## Prioridade 2 — impacto alto / esforço médio

6. criar fila manual de reescrita
7. criar configuração de fontes
8. criar captura manual por texto e link
9. limitar processamento IA

## Prioridade 3 — impacto estrutural / esforço maior

10. unificar colector principal
11. normalizar estados editoriais
12. melhorar painel de triagem

---

# 14. Critérios de sucesso

O plano será considerado bem sucedido quando:

- o número de capturas diárias ficar controlado;
- deixarem de entrar duplicados;
- a IA deixar de falhar em massa;
- só artigos escolhidos forem reformulados;
- o editor puder adicionar notícias manualmente;
- fontes problemáticas deixarem de ser captadas automaticamente;
- o backlog deixar de crescer sem controlo;
- a taxa de publicação real aumentar.

---

# 15. Resultado esperado

## Antes

- muita captura
- pouco controlo
- reescrita automática falhada
- duplicação potencial
- desperdício editorial e técnico

## Depois

- captura limitada
- dedupe forte
- entrada híbrida
- fluxo editorial controlado
- IA usada com critério
- custo reduzido
- pipeline sustentável

---

# 16. Resumo executivo final

O B NEWS deve abandonar o modelo de ingestão massiva com reescrita automática e adoptar um pipeline editorial híbrido, controlado e assistido. A captura automática passa a ser limitada e fortemente filtrada, a deduplicação torna-se obrigatória em várias camadas, e a reescrita com IA deixa de ser automática para passar a depender de decisão editorial. Paralelamente, o sistema passa a aceitar ingestão manual por texto ou link, incluindo suporte para fontes que não permitem captura automática. O resultado é um pipeline mais leve, mais estável, mais económico e muito mais alinhado com controlo editorial real.

Se quiseres, no próximo passo eu posso transformar isto em **plano técnico por módulo**, com:

- base de dados,
- cron,
- admin,
- fila,
- regras de dedupe,
- e UX do painel.  
  
Perfeito — aqui tens o **plano completo, consolidado e já organizado de forma executiva e técnica**, incorporando tudo o que definiste:
  - captura **não massiva**
  - deduplicação forte
  - limite diário
  - reescrita **manual**
  - IA usada só quando decidires
  - entrada híbrida:
    - automática
    - texto puro
    - link
  - sites bloqueados sem captura automática
  - controlo de custos
  - pipeline editorial mais limpo
  ---
  # PLANO COMPLETO — REESTRUTURAÇÃO DO PIPELINE EDITORIAL B NEWS
  ## 1. Objectivo geral
  Corrigir o pipeline editorial do B NEWS para passar de um modelo de **captura excessiva + reescrita automática falhada** para um modelo de **captura controlada, filtragem rigorosa, deduplicação forte e reescrita manual assistida por IA**.
  O sistema deve:
  - captar menos, mas melhor;
  - nunca repetir artigos;
  - respeitar limites diários de captura;
  - permitir ingestão manual por texto ou link;
  - bloquear captura automática em fontes problemáticas;
  - usar IA apenas nos artigos escolhidos editorialmente;
  - reduzir drasticamente falhas, desperdício e consumo desnecessário.
  ---
  ## 2. Princípios do novo pipeline
  ### 2.1 A IA deixa de ser motor automático
  A IA passa a ser uma **ferramenta editorial de reformulação**, não um mecanismo automático de processamento massivo.
  ### 2.2 Nem tudo deve ser captado
  A captura deve ser limitada por:
  - relevância;
  - fonte;
  - duplicação;
  - capacidade editorial;
  - limite diário.
  ### 2.3 Nada deve ser repetido
  O sistema deve impedir repetição por:
  - URL;
  - título normalizado;
  - similaridade textual.
  ### 2.4 O editor passa a decidir o que vai para reescrita
  Só artigos seleccionados por ti entram na fila de reformulação.
  ### 2.5 O sistema passa a ter duas entradas
  - **automática**: RSS/feeds autorizados
  - **manual**: texto puro ou link
  ---
  # 3. Novo desenho do pipeline
  ## Fluxo final desejado
  ```text
  CAPTURA AUTOMÁTICA (RSS permitidos)
                  │
                  ▼
          FILTRO + DEDUPE + LIMITE
                  │
                  ▼
          ARTICLES (captured / reviewed)
                  │
                  ├──> DESCARTAR
                  ├──> PUBLICAR DIRECTO (opcional)
                  └──> ENVIAR PARA REESCRITA (manual)
                                 │
                                 ▼
                           REWRITE_QUEUE
                                 │
                                 ▼
                            IA REFORMULA
                                 │
                                 ▼
                        ARTICLE REWRITTEN
                                 │
                                 ▼
                             PUBLICAÇÃO

  ```
  ## Entrada manual em paralelo
  ```text
  MANUAL TEXT / MANUAL LINK
               │
               ▼
          ARTICLES (captured / reviewed)
               │
               ├──> DESCARTAR
               ├──> PUBLICAR DIRECTO
               └──> ENVIAR PARA REESCRITA

  ```
  ---
  # 4. Fases de implementação
  ---
  ## FASE 1 — CONTROLO IMEDIATO E TRAVAGEM DE DESPERDÍCIO
  ### Objectivo
  Parar o desperdício actual, travar falhas em massa e impedir crescimento do backlog.
  ### Acções principais
  #### 4.1 Desligar reescrita automática
  Remover qualquer auto-rewrite embutido na captura.
  A IA deixa de correr:
  - dentro do `news-agent`
  - em qualquer fluxo automático inline
  A reescrita passa a ser apenas:
  - manual
  - por botão no admin
  - via `rewrite_queue`
  #### 4.2 Aplicar limite diário de capturas
  Criar limite global diário.
  Exemplo inicial:
  - `MAX_CAPTURE_PER_DAY = 100`  
  ou
  - `MAX_CAPTURE_PER_DAY = 200`
  Quando o limite for atingido:
  - o cron deixa de inserir novos artigos nesse dia;
  - apenas regista log de bloqueio por limite.
  #### 4.3 Pausar ou reduzir um dos colectores
  Actualmente tens dois colectores com sobreposição:
  - `news-agent`
  - `rss-fetch`
  Nesta fase, a recomendação é:
  - **manter um como principal**
  - **desligar ou reduzir o outro**
  Recomendação preferencial:
  - manter `rss-fetch`
  - desactivar o papel de captura do `news-agent`
  #### 4.4 Limpar backlog
  Os artigos acumulados devem ser:
  - descartados, se irrelevantes/duplicados;
  - ou marcados com `discarded`
  Não devem continuar a alimentar a ilusão de pipeline activo.
  ---
  ## FASE 2 — DEDUPLICAÇÃO FORTE E FILTRAGEM ANTES DA INSERÇÃO
  ### Objectivo
  Garantir que o sistema só guarda artigos relevantes e nunca repete o mesmo conteúdo.
  ### Acções principais
  #### 4.5 Deduplicação em 3 camadas
  ### Camada 1 — URL
  Se `source_url` já existir:
  - não inserir
  ### Camada 2 — título normalizado
  Normalizar:
  - lowercase
  - remover espaços extra
  - remover pontuação
  - remover stopwords principais
  Comparar com base guardada.
  Se igual:
  - não inserir
  ### Camada 3 — similaridade título + lead
  Comparar:
  - título
  - lead/excerto inicial
  Se similaridade acima do limiar definido:
  - rejeitar
  Limiar sugerido:
  - 0.80 a 0.85
  ### Regra final
  Se qualquer uma das três camadas acusar duplicação:
  - **não inserir artigo**
  #### 4.6 Filtragem antes da captura
  Antes de gravar o artigo, aplicar filtros determinísticos:
  - fonte activa
  - fonte permitida para auto-captura
  - idioma
  - palavras incluídas
  - palavras excluídas
  - frescura temporal
  - qualidade mínima do conteúdo
  Resultado:
  - muito menos artigos entram
  - muito mais artigos entram já com qualidade
  ---
  ## FASE 3 — ENTRADA HÍBRIDA: AUTOMÁTICA + MANUAL
  ### Objectivo
  Permitir que o sistema trabalhe também com conteúdos que não podem ou não devem ser captados automaticamente.
  ### Acções principais
  #### 4.7 Criar captura manual por texto puro
  No admin, criar opção:  
  **Adicionar notícia manualmente**
  Modo 1:
  - título
  - lead
  - corpo
  - fonte
  - categoria
  - data, se necessário
  O sistema guarda como:
  - artigo captado manualmente
  - pronto para revisão, publicação ou reescrita
  #### 4.8 Criar captura manual por link
  Modo 2:
  - colar URL
  Comportamento:
  - tentar extrair conteúdo, se permitido
  - se não for possível, guardar:
    - link
    - título
    - metadados mínimos
  E depois permitir:
  - completar manualmente
  - enviar para reescrita
  - publicar
  #### 4.9 Bloquear captura automática em certas fontes
  Nem todos os sites devem ser captados automaticamente.
  O sistema deve suportar:
  - fontes com captura automática permitida
  - fontes só para ingestão manual
  - fontes bloqueadas
  ---
  # 5. Modelo funcional da captura híbrida
  ## Tipos de entrada
  ### Automática
  - RSS / Atom / feed permitido
  ### Manual texto
  - colagem de conteúdo pelo editor
  ### Manual link
  - colagem de URL para extracção ou referência
  ---
  # 6. Estrutura da base de dados
  ---
  ## 6.1 Tabela `articles` — campos novos ou ajustados
  Além dos campos existentes, incluir ou garantir:

  | Campo            | Tipo             | Finalidade                       |
  | ---------------- | ---------------- | -------------------------------- |
  | status           | text             | estado editorial                 |
  | source_type      | text             | rss / manual / link              |
  | ingestion_method | text             | auto / manual_text / manual_link |
  | original_url     | text             | URL original                     |
  | original_content | text             | conteúdo bruto                   |
  | normalized_title | text             | dedupe                           |
  | similarity_hash  | text nullable    | dedupe auxiliar                  |
  | is_duplicate     | boolean          | marcação                         |
  | duplicate_of     | uuid nullable    | referência ao artigo original    |
  | curation_score   | integer nullable | score editorial                  |
  | captured_at      | timestamptz      | data de entrada                  |

  ---
  ## 6.2 Estados editoriais recomendados
  A tabela `articles` deve passar a trabalhar com estados claros:
  - `captured`
  - `filtered`
  - `reviewed`
  - `queued`
  - `rewritten`
  - `published`
  - `discarded`
  ### Significado
  - `captured`: entrou no sistema
  - `filtered`: passou filtros técnicos
  - `reviewed`: já foi visto editorialmente
  - `queued`: enviado para IA
  - `rewritten`: reformulado
  - `published`: publicado
  - `discarded`: rejeitado
  ---
  ## 6.3 Tabela `sources_config`
  Criar tabela de configuração de fontes.

  | Campo              | Tipo    |
  | ------------------ | ------- |
  | id                 | uuid    |
  | source_name        | text    |
  | source_url         | text    |
  | active             | boolean |
  | allow_auto_capture | boolean |
  | allow_manual       | boolean |
  | blocked            | boolean |
  | priority           | integer |
  | language           | text    |
  | include_keywords   | text[]  |
  | exclude_keywords   | text[]  |
  | max_items_per_run  | integer |

  ### Regras
  - `blocked = true` → não capturar
  - `allow_auto_capture = false` → só manual
  - `active = false` → ignorar
  ---
  ## 6.4 Tabela `rewrite_queue`
  Garantir que a fila só recebe artigos por decisão manual.
  Campos essenciais:
  - id
  - article_id
  - status
  - attempts
  - created_at
  - processed_at
  - error_message
  - queued_by
  Estados:
  - `pending`
  - `processing`
  - `completed`
  - `failed`
  ---
  # 7. Regras de captura automática
  ### 7.1 Limite diário
  Não captar acima do tecto diário.
  ### 7.2 Limite por execução
  Cada fonte pode ter:
  - `max_items_per_run`
  ### 7.3 Captura só de fontes activas
  Ignorar qualquer fonte:
  - inactiva
  - bloqueada
  - sem auto-captura
  ### 7.4 Deduplicação obrigatória antes do insert
  Nenhum artigo deve ser gravado sem passar por:
  - URL
  - título normalizado
  - similaridade textual
  ### 7.5 Frescura temporal
  Só captar artigos dentro da janela definida, por exemplo:
  - últimas 24h
  - últimas 48h
  ---
  # 8. Novo papel da IA
  ## 8.1 O que a IA faz
  A IA passa a ser usada apenas para:
  - reformular artigos seleccionados
  - melhorar título
  - gerar lead
  - organizar corpo
  - extrair quick facts, se necessário
  ## 8.2 O que a IA deixa de fazer
  A IA deixa de:
  - procurar artigos
  - decidir o que entra
  - processar backlog inteiro
  - reescrever tudo automaticamente
  ## 8.3 Como optimizar o payload
  Sempre que possível, enviar para IA apenas:
  - título original
  - lead
  - excertos principais
  - fonte
  - categoria
  - link original
  Evitar mandar artigo inteiro se não for necessário.
  ---
  # 9. Fluxo editorial manual
  ## No admin, para cada artigo, devem existir opções:
  - **Ver**
  - **Descartar**
  - **Publicar directo**
  - **Enviar para reescrita**
  ## Regras
  - só artigos escolhidos vão para `rewrite_queue`
  - nada entra automaticamente na fila
  - publicação pode ser:
    - directa
    - após reescrita
  ---
  # 10. Interface do admin — nova funcionalidade
  ## 10.1 Botão principal
  **+ Adicionar notícia manual**
  ## 10.2 Modal com 2 separadores
  ### Separador 1 — Texto puro
  Campos:
  - título
  - lead
  - conteúdo
  - fonte
  - categoria
  - URL opcional
  ### Separador 2 — Link
  Campos:
  - URL
  - categoria
  - fonte opcional
  Comportamento:
  - extrair se possível
  - senão guardar link e permitir complemento manual
  ---
  # 11. Deduplicação — política oficial
  ## Regra máxima
  **Jamais repetir artigos**
  Para isso, o sistema deve:
  ### Bloquear inserção se:
  - URL já existir
  - título normalizado coincidir
  - similaridade textual superar o limiar
  ### Opcional
  Se quiseres manter histórico, em vez de ignorar totalmente:
  - marcar como `is_duplicate = true`
  - referenciar `duplicate_of`
  Mas não deve aparecer no fluxo editorial normal.
  ---
  # 12. Rate limit e estabilidade da reescrita
  ## 12.1 Processamento da fila
  A fila deve processar:
  - 1 artigo por vez
  - com limite por hora
  Exemplo:
  - 10 a 20 reescritas por hora
  ## 12.2 Retry inteligente
  Se houver 429 ou erro transitório:
  - reintentar com atraso progressivo
  - máximo 3 tentativas
  Depois:
  - marcar como `failed`
  ## 12.3 Sem reprocessamento agressivo
  Não insistir infinitamente em itens falhados.
  ---
  # 13. Prioridades por impacto e esforço
  ## Prioridade 1 — impacto máximo / esforço baixo a médio
  1. desligar auto-rewrite
  2. aplicar limite diário de captura
  3. reforçar dedupe
  4. filtrar antes de inserir
  5. limpar backlog
  ## Prioridade 2 — impacto alto / esforço médio
  6. criar fila manual de reescrita
  7. criar configuração de fontes
  8. criar captura manual por texto e link
  9. limitar processamento IA
  ## Prioridade 3 — impacto estrutural / esforço maior
  10. unificar colector principal
  11. normalizar estados editoriais
  12. melhorar painel de triagem
  ---
  # 14. Critérios de sucesso
  O plano será considerado bem sucedido quando:
  - o número de capturas diárias ficar controlado;
  - deixarem de entrar duplicados;
  - a IA deixar de falhar em massa;
  - só artigos escolhidos forem reformulados;
  - o editor puder adicionar notícias manualmente;
  - fontes problemáticas deixarem de ser captadas automaticamente;
  - o backlog deixar de crescer sem controlo;
  - a taxa de publicação real aumentar.
  ---
  # 15. Resultado esperado
  ## Antes
  - muita captura
  - pouco controlo
  - reescrita automática falhada
  - duplicação potencial
  - desperdício editorial e técnico
  ## Depois
  - captura limitada
  - dedupe forte
  - entrada híbrida
  - fluxo editorial controlado
  - IA usada com critério
  - custo reduzido
  - pipeline sustentável
  ---
  # 16. Resumo executivo final
  O B NEWS deve abandonar o modelo de ingestão massiva com reescrita automática e adoptar um pipeline editorial híbrido, controlado e assistido. A captura automática passa a ser limitada e fortemente filtrada, a deduplicação torna-se obrigatória em várias camadas, e a reescrita com IA deixa de ser automática para passar a depender de decisão editorial. Paralelamente, o sistema passa a aceitar ingestão manual por texto ou link, incluindo suporte para fontes que não permitem captura automática. O resultado é um pipeline mais leve, mais estável, mais económico e muito mais alinhado com controlo editorial real.
  Se quiseres, no próximo passo eu posso transformar isto em **plano técnico por módulo**, com:
  - base de dados,
  - cron,
  - admin,
  - fila,
  - regras de dedupe,
  - e UX do painel.