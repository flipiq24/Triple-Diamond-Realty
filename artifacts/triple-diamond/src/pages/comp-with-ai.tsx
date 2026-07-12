import { Link } from "wouter";
import { Sparkles, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SeoHead from "@/components/SeoHead";
import { useState } from "react";
import { toast } from "sonner";
import { useTenantBranding } from "@/hooks/useTenantBranding";

export default function CompWithAI() {
  const [email, setEmail] = useState("");
  const { companyName } = useTenantBranding();

  const notify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're on the list!", { description: "We'll email you the moment Comp with AI goes live." });
    setEmail("");
  };

  return (
    <div className="w-full bg-white">
      <SeoHead
        title={`Comp with AI — Coming Soon — ${companyName}`}
        description="AI-powered comp analysis is launching soon."
        path="/comp-with-ai"
      />

      <section className="bg-primary text-primary-foreground py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto max-w-2xl text-center relative">
          <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-6">
            <Sparkles className="w-4 h-4" /> Coming Soon
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">Comp with AI</h1>
          <p className="text-xl text-white/85 mb-2">Coming very soon.</p>
          <p className="text-base text-white/70 mb-10">
            Check back next week — we're putting the finishing touches on AI-powered comp analysis,
            ARV estimates, and rehab scope on every property.
          </p>

          <form onSubmit={notify} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-12 bg-white text-primary placeholder:text-primary/50 rounded-full px-5"
              required
            />
            <Button type="submit" className="h-12 px-6 rounded-full bg-accent hover:bg-accent/90 text-white font-bold whitespace-nowrap">
              <Bell className="w-4 h-4 mr-2" /> Notify me
            </Button>
          </form>

          <Link href="/">
            <button className="mt-8 text-sm text-white/70 hover:text-white underline">← Back to home</button>
          </Link>
        </div>
      </section>
    </div>
  );
}
