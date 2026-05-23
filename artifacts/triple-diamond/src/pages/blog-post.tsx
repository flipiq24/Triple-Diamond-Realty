import { Link, useParams } from "wouter";
import SeoHead from "@/components/SeoHead";
import { findPost } from "@/data/posts";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = findPost(slug);
  if (!post) return <NotFound />;

  return (
    <div className="w-full bg-white">
      <SeoHead
        title={`${post.title} | Triple Diamond Realty`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
      />
      <section className="bg-primary py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-1 text-accent text-sm font-semibold mb-6 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-3 text-primary-foreground/70 text-sm">
            <Clock className="w-4 h-4" /> {post.readMinutes} min read
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <article className="container mx-auto max-w-3xl prose prose-lg text-muted-foreground prose-headings:text-primary prose-strong:text-primary prose-a:text-accent">
          <p className="lead text-xl text-primary font-semibold">{post.excerpt}</p>
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <div className="not-prose mt-12 p-6 bg-primary rounded-2xl text-center">
            <p className="text-white font-bold text-lg mb-4">Ready to put this into action?</p>
            <Link href={post.variantHref}>
              <Button className="bg-accent hover:bg-accent/90 text-white rounded-full font-bold px-8 h-12">See Matching Deals</Button>
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
