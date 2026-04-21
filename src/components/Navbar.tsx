import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";

const links = [
  { label: "Arbete", to: "/arbete" },
  { label: "Priser", to: "/priser" },
  { label: "Om", to: "/om" },
  { label: "Kontakt", to: "/kontakt" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { open: openModal } = useContactModal();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="font-serif text-xl tracking-tight">
          AURORA MEDIA
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Button onClick={() => openModal()} size="sm">
            Starta projekt
          </Button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground"
          aria-label="Meny"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background px-6 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-base text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </NavLink>
            ))}
            <Button
              onClick={() => {
                setOpen(false);
                openModal();
              }}
              className="mt-2"
            >
              Starta projekt
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
