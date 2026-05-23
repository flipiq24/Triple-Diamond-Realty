import { Link } from "wouter";
import SeoHead from "@/components/SeoHead";
import { posts } from "@/data/posts";
import { ArrowRight, Clock } from "lucide-react";

export default function Blog() {
  return (
    <div className="w-full bg-white">
      <SeoHead
        title="The Triple Diamond Blog | California Real Estate Investment Insights"
        description="Pillar guides on California off-market deals, BRRRR cash flow, foreclosures, fixer-uppers, and 1031 exchange — written by the team behind 30 years of deal-finding."
        path="/blog"
      />
      <section className="bg-primary py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">The Triple Diamond Blog</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">Field-tested guides for California real estate investors — straight from 30 years of off-market deal-finding.</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl space-y-6">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="block group">
              <article className="p-6 md:p-8 rounded-2xl border border-border bg-white hover:border-accent hover:shadow-md transition-all">
                <div className="flex items-center gap-3 text-xs uppercase tracking-wider font-bold text-accent mb-3">
                  <span>Pillar Article</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {p.readMinutes} min read
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">{p.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{p.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-accent font-semibold text-sm">
                  Read article <ArrowRight className="w-4 h-4" />
                </span>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
