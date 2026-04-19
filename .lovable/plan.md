# 🚀 Plano Executivo — Fase 1

## Personalização leve + Acções IA no artigo

---

## 🎯 Objectivo

Implementar uma base funcional de **personalização do feed** e **integração útil de IA**, permitindo:

- adaptar o conteúdo ao comportamento do utilizador;
- aumentar retenção e tempo de leitura;
- tornar a IA parte activa da experiência;
- preparar o sistema para evoluções futuras (login, algoritmo, scroll contínuo).

---

## 📦 Escopo da Fase

### Incluído

- identificação anónima do utilizador;
- tracking de eventos (com controlo e optimização);
- tabela `user_events`;
- ranking simples por categoria;
- secção “Para si” no feed;
- acções IA no artigo (Resumir, Explicar, Impacto);
- tracking de interacções com IA.

### Não incluído

- login/autenticação;
- seguir temas;
- cards diferenciados;
- scroll contínuo entre artigos;
- selecção de texto com IA;
- algoritmo avançado de recomendação.

---

# 🧱 1. Identidade do utilizador (Híbrido)

## Implementação

Criar hook:

```
useAnonymousId.ts
```

### Comportamento

-   
gerar UUID no primeiro acesso;  

-   
guardar em:  

  - `localStorage` (`bnews_aid`)  

  -   
  cookie (fallback);  

-   
reutilizar em todas as sessões.  


### Estrutura preparada para futuro

-   
campo `user_id` já existe na base de dados;  

-   
permitirá migração futura para login sem refactor.  


---

# 🗄️ 2. Base de dados

## 2.1 Tabela `user_events`

### Estrutura


| Campo        | Tipo                      |
| ------------ | ------------------------- |
| id           | uuid (PK)                 |
| anonymous_id | text (indexed)            |
| user_id      | uuid (nullable)           |
| session_id   | text                      |
| event_type   | enum                      |
| article_id   | uuid (nullable)           |
| category     | text (slug)               |
| metadata     | jsonb                     |
| created_at   | timestamptz (default now) |


---

## 2.2 Enum `event_type`

```
CREATE TYPE event_type_enum AS ENUM (
  'impression',
  'view',
  'read_complete',
  'like',
  'save',
  'share',
  'ai_action'
);
```

---

## 2.3 Índices

```
(anonymous_id, created_at DESC)
(article_id)
(category)
```

---

## 2.4 Regras de segurança (RLS)

-   
INSERT permitido a `anon` e `authenticated`  

-   
SELECT apenas para admin/editor (analytics)  


---

## 2.5 Função de ranking

### `get_user_top_categories(anonymous_id, limit)`

#### Lógica:

-   
considerar últimos 30 dias;  

-   
aplicar pesos:  



| Evento        | Peso |
| ------------- | ---- |
| view          | 1    |
| read_complete | 3    |
| like          | 4    |
| save          | 5    |
| share         | 4    |
| ai_action     | 3    |


#### Output:

-   
lista de categorias ordenadas por score  


---

# ⚡ 3. Tracking de eventos (Frontend)

## 3.1 Hook principal

```
useTrackEvent.ts
```

### Função

```
track(eventType, payload)
```

---

## 3.2 Estratégia de envio (IMPORTANTE)

### ❌ Evitar

-   
INSERT directo a cada evento  


### ✔️ Implementar buffer

-   
guardar eventos numa queue local;  

-   
enviar em batch:  

  -   
  a cada 5 eventos OU  

  -   
  a cada 3–5 segundos  


---

## 3.3 Controlo de duplicação

Aplicar debounce para:

- `view`  

- `read_complete`  


---

## 3.4 Eventos a registar


| Evento        | Quando                   |
| ------------- | ------------------------ |
| impression    | card aparece no viewport |
| view          | artigo aberto            |
| read_complete | scroll ≥ 80%             |
| ai_action     | clique em acção IA       |


---

## 3.5 Metadata exemplo

```
{
  "duration_ms": 12000,
  "ai_action_type": "resumir",
  "source": "inline_prompt"
}
```

---

# 🧠 4. Personalização do Feed

## 4.1 Secção “Para si”

### Implementação

-   
baseada nas categorias mais consumidas;  

-   
usar função `get_user_top_categories`.  


---

## 4.2 Posicionamento (IMPORTANTE)

Não colocar no topo absoluto.

### Ordem correcta:

```
Hero
Tópicos do momento
Feed (2–3 artigos)
Para si
Restante feed
```

---

## 4.3 Lógica simples

-   
mostrar mais artigos das categorias top;  

-   
fallback para feed normal se não houver dados suficientes.  


---

# 🤖 5. IA no Artigo

## 5.1 Acções principais

Adicionar 3 botões:

```
[ Resumir ]
[ Explicar ]
[ Qual o impacto? ]
```

---

## 5.2 Posição

-   
entre hero e primeiro parágrafo  
  
OU  

-   
após 2–3 parágrafos  


---

## 5.3 Comportamento

Ao clicar:

1.   
scroll para o chat;  

2.   
preencher pergunta;  

3.   
focar input;  

4.   
não enviar automaticamente.  


---

## 5.4 Tracking

Evento:

```
ai_action
```

Metadata:

```
{
  "ai_action_type": "explicar"
}
```

---

# ⚙️ 6. Requisitos técnicos adicionais

## Performance

-   
lazy loading de imagens;  

-   
envio de eventos em batch;  

-   
evitar múltiplos re-renders.  


## UX

-   
scroll suave para chat;  

-   
feedback visual ao clicar nos botões;  

-   
loading states simples.  


---

# 📋 7. Ordem de implementação

## Fase 1 — Base

-   
criar `useAnonymousId`  

-   
criar tabela `user_events`  

-   
criar enum + índices  


## Fase 2 — Tracking

-   
implementar `useTrackEvent`  

-   
criar sistema de batch  

-   
adicionar eventos (view, impression)  


## Fase 3 — IA

-   
adicionar botões no artigo  

-   
integrar com chat  

-   
tracking de IA  


## Fase 4 — Personalização

-   
função `get_user_top_categories`  

-   
secção “Para si”  

-   
integração no feed  


## Fase 5 — Testes

-   
validar eventos  

-   
validar ranking  

-   
validar UX  


---

# ✅ 8. Critérios de sucesso

A fase está concluída quando:

-   
eventos estão a ser registados correctamente;  

-   
feed começa a adaptar-se ao utilizador;  

-   
IA é usada dentro do artigo;  

-   
“Para si” aparece com conteúdo relevante;  

-   
sistema está estável e sem duplicações;  

-   
não há impacto negativo na performance.  


---

# ⚠️ 9. Riscos e mitigação


| Risco                | Mitigação         |
| -------------------- | ----------------- |
| excesso de eventos   | batch + debounce  |
| dados inconsistentes | enum + validação  |
| UX confusa           | IA não automática |
| complexidade precoce | limitar escopo    |


---

# 🧠 10. Conclusão

Esta fase estabelece a base do produto como:

👉 **plataforma inteligente de notícias com IA**

Sem complexidade excessiva, mas com:

-   
aprendizagem de comportamento;  

-   
valor imediato para o utilizador;  

-   
estrutura pronta para escalar.