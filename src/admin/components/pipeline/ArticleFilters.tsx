import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Source, ArticleStatus, STATUS_LABELS } from '../../types/admin';

interface ArticleFiltersProps {
  onFilterChange: (filters: ArticleFiltersState) => void;
  showStatusFilter?: boolean;
  statusOptions?: ArticleStatus[];
}

export interface ArticleFiltersState {
  search: string;
  sourceId: string;
  category: string;
  status: string;
  showDuplicates: boolean;
}

const CATEGORIES = [
  'Política',
  'Economia',
  'Sociedade',
  'Desporto',
  'Cultura',
  'Internacional',
  'Tecnologia',
  'Saúde',
];

export function ArticleFilters({ 
  onFilterChange, 
  showStatusFilter = false,
  statusOptions = [],
}: ArticleFiltersProps) {
  const [filters, setFilters] = useState<ArticleFiltersState>({
    search: '',
    sourceId: '',
    category: '',
    status: '',
    showDuplicates: false,
  });
  const [sources, setSources] = useState<Source[]>([]);

  useEffect(() => {
    fetchSources();
  }, []);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const fetchSources = async () => {
    const { data } = await supabase
      .from('sources')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    setSources((data || []) as Source[]);
  };

  const updateFilter = (key: keyof ArticleFiltersState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      sourceId: '',
      category: '',
      status: '',
      showDuplicates: false,
    });
  };

  const hasActiveFilters = filters.search || filters.sourceId || filters.category || filters.status || filters.showDuplicates;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Pesquisar por título..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Source Filter */}
      <Select value={filters.sourceId} onValueChange={(v) => updateFilter('sourceId', v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Fonte" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas as fontes</SelectItem>
          {sources.map((source) => (
            <SelectItem key={source.id} value={source.id}>
              {source.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Select value={filters.category} onValueChange={(v) => updateFilter('category', v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas as categorias</SelectItem>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter (optional) */}
      {showStatusFilter && statusOptions.length > 0 && (
        <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os estados</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Show Duplicates Toggle */}
      <div className="flex items-center gap-2">
        <Switch
          id="show-duplicates"
          checked={filters.showDuplicates}
          onCheckedChange={(checked) => updateFilter('showDuplicates', checked)}
        />
        <Label htmlFor="show-duplicates" className="text-sm cursor-pointer">
          Mostrar duplicados
        </Label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  );
}
