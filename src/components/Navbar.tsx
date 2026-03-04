import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Tjänster", href: "#tjanster" },
    { label: "Kontakt", href: "#kontakt" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-display text-lg font-bold">
          aurora media <span className="aurora-text">aB</span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
          <a
            href="#kontakt"
            className="aurora-gradient text-primary-foreground font-display font-semibold px-5 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Anlita oss
          </a>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-6 space-y-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
          <a
            href="#kontakt"
            onClick={() => setOpen(false)}
            className="block text-center aurora-gradient text-primary-foreground font-display font-semibold px-5 py-2 rounded-lg text-sm"
          >
            Anlita oss
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
