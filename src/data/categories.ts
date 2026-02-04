import { TrendingUp, Landmark, Users, Music, Cpu, Globe, Trophy } from 'lucide-react';
import { Category } from '@/types/news';

export const categories: Category[] = [
  { id: 'economia', name: 'Economia', icon: TrendingUp },
  { id: 'politica', name: 'Política', icon: Landmark },
  { id: 'sociedade', name: 'Sociedade', icon: Users },
  { id: 'entretenimento', name: 'Entretenimento', icon: Music },
  { id: 'tecnologia', name: 'Tecnologia', icon: Cpu },
  { id: 'internacional', name: 'Internacional', icon: Globe },
  { id: 'desporto', name: 'Desporto', icon: Trophy },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

export const getCategoryColor = (): string => {
  // Monochromatic - uses only primary palette
  return 'bg-primary/10 text-primary';
};
