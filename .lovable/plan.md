
# Auditoria Completa do B NEWS - Frontend e Backoffice

Apos uma analise detalhada do codigo, identifico os seguintes problemas e funcionalidades incompletas.

---

## Problemas Criticos (Erros que impedem funcionamento)

### 1. Rota Inexistente: `/admin/article/:id`

| Problema | Impacto |
|----------|---------|
| O link `ArticleList.tsx` aponta para `/admin/article/${article.id}` | Quando clicam num artigo para editar, vao para pagina 404 |
| Nao existe componente `ArticleEditor.tsx` | Editor 3 paineis nao implementado |
| Rota nao definida em `App.tsx` | Navegacao quebrada |

**Ficheiros afectados:**
- `src/admin/components/pipeline/ArticleList.tsx` (linhas 109, 286)
- `src/App.tsx` (rota em falta)

---

## Funcionalidades Incompletas no Backoffice

### 2. Paginas com Funcionalidade Basica/Placeholder

| Pagina | Estado | O que falta |
|--------|--------|-------------|
| `AdsPage.tsx` | Placeholder | CRUD de campanhas e anuncios nao implementado |
| `TeamPage.tsx` | Placeholder | Lista de membros e gestao de roles nao implementado |
| `SettingsPage.tsx` | Placeholder | Sem configuracoes reais |

### 3. Funcionalidades do Agente IA

| Item | Estado |
|------|--------|
| Botao "Executar agora" | Apenas mostra toast, sem edge function |
| Toggle ON/OFF | Nao persiste estado |
| Frequencia | Nao salva configuracao |

### 4. Editor de Artigos (Planeado mas nao existe)

Componentes em falta da estrutura planeada:
```text
src/admin/components/editor/
  ArticleEditor.tsx    (NAO EXISTE)
  SourcePanel.tsx      (NAO EXISTE)
  ContentPanel.tsx     (NAO EXISTE)
  PublishPanel.tsx     (NAO EXISTE)
  AIToolbar.tsx        (NAO EXISTE)
```

---

## Problemas Menores no Frontend Publico

### 5. Paginas Funcionais mas Dependem de Dados Estaticos

| Pagina | Estado |
|--------|--------|
| `/` (Index) | Funcional com dados mock |
| `/artigo/:id` | Funcional com dados mock |
| `/categoria/:id` | Funcional com dados mock |
| `/chat` | Funcional com respostas simuladas |
| `/guardados` (Amei) | Funcional com localStorage |
| `/perfil` | Funcional, preferencias nao persistem |
| `/categorias` | Funcional |

Nao ha erros, mas tudo usa `src/data/articles.ts` em vez da base de dados Supabase.

---

## Estado da Base de Dados

| Tabela | Registos |
|--------|----------|
| `articles` | 0 (vazia) |
| `sources` | 0 (vazia) |
| `user_roles` | 1 (existe 1 admin) |
| `agent_logs` | 0 |
| `sponsored_ads` | 0 |

**Nota:** O backend esta configurado mas vazio.

---

## Seguranca

| Item | Estado |
|------|--------|
| RLS policies | Configuradas correctamente |
| Roles RBAC | Implementado via `has_role()` |
| Autenticacao | Funcional |
| Password leaked protection | DESACTIVADO (aviso do linter) |

---

## Plano de Correcoes

### Sprint A: Corrigir Erros Criticos (Prioridade Alta)

**1. Criar rota e pagina do editor de artigos**

Adicionar em `App.tsx`:
```typescript
import ArticleEditorPage from "./admin/pages/ArticleEditorPage";
// ...
<Route path="/admin/article/:id" element={<ArticleEditorPage />} />
```

Criar `src/admin/pages/ArticleEditorPage.tsx`:
- Pagina wrapper que carrega artigo por ID
- Mostra editor se artigo existir
- Mostra 404 se nao existir

**2. Criar Editor 3 Paineis basico**

| Painel | Funcionalidade |
|--------|----------------|
| Esquerdo (25%) | Mostra fonte original (read-only) |
| Central (50%) | Campos editaveis: titulo, lead, content, tags |
| Direito (25%) | Imagem, categoria, estado, agendar/publicar |

### Sprint B: Completar Paginas Placeholder

**3. AdsPage - CRUD de publicidade**
- Listar campanhas da tabela `sponsored_campaigns`
- Formulario para criar/editar campanha
- Listar anuncios por campanha

**4. TeamPage - Gestao de equipa**
- Listar utilizadores com roles
- Formulario para atribuir role a utilizador

**5. SettingsPage**
- Configuracoes basicas do sistema
- Gerir parametros do agente

### Sprint C: Agente IA

**6. Edge function para captura automatica**
- Criar `supabase/functions/news-agent/`
- Fetch de RSS das fontes activas
- Deteccao de duplicados
- Inserir artigos com status `captured`

**7. Integracao AI Gateway**
- Reescrita de artigos via Lovable AI
- Botoes na toolbar: Reformular, Encurtar, Tom jornalistico

---

## Resumo Executivo

| Categoria | Total | Critico |
|-----------|-------|---------|
| Rotas quebradas | 1 | Sim |
| Paginas placeholder | 3 | Nao |
| Componentes em falta | 5 | Sim |
| Edge functions | 0 de 1 | Nao |

**Proximos passos recomendados:**
1. Criar rota `/admin/article/:id` e pagina `ArticleEditorPage.tsx`
2. Implementar editor 3 paineis minimo viavel
3. Completar `AdsPage` e `TeamPage`
4. Criar edge function do agente

---

## Ficheiros a Criar

```text
src/admin/pages/ArticleEditorPage.tsx     # Nova pagina
src/admin/components/editor/
  ArticleEditor.tsx                       # Layout 3 paineis
  SourcePanel.tsx                         # Painel esquerdo
  ContentPanel.tsx                        # Painel central
  PublishPanel.tsx                        # Painel direito
supabase/functions/news-agent/index.ts    # Edge function
```

## Ficheiros a Modificar

```text
src/App.tsx                               # Adicionar rota /admin/article/:id
src/admin/pages/AdsPage.tsx               # CRUD completo
src/admin/pages/TeamPage.tsx              # Lista e gestao roles
src/admin/pages/SettingsPage.tsx          # Configuracoes
src/admin/pages/AgentPage.tsx             # Ligar a edge function
```
