import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useContactModal } from "@/components/ContactModal";

const portfolio = [
  { name: "Aurora Transport", url: "https://auroratransport.se" },
  { name: "Updro", url: "https://updro.se" },
  { name: "AgilityManager", url: "https://agilitymanager.se" },
  { name: "Hönsgården", url: "https://honsgarden.se" },
  { name: "Odlingsdagboken", url: "https://odlingsdagboken.com" },
  { name: "GoGlamping Sweden", url: "https://goglampingsweden.se" },
  { name: "Viriditas", url: "https://viriditasmassage.se" },
];

const tjanster = [
  { name: "SaaS & MVP", to: "/priser" },
  { name: "Hemsidor", to: "/tjanster/hemsidor" },
  { name: "E-handel", to: "/tjanster/ehandel" },
  { name: "Mobilapp", to: "/tjanster/mobilapp" },
  { name: "SEO", to: "/tjanster/seo" },
  { name: "Alla tjänster", to: "/tjanster" },
];

const cityLinks = [
  { name: "Linköping", slug: "linkoping" },
  { name: "Stockholm", slug: "stockholm" },
  { name: "Göteborg", slug: "goteborg" },
  { name: "Malmö", slug: "malmo" },
  { name: "Uppsala", slug: "uppsala" },
];

const Footer = () => {
  const { open } = useContactModal();
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[hsl(154_43%_14%)] via-[hsl(154_40%_8%)] to-[hsl(0_0%_4%)] text-white/95">
      {/* Statement */}
      <div className="container mx-auto px-6 pt-32 pb-20 md:pt-48 md:pb-28">
        <motion.h2
          initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
          className="font-serif italic text-[clamp(3rem,9vw,8rem)] leading-[0.95] tracking-[-0.025em] text-white"
        >
          Låt mig bygga
          <br />
          det du behöver
          <br />
          <span className="text-white/55">nästa.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12"
        >
          <button onClick={() => open()} className="group inline-flex items-center gap-2 rounded-full bg-white py-2 pl-6 pr-2 text-base text-[hsl(154_43%_14%)] transition-all duration-700 hover:scale-[1.02] active:scale-[0.98]"
            style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
          >
            <span className="font-medium">Starta ett projekt</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(154_43%_14%)] text-white transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105"
              style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
            >
              <ArrowUpRight weight="bold" size={16} />
            </span>
          </button>
        </motion.div>
      </div>

      {/* Divider + columns */}
      <div className="container mx-auto px-6 pb-12">
        <div className="grid gap-12 border-t border-white/10 pt-16 md:grid-cols-4">
          <div>
            <p className="font-serif text-2xl mb-4">Aurora Media AB</p>
            <p className="text-sm text-white/65 leading-relaxed">
              Org.nr 559272-0220<br />
              Linköping, Sverige<br />
              <a href="mailto:info@auroramedia.se" className="underline-offset-4 hover:underline">
                info@auroramedia.se
              </a>
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 mb-4">
              Arbete
            </p>
            <ul className="space-y-2.5 text-sm">
              {portfolio.map((p) => (
                <li key={p.url}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 mb-4">
              Tjänster
            </p>
            <ul className="space-y-2.5 text-sm">
              {tjanster.map((t) => (
                <li key={t.to}>
                  <Link to={t.to} className="text-white/70 transition-colors hover:text-white">
                    {t.name}
                  </Link>
                </li>
              ))}
              <li className="pt-3">
                <Link to="/arbete" className="text-white/70 hover:text-white">Arbete</Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/70 hover:text-white">Artiklar</Link>
              </li>
              <li>
                <Link to="/om" className="text-white/70 hover:text-white">Om</Link>
              </li>
              <li>
                <Link to="/kontakt" className="text-white/70 hover:text-white">Kontakt</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 mb-4">
              SaaS-utveckling i
            </p>
            <ul className="space-y-2.5 text-sm">
              {cityLinks.map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/saas-utveckling-${c.slug}`}
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-white/10 pt-8 text-sm text-white/45 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Aurora Media AB</p>
          <p className="font-mono text-xs uppercase tracking-wider">Byggd med AI, förstås.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
