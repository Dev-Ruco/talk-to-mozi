
# Dashboard CRM Editorial - B NEWS

Implementacao completa de um backoffice profissional para gestao editorial, com pipeline de noticias, agente de IA, gestao de fontes e publicidade.

---

## Fase 1: Infraestrutura Base

### 1.1 Integracao Supabase (Lovable Cloud)

Activar o Supabase via Lovable Cloud para ter base de dados em tempo real.

**Tabelas a criar:**

| Tabela | Descricao |
|--------|-----------|
| `articles` | Noticias do sistema (captadas + publicadas) |
| `sources` | Fontes de noticias (RSS, sites) |
| `sponsored_campaigns` | Campanhas publicitarias |
| `sponsored_ads` | Anuncios individuais |
| `user_roles` | Roles da equipa (admin, editor, revisor) |
| `agent_logs` | Logs do agente de IA |

### 1.2 Autenticacao do Backoffice

- Supabase Auth para login de editores
- Roles separados em tabela `user_roles` (seguranca)
- RLS policies para proteger dados

---

## Fase 2: Estrutura de Ficheiros

```text
src/
  admin/
    components/
      layout/
        AdminLayout.tsx        # Layout principal do CRM
        AdminSidebar.tsx       # Menu lateral
        AdminHeader.tsx        # Barra superior
      pipeline/
        ArticleCard.tsx        # Card de artigo na lista
        ArticleList.tsx        # Vista lista
        ArticleKanban.tsx      # Vista Kanban (opcional)
        ArticleFilters.tsx     # Filtros (fonte, categoria, etc.)
      editor/
        ArticleEditor.tsx      # Editor 3 paineis
        SourcePanel.tsx        # Painel esquerdo (fonte original)
        ContentPanel.tsx       # Painel central (edicao)
        PublishPanel.tsx       # Painel direito (publicacao)
        AIToolbar.tsx          # Botoes IA (reformular, encurtar)
      sources/
        SourcesList.tsx        # Lista de fontes
        SourceForm.tsx         # Formulario de fonte
      ads/
        CampaignList.tsx       # Campanhas publicitarias
        AdForm.tsx             # Formulario de anuncio
      agent/
        AgentStatus.tsx        # Estado ON/OFF
        AgentLogs.tsx          # Logs de execucao
      team/
        TeamList.tsx           # Gestao de equipa
        RoleSelector.tsx       # Selector de role
    pages/
      AdminDashboard.tsx       # Pagina inicial
      InboxPage.tsx            # Noticias captadas
      PendingPage.tsx          # Revisao humana
      EditingPage.tsx          # Em edicao
      ScheduledPage.tsx        # Agendadas
      PublishedPage.tsx        # Publicadas
      SourcesPage.tsx          # Gestao de fontes
      AdsPage.tsx              # Publicidade
      AgentPage.tsx            # Estado do agente
      TeamPage.tsx             # Equipa
      SettingsPage.tsx         # Definicoes
    hooks/
      useArticles.ts           # CRUD artigos
      useSources.ts            # CRUD fontes
      useAgent.ts              # Estado agente
      useAuth.ts               # Autenticacao admin
    types/
      admin.ts                 # Tipos do backoffice
```

---

## Fase 3: Schema da Base de Dados

### 3.1 Tabela `articles` (expandida)

```sql
CREATE TYPE article_status AS ENUM (
  'captured',      -- Captada
  'rewritten',     -- Reescrita pela IA
  'pending',       -- Pendente de revisao
  'approved',      -- Aprovada
  'needs_image',   -- Foto em falta
  'scheduled',     -- Agendada
  'published',     -- Publicada
  'rejected'       -- Rejeitada
);

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Dados originais (fonte)
  original_title TEXT,
  original_content TEXT,
  source_id UUID REFERENCES sources(id),
  source_url TEXT,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Dados B NEWS (editados)
  title TEXT,
  lead TEXT,
  content TEXT,
  quick_facts TEXT[],
  tags TEXT[],
  category TEXT,
  location TEXT,
  
  -- Publicacao
  image_url TEXT,
  image_caption TEXT,
  highlight_type TEXT DEFAULT 'normal', -- 'hero', 'trending', 'normal'
  seo_slug TEXT,
  seo_title TEXT,
  
  -- Estado
  status article_status DEFAULT 'captured',
  confidence_score DECIMAL(3,2), -- 0.00 a 1.00
  is_duplicate BOOLEAN DEFAULT FALSE,
  duplicate_of UUID REFERENCES articles(id),
  
  -- Meta
  reading_time INTEGER,
  author TEXT,
  editor_id UUID REFERENCES auth.users(id),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Tabela `sources`

```sql
CREATE TYPE source_type AS ENUM ('rss', 'website', 'api');
CREATE TYPE credibility_level AS ENUM ('high', 'medium', 'low');

CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type source_type DEFAULT 'rss',
  credibility credibility_level DEFAULT 'medium',
  categories TEXT[], -- Categorias que alimenta
  is_active BOOLEAN DEFAULT TRUE,
  last_fetch_at TIMESTAMPTZ,
  articles_captured INTEGER DEFAULT 0,
  duplicates_found INTEGER DEFAULT 0,
  fetch_interval_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Tabela `user_roles`

```sql
CREATE TYPE app_role AS ENUM ('admin', 'editor_chefe', 'editor', 'revisor');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
```

### 3.4 Tabela `agent_logs`

