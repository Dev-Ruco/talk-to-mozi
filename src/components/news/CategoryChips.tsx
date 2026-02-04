import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categories } from '@/data/categories';
import { cn } from '@/lib/utils';

interface CategoryChipsProps {
  selectedCategory?: string | null;
  onSelect?: (categoryId: string | null) => void;
}

export function CategoryChips({ selectedCategory, onSelect }: CategoryChipsProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (categoryId: string) => {
    if (onSelect) {
      onSelect(selectedCategory === categoryId ? null : categoryId);
    } else {
      navigate(`/categoria/${categoryId}`);
    }
  };

  return (
    <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 py-3 md:mx-0 md:flex-wrap md:px-0">
      <motion.button
        onClick={() => {
          if (onSelect) {
            onSelect(null);
          } else {
            navigate('/');
          }
        }}
        className={cn(
          "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          !selectedCategory && location.pathname === '/'
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Todas
      </motion.button>
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;
        
        return (
          <motion.button
            key={category.id}
            onClick={() => handleClick(category.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 relative",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className="h-4 w-4" />
            {category.name}
            {isSelected && (
              <motion.div
                className="absolute inset-0 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background"
                layoutId="categoryRing"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
