import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCta() {
  const navigate = useNavigate();

  return (
    <section className="rounded-3xl bg-primary/10 px-6 py-12 text-center md:py-16">
      <motion.div
        className="mx-auto max-w-2xl space-y-5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>

        <h2 className="font-display text-2xl font-bold md:text-3xl">
          Não encontrou o que procura?
        </h2>

        <p className="text-base text-muted-foreground">
          Pergunte directamente à nossa Pesquisa IA e receba um resumo
          imediato das notícias.
        </p>

        <Button
          size="lg"
          onClick={() => navigate('/chat')}
          className="gap-2"
        >
          Fazer uma pergunta
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </section>
  );
}
