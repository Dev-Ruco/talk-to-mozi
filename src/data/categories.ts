import { Category } from '@/types/news';

export const categories: Category[] = [
  { id: 'economia', name: 'Economia', icon: '📈', color: 'bg-category-economia' },
  { id: 'politica', name: 'Política', icon: '🏛️', color: 'bg-category-politica' },
  { id: 'sociedade', name: 'Sociedade', icon: '👥', color: 'bg-category-sociedade' },
  { id: 'entretenimento', name: 'Entretenimento', icon: '🎭', color: 'bg-category-entretenimento' },
  { id: 'tecnologia', name: 'Tecnologia', icon: '💻', color: 'bg-category-tecnologia' },
  { id: 'internacional', name: 'Internacional', icon: '🌍', color: 'bg-category-internacional' },
  { id: 'desporto', name: 'Desporto', icon: '⚽', color: 'bg-category-desporto' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

export const getCategoryColor = (id: string): string => {
  const colorMap: Record<string, string> = {
    economia: 'bg-category-economia text-white',
    politica: 'bg-category-politica text-white',
    sociedade: 'bg-category-sociedade text-foreground',
    entretenimento: 'bg-category-entretenimento text-white',
    tecnologia: 'bg-category-tecnologia text-white',
    internacional: 'bg-category-internacional text-white',
    desporto: 'bg-category-desporto text-white',
  };
  return colorMap[id] || 'bg-muted text-muted-foreground';
};
