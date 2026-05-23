import { Link, useLocation } from "wouter";
import { Phone, Mail, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
// @ts-ignore
import logoUrl from "@assets/image_1779548344914.png";

export default function SiteHeader() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search Deals" },
    { href: "/about", label: "About Us" },
  ];

  return (
    <header className="flex flex-col w-full sticky top-0 z-50 shadow-sm">
      {/* Top Utility Bar — tagline + compliance only */}
      <div className="bg-primary text-primary-foreground py-1.5 px-4 md:px-8 text-xs font-medium hidden sm:flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
          <span className="font-semibold text-white">Diamonds in the Rough. Delivered Daily.</span>
        </div>
        <span className="text-primary-foreground/70">CA DRE #[INSERT]</span>
      </div>

      {/* Main Navigation */}
      <div className="bg-white border-b border-border py-1 px-4 md:px-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src={logoUrl} alt="Triple Diamond Realty — off-market real estate" className="h-16 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Main">
          <ul className="flex items-center gap-6 text-sm font-semibold text-foreground">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`transition-colors hover:text-accent ${location === link.href ? "text-accent" : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <a
              href="tel:+19092804906"
              className="hidden lg:flex items-center gap-1.5 text-sm font-bold text-primary hover:text-accent transition-colors"
              aria-label="Call Triple Diamond Realty"
            >
              <Phone className="w-4 h-4" />
              <span>(909) 280-4906</span>
            </a>
            <Link href="/search">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 font-bold shadow-md shadow-accent/20">
                Find Deals
              </Button>
            </Link>
          </div>
        </nav>

        <div className="md:hidden flex items-center gap-1">
          <a
            href="tel:+19092804906"
            className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-muted"
            aria-label="Call Triple Diamond Realty"
          >
            <Phone className="w-5 h-5" />
          </a>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary" aria-label="Open menu">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white w-[280px]">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <img src={logoUrl} alt="Triple Diamond Realty" className="h-8 w-auto mb-4" />
                </Link>
                <nav className="flex flex-col gap-4 text-lg font-semibold text-primary" aria-label="Mobile">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`${location === link.href ? "text-accent" : ""}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="h-px bg-border my-2" />
                <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                  <a href="tel:+19092804906" className="flex items-center gap-2 font-semibold text-primary">
                    <Phone className="w-4 h-4 text-accent" /> (909) 280-4906
                  </a>
                  <a href="mailto:info@tdrealty.net" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-accent" /> info@tdrealty.net
                  </a>
                </div>
                <Link href="/search" onClick={() => setIsOpen(false)} className="mt-4">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-bold">
                    Find Deals
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
