import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { buyerService } from "@/services/buyer.service";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useTenantCustomFields } from "@/hooks/useTenantCustomField";

const KEY = "tdr_ebook_popup_v1";

/**
 * Lead-magnet popup. Fully tenant-configurable via Buyers Hook custom_fields:
 *
 *   ebook_enabled   → "true" to show, anything else hides the popup entirely
 *   ebook_cover_url → book cover image URL (left panel)
 *   ebook_pdf_url   → the PDF the user gets after submitting
 *   ebook_title     → bold title text
 *   ebook_teaser    → subtitle under the title
 *
 * Popup hides when `ebook_enabled` isn't literally "true" — so a tenant that
 * hasn't configured a book at all sees no popup, and toggling off is a
 * single-field edit in Command's UI (no code change).
 */
export default function EbookPopup() {
  const { companyName } = useTenantBranding();
  const cf = useTenantCustomFields();

  const ebookEnabled = cf.ebook_enabled?.toLowerCase() === "true";
  const ebookCover = cf.ebook_cover_url;
  const ebookPdf = cf.ebook_pdf_url;
  const ebookTitle = cf.ebook_title;
  const ebookTeaser = cf.ebook_teaser;

  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Never open if the tenant hasn't configured the ebook.
    if (!ebookEnabled || !ebookPdf || !ebookCover) return;
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      return;
    }
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, [ebookEnabled, ebookPdf, ebookCover]);

  // Hard-hide if the tenant hasn't configured the popup — render nothing
  // so the Dialog doesn't even mount.
  if (!ebookEnabled || !ebookPdf || !ebookCover) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ dismissedAt: Date.now() }));
    } catch {
      /* ignore quota */
    }
    setOpen(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      await buyerService.submitEbookSignup({ name, email, phone });
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({ name, email, phone, claimedAt: Date.now() }),
        );
      } catch {
        /* ignore quota errors */
      }
      setSubmitted(true);
      toast.success("Your ebook is ready", {
        description: "Download will start in a moment.",
      });
      window.open(ebookPdf, "_blank", "noopener");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not submit. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setOpen(false); }}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2   z-50">
          {/* Book cover */}
          <div className="bg-black flex items-center justify-center p-6 md:p-8">
            <img
              src={ebookCover}
              alt={ebookTitle || `${companyName} ebook cover`}
              className="w-full max-w-xs h-auto rounded shadow-2xl ring-1 ring-accent/40"
            />
          </div>

          {/* Right panel */}
          <div className="bg-white p-6 md:p-8 flex flex-col justify-center">
            {!submitted ? (
              <>
                <div className="inline-flex items-center gap-2 bg-accent/15 text-accent px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide self-start mb-3">
                  <BookOpen className="w-3.5 h-3.5" /> Free Ebook
                </div>
                <DialogTitle className="text-2xl md:text-3xl font-extrabold text-primary leading-tight mb-2">
                  Get your free ebook
                </DialogTitle>
                <DialogDescription className="text-sm text-foreground/80 mb-5">
                  {ebookTitle && <strong>"{ebookTitle}"</strong>}
                  {ebookTitle && ebookTeaser ? " — " : null}
                  {ebookTeaser}
                  {(ebookTitle || ebookTeaser) ? " " : null}
                  We'll email you the download link.
                </DialogDescription>

                <form onSubmit={submit} className="space-y-3">
                  <div>
                    <Label htmlFor="eb-name" className="text-xs">Full name *</Label>
                    <Input id="eb-name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="eb-email" className="text-xs">Email *</Label>
                    <Input id="eb-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="eb-phone" className="text-xs">Phone *</Label>
                    <Input id="eb-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-bold rounded-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {submitting ? "Submitting…" : "Send me the ebook"}
                  </Button>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="block w-full text-center text-xs text-muted-foreground hover:text-foreground underline mt-2"
                  >
                    No thanks
                  </button>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    By submitting, you agree to receive the download link and occasional emails/texts from {companyName}.
                    Reply STOP to opt out. Consent is not a condition of purchase.
                  </p>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
                <h3 className="text-2xl font-extrabold text-primary mb-2">Your ebook is ready</h3>
                <p className="text-sm text-foreground/80 mb-6">
                  Thanks <strong>{name}</strong> — if the download didn't start automatically, click below.
                </p>
                <a
                  href={ebookPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full h-11 px-4 rounded-full bg-accent hover:bg-accent/90 text-white font-bold transition-colors"
                >
                  <Download className="w-4 h-4" /> Download ebook
                </a>
                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Keep browsing deals
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
