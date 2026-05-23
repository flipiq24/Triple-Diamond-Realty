import { Link } from "wouter";
import logo from "@assets/image_1779548344914.png";
import { Phone, Mail, MapPin } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8 border-t border-primary/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="bg-white p-2 rounded-lg inline-block mb-4">
              <img src={logo} alt="Triple Diamond Realty" className="h-10 w-auto" />
            </div>
            <p className="text-primary-foreground/80 text-sm max-w-md leading-relaxed">
              We connect California investors and buyers with off-market handyman specials,
              fixer-uppers, and wholesale deals before they hit the MLS. Stop competing
              with retail buyers and find your next project today.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link href="/" className="hover:text-accent transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-accent transition-colors">Search Deals</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-accent transition-colors">About Us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Contact Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-accent" />
                <span>(909) 280-4906</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-accent" />
                <span>info@tdrealty.net</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-accent" />
                <span>Serving all of California</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Triple Diamond Realty. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
