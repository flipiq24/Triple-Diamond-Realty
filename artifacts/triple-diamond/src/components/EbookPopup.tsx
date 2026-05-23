import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import ebookCover from "@assets/ChatGPT_Image_May_23,_2026,_12_30_58_PM_1779564683142.png";

const KEY = "tdr_ebook_popup_v1";

export default function EbookPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch { return; }
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(KEY, JSON.stringify({ dismissedAt: Date.now() })); } catch {}
    setOpen(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) { toast.error("Please fill in all fields"); return; }
    try {
      localStorage.setItem(KEY, JSON.stringify({ name, email, phone, claimedAt: Date.now() }));
    } catch {}
    setSubmitted(true);
    toast.success("Check your email!", { description: `Download link sent to ${email}` });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) dismiss(); }}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Book cover */}
          <div className="bg-black flex items-center justify-center p-6 md:p-8">
            <img
              src={ebookCover}
              alt="You Can't Steal in Slow Motion — A Real Estate Investor's Guide to Finding Deals Like a Pro, by Tony Diaz"
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
                  <strong>"You Can't Steal in Slow Motion"</strong> — 32 years and 1,100 flips of lessons on finding off-market deals like a pro. We'll email you the download link.
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
                  <Button type="submit" className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-bold rounded-full">
                    <Download className="w-4 h-4 mr-2" /> Send me the ebook
                  </Button>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="block w-full text-center text-xs text-muted-foreground hover:text-foreground underline mt-2"
                  >
                    No thanks
                  </button>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    By submitting, you agree to receive the download link and occasional emails/texts from Triple Diamond Realty.
                    Reply STOP to opt out. Consent is not a condition of purchase.
                  </p>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
                <h3 className="text-2xl font-extrabold text-primary mb-2">Check your email!</h3>
                <p className="text-sm text-foreground/80 mb-6">
                  We just emailed the download link for <strong>"You Can't Steal in Slow Motion"</strong> to <strong>{email}</strong>.
                </p>
                <Button onClick={dismiss} className="rounded-full bg-primary text-white">
                  Keep browsing deals
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
