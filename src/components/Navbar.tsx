import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";

const services = [
  { label: "SaaS & MVP", to: "/priser", primary: true },
  { label: "Hemsidor", to: "/tjanster/hemsidor" },
  { label: "E-handel", to: "/tjanster/ehandel" },
  { label: "Mobilapp", to: "/tjanster/mobilapp" },
  { label: "SEO", to: "/tjanster/seo" },
  { label: "Google Ads", to: "/tjanster/google-ads" },
  { label: "Meta Ads", to: "/tjanster/meta-ads" },
  { label: "Content", to: "/tjanster/content" },
  { label: "Grafisk profil", to: "/tjanster/grafisk-profil" },
  { label: "Fotografering", to: "/tjanster/fotografering" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { open: openModal } = useContactModal();
  const { scrollY } = useScroll();
  const navigate = useNavigate();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (latest > 100 && latest > prev) setHidden(true);
    else setHidden(false);
  });

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? -80 : 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md"
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="font-serif text-xl font-medium tracking-tight">
          AURORA MEDIA
        </Link>

        {/* Desktop center */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink
            to="/arbete"
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            Arbete
          </NavLink>

          {/* Services dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-expanded={servicesOpen}
            >
              Tjänster
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 top-full -translate-x-1/2 pt-3"
                >
                  <div className="w-64 rounded-lg border border-border bg-popover p-2 shadow-lg">
                    {services.map((s) => (
                      <button
                        key={s.to}
                        onClick={() => {
                          setServicesOpen(false);
                          navigate(s.to);
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                          s.primary ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {s.label}
                        {s.primary && <span className="text-[10px] uppercase tracking-wider text-primary">Primär</span>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavLink
            to="/priser"
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            Priser
          </NavLink>
          <NavLink
            to="/blog"
            end
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            Artiklar
          </NavLink>

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

      {/* Mobile fullscreen */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-background px-6 py-8 md:hidden"
          >
            <div className="flex flex-col gap-1">
              <NavLink to="/arbete" onClick={() => setOpen(false)} className="border-b border-border py-4 font-serif text-2xl">
                Arbete
              </NavLink>
              <div className="border-b border-border py-4">
                <p className="font-serif text-2xl mb-3">Tjänster</p>
                <div className="flex flex-col gap-2 pl-1">
                  {services.map((s) => (
                    <NavLink
                      key={s.to}
                      to={s.to}
                      onClick={() => setOpen(false)}
                      className="text-base text-muted-foreground"
                    >
                      {s.label}
                    </NavLink>
                  ))}
                </div>
              </div>
              <NavLink to="/priser" onClick={() => setOpen(false)} className="border-b border-border py-4 font-serif text-2xl">
                Priser
              </NavLink>
              <NavLink to="/blog" onClick={() => setOpen(false)} className="border-b border-border py-4 font-serif text-2xl">
                Artiklar
              </NavLink>
              <Button
                onClick={() => {
                  setOpen(false);
                  openModal();
                }}
                size="lg"
                className="mt-6"
              >
                Starta projekt
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
