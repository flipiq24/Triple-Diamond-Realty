import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Mail, Phone, ShieldCheck, ArrowRight } from "lucide-react";
import { setVerifiedBuyer, genCode } from "@/lib/buyerAccess";
import { toast } from "sonner";

type Step = "register" | "email" | "phone" | "done";

export default function RegisterDialog({
  open,
  onOpenChange,
  onVerified,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onVerified?: () => void;
}) {
  const [step, setStep] = useState<Step>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);

  // Generated codes (in production these are sent by the server, never stored client-side)
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  useEffect(() => {
    if (!open) {
      // Reset when closed
      setTimeout(() => {
        setStep("register");
        setEmailInput(""); setPhoneInput("");
      }, 300);
    }
  }, [open]);

  const startRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) { toast.error("Please fill in all fields"); return; }
    if (!consent) { toast.error("Please accept the authorization to continue"); return; }

    const c = genCode();
    setEmailCode(c);
    setStep("email");
    toast.success("Verification email sent", { description: `Code dispatched to ${email}` });
  };

  const verifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim() !== emailCode) {
      toast.error("Incorrect code. Try again.");
      return;
    }
    const c = genCode();
    setPhoneCode(c);
    setStep("phone");
    toast.success("Email verified", { description: `Texting code to ${phone}` });
  };

  const verifyPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.trim() !== phoneCode) {
      toast.error("Incorrect code. Try again.");
      return;
    }
    setVerifiedBuyer({ name, email, phone, consent });
    setStep("done");
    toast.success("You're verified! Full addresses unlocked.");
  };

  const finish = () => {
    onOpenChange(false);
    onVerified?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-primary text-primary-foreground px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-accent" />
              {step === "register" && "Register to see details"}
              {step === "email" && "Verify your email"}
              {step === "phone" && "Verify your phone"}
              {step === "done" && "You're verified!"}
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm">
              {step === "register" && "Off-market addresses are shown only to verified buyers."}
              {step === "email" && `We sent a 6-digit code to ${email}. Open the email and enter the code below.`}
              {step === "phone" && `We texted a 6-digit code to ${phone}. Enter it to finish.`}
              {step === "done" && "Full addresses, agent info, and showing details are now unlocked."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* STEP 1 — Register */}
        {step === "register" && (
          <form onSubmit={startRegister} className="px-6 py-5 space-y-3">
            <div>
              <Label htmlFor="r-name" className="text-xs">Full name *</Label>
              <Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="r-email" className="text-xs">Email *</Label>
              <Input id="r-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="r-phone" className="text-xs">Mobile phone *</Label>
              <Input id="r-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <label className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed pt-2">
              <Checkbox className="mt-0.5" checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
              <span>
                <strong className="text-foreground">Authorization to receive texts and emails:</strong> By checking this box and clicking
                "Send verification code", I expressly authorize Triple Diamond Realty and its agents and brokerages to contact me
                at the email and phone number provided — including by autodialer, prerecorded voice, SMS/MMS, and email —
                about properties, off-market deals, and related real-estate services. Consent is not a condition of any purchase.
                Message and data rates may apply. Reply STOP to opt out. See our{" "}
                <a href="/privacy" className="underline text-primary">Privacy Policy</a> and{" "}
                <a href="/terms" className="underline text-primary">Terms</a>.
                Equal Housing Opportunity.
              </span>
            </label>

            <Button type="submit" className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-bold rounded-full">
              Send verification code <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        {/* STEP 2 — Email code */}
        {step === "email" && (
          <form onSubmit={verifyEmail} className="px-6 py-5 space-y-4">
            <div className="rounded-lg bg-muted/60 border border-border p-3 text-xs text-muted-foreground flex items-start gap-2">
              <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">Demo mode:</strong> in production this code is emailed.
                Your code is <strong className="font-mono text-primary text-base">{emailCode}</strong>.
              </div>
            </div>
            <div>
              <Label htmlFor="email-code" className="text-xs">6-digit email code *</Label>
              <Input id="email-code" inputMode="numeric" maxLength={6} value={emailInput}
                onChange={(e) => setEmailInput(e.target.value.replace(/\D/g, ""))}
                className="tracking-[0.5em] text-center text-xl font-bold" required />
            </div>
            <Button type="submit" className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-bold rounded-full">
              Verify email <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        {/* STEP 3 — Phone code */}
        {step === "phone" && (
          <form onSubmit={verifyPhone} className="px-6 py-5 space-y-4">
            <div className="rounded-lg bg-muted/60 border border-border p-3 text-xs text-muted-foreground flex items-start gap-2">
              <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">Demo mode:</strong> in production this code is sent by SMS.
                Your code is <strong className="font-mono text-primary text-base">{phoneCode}</strong>.
              </div>
            </div>
            <div>
              <Label htmlFor="phone-code" className="text-xs">6-digit SMS code *</Label>
              <Input id="phone-code" inputMode="numeric" maxLength={6} value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                className="tracking-[0.5em] text-center text-xl font-bold" required />
            </div>
            <Button type="submit" className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-bold rounded-full">
              Verify phone <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              By verifying, you confirm the phone number is yours and consent to receive transactional and marketing texts
              from Triple Diamond Realty. Msg & data rates may apply. Reply STOP to cancel, HELP for help.
            </p>
          </form>
        )}

        {/* STEP 4 — Done */}
        {step === "done" && (
          <div className="px-6 py-8 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
            <div>
              <div className="text-lg font-bold text-foreground">Welcome to the buyer network</div>
              <p className="text-sm text-muted-foreground mt-1">
                You'll now see full property addresses, showing instructions, and listing agent contact info.
              </p>
            </div>
            <Button onClick={finish} className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-bold rounded-full">
              View property details
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
