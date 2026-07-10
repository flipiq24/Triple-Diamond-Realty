import { Link, useLocation } from "wouter";
import { Phone, Mail, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useTenantCustomFields } from "@/hooks/useTenantCustomField";

export default function SiteHeader() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { logoUrl, companyName } = useTenantBranding();
  const cf = useTenantCustomFields();

  const phone = cf.primary_phone;
  const phoneTel = cf.primary_phone_tel;
  const email = cf.primary_email;
  const dre = cf.dre_broker_license;
  const tagline = cf.tagline;

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
          {tagline && <span className="font-semibold text-white">{tagline}</span>}
        </div>
        {dre && <span className="text-primary-foreground/70">CA DRE #{dre}</span>}
      </div>

      {/* Main Navigation */}
      <div className="bg-white border-b border-border py-1 px-4 md:px-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src={logoUrl} alt={`${companyName} — off-market real estate`} className="h-24 md:h-28 w-auto object-contain" />
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
            {phone && phoneTel && (
              <a
                href={`tel:${phoneTel}`}
                className="hidden lg:flex items-center gap-1.5 text-sm font-bold text-primary hover:text-accent transition-colors"
                aria-label={`Call ${companyName}`}
              >
                <Phone className="w-4 h-4" />
                <span>{phone}</span>
              </a>
            )}
            {location !== "/search" && (
              <Link href="/search">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 font-bold shadow-md shadow-accent/20">
                  Find Deals
                </Button>
              </Link>
            )}
          </div>
        </nav>

        <div className="md:hidden flex items-center gap-1">
          {phoneTel && (
            <a
              href={`tel:${phoneTel}`}
              className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-muted"
              aria-label={`Call ${companyName}`}
            >
              <Phone className="w-5 h-5" />
            </a>
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary" aria-label="Open menu">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white w-[280px]">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <img src={logoUrl} alt={companyName} className="h-8 w-auto mb-4" />
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
                  {phone && phoneTel && (
                    <a href={`tel:${phoneTel}`} className="flex items-center gap-2 font-semibold text-primary">
                      <Phone className="w-4 h-4 text-accent" /> {phone}
                    </a>
                  )}
                  {email && (
                    <a href={`mailto:${email}`} className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent" /> {email}
                    </a>
                  )}
                </div>
                {location !== "/search" && (
                  <Link href="/search" onClick={() => setIsOpen(false)} className="mt-4">
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-bold">
                      Find Deals
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
