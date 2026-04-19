import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PLACEHOLDERS = [
  'Escreva: combustíveis em Maputo…',
  'Escreva: inflação em Moçambique…',
  'Escreva: chuvas no centro do país…',
  'Escreva: política nacional…',
  'Escreva: dólar e câmbios…',
];

const QUICK_CHIPS = [
  'Combustíveis',
  'Inflação',
  'Chuvas',
  'Política',
  'Dólar',
  'Saúde',
  'Educação',
  'Segurança',
];

const CHIP_TO_QUERY: Record<string, string> = {
  Combustíveis: 'O que está a acontecer com os combustíveis em Moçambique?',
  Inflação: 'Como está a inflação em Moçambique?',
  Chuvas: 'Quais são as últimas notícias sobre as chuvas em Moçambique?',
  Política: 'O que se passa hoje na política moçambicana?',
  Dólar: 'Como está o dólar face ao metical?',
  Saúde: 'Últimas notícias do sector da saúde em Moçambique',
  Educação: 'O que se passa no sector da educação em Moçambique?',
  Segurança: 'Últimas notícias sobre segurança em Moçambique',
};

export function HeroSearch() {
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/chat?q=${encodeURIComponent(trimmed)}`);
  };

  const handleChip = (chip: string) => {
    const newQuery = CHIP_TO_QUERY[chip] || chip;
    setQuery(newQuery);
    inputRef.current?.focus();
  };

  const isDisabled = !query.trim();

  return (
    <section className="px-4 pt-8 pb-4 md:pt-10 md:pb-6">
      <motion.div
        className="mx-auto max-w-4xl space-y-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Pesquisa IA
        </div>

        <h1 className="font-display text-3xl font-bold leading-tight md:text-5xl">
          Pergunte o que aconteceu hoje em{' '}
          <span className="text-primary">Moçambique</span>
        </h1>

        <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
          Receba respostas rápidas com base nas notícias mais recentes,
          organizadas por tema, sector ou acontecimento.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-3 pt-1">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={PLACEHOLDERS[placeholderIndex]}
              className="h-14 flex-1 text-base md:h-16 md:text-lg"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                size="icon"
                className="h-14 w-14 shrink-0 md:h-16 md:w-16"
                disabled={isDisabled}
              >
                <Send className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </motion.div>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Actualizado com notícias recentes e verificadas
          </p>

          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {QUICK_CHIPS.map((chip, index) => (
              <motion.button
                key={chip}
                type="button"
                onClick={() => handleChip(chip)}
                className="rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.04 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {chip}
              </motion.button>
            ))}
          </div>
        </form>
      </motion.div>
    </section>
  );
}
