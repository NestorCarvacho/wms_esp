import { useId, useState } from 'react';
import { motion } from 'motion/react';
import { Minus, Plus } from 'lucide-react';
import { FaqJsonLd } from '@/components/seo/JsonLd';
import { Reveal, spring, useMotionUITheme } from './motion';

interface FaqSectionProps {
  title?: string;
  items: readonly { question: string; answer: string }[];
  id?: string;
}

function FaqItem({
  question,
  answer,
  defaultOpen,
}: {
  question: string;
  answer: string;
  defaultOpen: boolean;
}) {
  const theme = useMotionUITheme();
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border/60 bg-card/90 px-5 py-4">
      <dt>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-start justify-between gap-4 text-left"
        >
          <span className="font-semibold">{question}</span>
          <motion.span
            className="mt-0.5 inline-flex text-emerald-600 dark:text-emerald-400"
            animate={{ rotate: open ? 180 : 0 }}
            transition={spring(theme.transitions.snap)}
            aria-hidden
          >
            {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </motion.span>
        </button>
      </dt>
      <motion.dd
        id={panelId}
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={spring(theme.transitions.ui)}
        className="overflow-hidden"
      >
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{answer}</p>
      </motion.dd>
    </div>
  );
}

export function FaqSection({ title = 'Preguntas frecuentes', items, id = 'faq' }: FaqSectionProps) {
  return (
    <section id={id} className="border-t border-border/60 bg-muted/30 py-16 dark:bg-muted/10 md:py-20">
      <FaqJsonLd items={[...items]} />
      <Reveal className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Respuestas rápidas sobre Khepri WMS y gestión de bodega.
        </p>
        <dl className="mt-10 space-y-4">
          {items.map((item, index) => (
            <FaqItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              defaultOpen={index === 0}
            />
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
