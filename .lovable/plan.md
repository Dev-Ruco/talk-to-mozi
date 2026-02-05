
# Correcao: Paginas do CRM com Dados Nao Carregados

## Problema Identificado

Apos investigacao com browser de testes e analise da network, encontrei a causa raiz:

### 1. Problema Principal: useEffect Infinite Loop

No ficheiro `ArticleFilters.tsx` (linha 63-65):
```tsx
useEffect(() => {
  onFilterChange(filters);
}, [filters]);
```

Este useEffect causa um loop:
1. `filters` muda → chama `onFilterChange`
2. `onFilterChange` actualiza estado na pagina pai (ex: InboxPage)
3. Pagina pai re-renderiza → passa novo objecto de opcoes ao `useArticles`
4. `useArticles` executa `fetchArticles()` → define `isLoading = true`
5. Apos fetch, define `isLoading = false`
6. Componente re-renderiza → `ArticleFilters` monta de novo → `filters` resetado
7. Loop continua, causando o "piscar"

### 2. Problema Secundario: Dependencias no useArticles

No ficheiro `useArticles.ts` (linha 77-79):
```tsx
useEffect(() => {
  fetchArticles();
}, [status, limit, search, sourceId, category, showDuplicates]);
```

O `status` e um array que muda de referencia a cada render (mesmo com valores iguais), causando refetches desnecessarios.

---

## Dados na Base de Dados

Confirmado pela query directa:
- **25 artigos** existem com status `captured`
- **is_duplicate = false** em todos
- **RLS esta configurado** - requer `has_any_role(auth.uid())` para SELECT

---

## Plano de Correccao

### Correccao 1: Estabilizar ArticleFilters

Modificar `src/admin/components/pipeline/ArticleFilters.tsx`:

```tsx
// ANTES - causa loop infinito
useEffect(() => {
  onFilterChange(filters);
}, [filters]);

// DEPOIS - usar useCallback para estabilizar
// E remover o useEffect que chama onFilterChange em cada mudanca
// Em vez disso, chamar onFilterChange directamente no updateFilter
```

Abordagem:
- Remover o `useEffect` que observa `filters`
- Chamar `onFilterChange` directamente dentro de `updateFilter` e `clearFilters`
- Usar `useCallback` se necessario para evitar re-renders

### Correccao 2: Estabilizar useArticles

Modificar `src/admin/hooks/useArticles.ts`:

```tsx
// ANTES - status muda de referencia a cada render
useEffect(() => {
  fetchArticles();
}, [status, limit, search, sourceId, category, showDuplicates]);

// DEPOIS - serializar status para string para comparacao estavel
const statusKey = Array.isArray(status) ? status.sort().join(',') : (status || '');

useEffect(() => {
  fetchArticles();
}, [statusKey, limit, search, sourceId, category, showDuplicates]);
```

### Correccao 3: Evitar Re-mount do ArticleFilters

Nas paginas (InboxPage, PendingPage, etc), garantir que o estado dos filtros nao causa re-mount:

```tsx
// Usar useMemo para estabilizar as opcoes passadas ao useArticles
const articleOptions = useMemo(() => ({
  status: ['captured', 'rewritten'] as const,
  search: filters.search || undefined,
  sourceId: filters.sourceId || undefined,
  category: filters.category || undefined,
  showDuplicates: filters.showDuplicates,
}), [filters.search, filters.sourceId, filters.category, filters.showDuplicates]);

const { articles, isLoading, updateStatus } = useArticles(articleOptions);
```

### Correccao 4: Debounce na Pesquisa

Adicionar debounce no campo de pesquisa para evitar fetches excessivos:

```tsx
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 300);

useEffect(() => {
  updateFilter('search', debouncedSearch);
}, [debouncedSearch]);
```

---

## Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/admin/components/pipeline/ArticleFilters.tsx` | Remover useEffect loop, chamar callback directamente |
| `src/admin/hooks/useArticles.ts` | Serializar status para string, usar useMemo |
| `src/admin/pages/InboxPage.tsx` | Adicionar useMemo para opcoes |
| `src/admin/pages/PendingPage.tsx` | Adicionar useMemo para opcoes |
| `src/admin/pages/EditingPage.tsx` | Adicionar useMemo para opcoes |
| `src/admin/pages/ScheduledPage.tsx` | Adicionar useMemo para opcoes |
| `src/admin/pages/PublishedPage.tsx` | Adicionar useMemo para opcoes |
| `src/hooks/useDebounce.ts` | NOVO - hook de debounce |

---

## Detalhes Tecnicos

### Hook useDebounce

```tsx
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### ArticleFilters Corrigido

```tsx
const updateFilter = (key: keyof ArticleFiltersState, value: any) => {
  const actualValue = value === ALL_VALUE ? '' : value;
  const newFilters = { ...filters, [key]: actualValue };
  setFilters(newFilters);
  onFilterChange(newFilters); // Chamar directamente, sem useEffect
};

const clearFilters = () => {
  const resetFilters = {
    search: '',
    sourceId: '',
    category: '',
    status: '',
    showDuplicates: false,
  };
  setFilters(resetFilters);
  onFilterChange(resetFilters); // Chamar directamente
};

// REMOVER este useEffect:
// useEffect(() => {
//   onFilterChange(filters);
// }, [filters]);
```

### useArticles Corrigido

```tsx
export function useArticles(options: UseArticlesOptions = {}) {
  const { status, limit = 50, search, sourceId, category, showDuplicates = false } = options;
  
  // Serializar status para comparacao estavel
  const statusKey = useMemo(() => {
    if (!status) return '';
    return Array.isArray(status) ? status.sort().join(',') : status;
  }, [status]);

  // ... resto do codigo ...

  useEffect(() => {
    fetchArticles();
  }, [statusKey, limit, search, sourceId, category, showDuplicates]);
```

---

## Resultado Esperado

Apos as correccoes:
1. As paginas carregam os dados uma unica vez
2. Nao ha mais "piscar" ou loops infinitos
3. Os filtros funcionam correctamente sem re-fetches excessivos
4. A pesquisa tem debounce para melhor performance

---

## Sequencia de Implementacao

1. Criar hook `useDebounce`
2. Corrigir `ArticleFilters.tsx` - remover useEffect problematico
3. Corrigir `useArticles.ts` - estabilizar dependencias
4. Actualizar todas as paginas do pipeline com useMemo
5. Testar cada pagina para confirmar que carrega dados sem loops

