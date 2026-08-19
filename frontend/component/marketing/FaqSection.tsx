import { FaqJsonLd } from '@/components/seo/JsonLd';

interface FaqSectionProps {
  title?: string;
  items: readonly { question: string; answer: string }[];
  id?: string;
}

export function FaqSection({ title = 'Preguntas frecuentes', items, id = 'faq' }: FaqSectionProps) {
  return (
    <section id={id} className="border-t border-border/60 bg-muted/30 py-16 dark:bg-muted/10 md:py-20">
      <FaqJsonLd items={[...items]} />
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Respuestas rápidas sobre Khepri WMS y gestión de bodega.
        </p>
        <dl className="mt-10 space-y-4">
          {items.map((item) => (
            <div
              key={item.question}
              className="rounded-xl border border-border/60 bg-card/90 px-5 py-4"
            >
              <dt className="font-semibold">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