```sql
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id),
  action TEXT, -- 'fetch', 'rewrite', 'duplicate_check'
  status TEXT, -- 'success', 'error'
  articles_found INTEGER DEFAULT 0,
  articles_saved INTEGER DEFAULT 0,
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.5 Tabela `sponsored_campaigns`

```sql
CREATE TABLE sponsored_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  advertiser TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sponsored_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES sponsored_campaigns(id),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT,
  placement TEXT DEFAULT 'feed', -- 'feed', 'hero', 'sidebar'
  frequency INTEGER DEFAULT 8, -- A cada N artigos
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Fase 4: Rotas do Backoffice

**Adicionar ao `App.tsx`:**

```text
/admin               → AdminDashboard
/admin/inbox         → InboxPage (Captadas)
/admin/pending       → PendingPage (Revisao)
/admin/editing       → EditingPage (Em edicao)
/admin/scheduled     → ScheduledPage (Agendadas)
/admin/published     → PublishedPage (Publicadas)
/admin/article/:id   → ArticleEditor (Editor 3 paineis)
/admin/sources       → SourcesPage
/admin/ads           → AdsPage
/admin/agent         → AgentPage
/admin/team          → TeamPage
/admin/settings      → SettingsPage
```

---

## Fase 5: Componentes Principais

### 5.1 AdminLayout

Layout base com:
- Sidebar fixa a esquerda (220px)
- Header com pesquisa global + "Nova noticia"
- Area de conteudo principal

### 5.2 Pipeline (Lista)

Vista padrao com tabela:
- Colunas: Titulo, Fonte, Categoria, Score, Estado, Hora, Acoes
- Filtros: Fonte, Categoria, Estado, Periodo, Duplicados
- Paginacao
- Accoes rapidas: Abrir, Aprovar, Rejeitar, Agendar

### 5.3 Editor 3 Paineis

| Painel Esquerdo (25%) | Painel Central (50%) | Painel Direito (25%) |
|----------------------|---------------------|---------------------|
| Titulo original | Titulo B NEWS (editavel) | Upload imagem |
| Texto original | Lead (2 linhas) | Sugestoes de imagem |
| Link fonte | Corpo (rich text) | Legenda |
| Metadados | Factos rapidos | Destaque (Hero/Tendencias) |
| | Tags | SEO (slug, titulo) |
| | Categoria | Estado: Aprovar/Rejeitar |
| | Localizacao | Agendamento |
| | **Toolbar IA:** | Publicar agora |
| | Reformular / Encurtar | |
| | Tom jornalistico | |

### 5.4 AgentStatus

Card com:
- Toggle ON/OFF
- Frequencia (dropdown: 1, 5, 15 min)
- Ultima execucao
- Erros recentes
- Botao "Executar agora"

---

## Fase 6: Funcionalidades IA

### 6.1 Integracao AI Gateway (Lovable)

Usar `ai.gateway.lovable.dev` para:
- Reformular texto
- Encurtar
- Tornar mais jornalistico
- Sugerir titulo alternativo
- Gerar factos rapidos

### 6.2 Agente de Recolha (Edge Function)

Edge function que:
1. Le fontes activas
2. Faz fetch do RSS/site
3. Detecta duplicados
4. Reescreve com IA
5. Guarda em `articles` com status `rewritten`
6. Regista em `agent_logs`

---

## Fase 7: Permissoes por Role

| Accao | Admin | Editor-Chefe | Editor | Revisor |
|-------|-------|--------------|--------|---------|
| Publicar | Sim | Sim | Nao | Nao |
| Aprovar | Sim | Sim | Nao | Sim |
| Editar artigo | Sim | Sim | Sim | Nao |
| Gerir fontes | Sim | Sim | Nao | Nao |
| Gerir publicidade | Sim | Nao | Nao | Nao |
| Gerir equipa | Sim | Nao | Nao | Nao |
| Ver logs agente | Sim | Sim | Nao | Nao |

---

## Fase 8: Ordem de Implementacao

### Sprint 1: Fundacao
1. Activar Supabase via Lovable Cloud
2. Criar schema (migracoes SQL)
3. Configurar autenticacao
4. AdminLayout + AdminSidebar + AdminHeader
5. Pagina de login admin

### Sprint 2: Pipeline Editorial
6. ArticleList com filtros
7. Paginas: Inbox, Pending, Published
8. Accoes rapidas (aprovar, rejeitar)

### Sprint 3: Editor
9. ArticleEditor 3 paineis
10. ContentPanel com rich text
11. PublishPanel com upload imagem
12. Integracao AI toolbar

### Sprint 4: Fontes e Agente
13. SourcesList + SourceForm
14. AgentPage + AgentStatus
15. Edge function do agente (recolha)

### Sprint 5: Publicidade e Equipa
16. CampaignList + AdForm
17. TeamList + RoleSelector
18. RLS policies completas

---

## Detalhes Tecnicos

### Bibliotecas a Adicionar

| Pacote | Uso |
|--------|-----|
| `@supabase/supabase-js` | Cliente Supabase |
| `@supabase/ssr` | SSR helpers |
| `@tiptap/react` | Editor rich text |
| `@dnd-kit/core` | Drag & drop (Kanban) |
| `react-dropzone` | Upload de imagens |

### RLS Policies

Todas as tabelas do CRM terao RLS activado. O acesso sera validado pela funcao `has_role()`:

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### Storage Bucket

Criar bucket `article-images` para upload de fotos:
- Publico para leitura
- Escrita apenas para utilizadores autenticados com role editor+

---

## Resultado Esperado

- Backoffice profissional e produtivo
- Fluxo claro: Captar → Reescrever → Rever → Foto → Publicar
- Editor 3 paineis para comparar fonte vs versao B NEWS
- Agente autonomo a captar noticias
- Equipa com roles bem definidos
- Publicidade gerida no mesmo sistema
