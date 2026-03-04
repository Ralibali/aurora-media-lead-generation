import { MapPin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 items-center text-center md:text-left">
          <div>
            <p className="font-display text-xl font-semibold mb-1">
              Aurora Media <span className="aurora-text">AB</span>
            </p>
            <p className="text-muted-foreground text-sm">
              Digital byrå för företag som vill växa online.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Linköping, Sverige</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <a href="mailto:info@auroramedia.se" className="hover:text-foreground transition-colors">info@auroramedia.se</a>
            </div>
          </div>
          <div className="text-sm text-muted-foreground md:text-right">
            <p>Org.nr: 559272-0220</p>
            <p>© {new Date().getFullYear()} Aurora Media AB</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
