import { ReactNode } from "react";
import SeoHead from "@/components/SeoHead";

export default function LegalPage({
  title,
  description,
  path,
  heading,
  intro,
  children,
}: {
  title: string;
  description: string;
  path: string;
  heading: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full bg-white">
      <SeoHead title={title} description={description} path={path} />
      <section className="bg-primary py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">{heading}</h1>
          {intro && <p className="text-primary-foreground/80">{intro}</p>}
          <p className="text-primary-foreground/60 text-sm mt-2">Last modified: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
      </section>
      <section className="py-16 px-4">
        <article className="container mx-auto max-w-3xl prose prose-lg text-muted-foreground prose-headings:text-primary prose-strong:text-primary prose-a:text-accent">
          {children}
        </article>
      </section>
    </div>
  );
}
