import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FaqSection({ items, heading = "Frequently Asked Questions" }: { items: { q: string; a: string }[]; heading?: string }) {
  if (!items?.length) return null;
  return (
    <section className="py-20 bg-white border-t border-border">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">{heading}</h2>
        <Accordion type="single" collapsible className="w-full">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-lg font-semibold text-primary hover:text-accent">{it.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">{it.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
