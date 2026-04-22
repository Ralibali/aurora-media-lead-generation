import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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

const cityLinks = [
  { name: "Linköping", slug: "linkoping" },
  { name: "Stockholm", slug: "stockholm" },
  { name: "Göteborg", slug: "goteborg" },
  { name: "Malmö", slug: "malmo" },
  { name: "Uppsala", slug: "uppsala" },
  { name: "Norrköping", slug: "norrkoping" },
  { name: "Jönköping", slug: "jonkoping" },
  { name: "Västerås", slug: "vasteras" },
  { name: "Örebro", slug: "orebro" },
];

const Footer = () => {
  const { open } = useContactModal();
  return (
    <footer className="bg-gradient-to-b from-[#1a3d2e] to-[#0a1410] text-[#ededea]">
      {/* Top CTA band */}
      <div className="container mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-20 text-center">
        <h2 className="mx-auto max-w-3xl font-serif italic text-[clamp(2.25rem,6vw,5rem)] leading-[1.05] tracking-[-0.02em] text-white">
          Låt mig bygga det du
          <br />
          behöver nästa.
        </h2>
        <Button onClick={() => open()} size="lg" className="mt-10 bg-white text-primary hover:bg-white/90">
          Starta ett projekt
        </Button>
      </div>

      <div className="container mx-auto px-6 pb-12">
        <div className="border-t border-white/10 pt-12 grid gap-12 md:grid-cols-4">
          <div>
            <p className="font-serif text-2xl mb-4">Aurora Media AB</p>
            <p className="text-sm text-[#cfcfc8] leading-relaxed">
              Org.nr 559272-0220<br />
              Linköping, Sverige<br />
              <a href="mailto:info@auroramedia.se" className="underline hover:text-white">
                info@auroramedia.se
              </a>
            </p>
          </div>

          <div>
            <p className="label-caps text-[#cfcfc8] mb-4">Arbete</p>
            <ul className="space-y-2 text-sm">
              {portfolio.map((p) => (
                <li key={p.url}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#cfcfc8] hover:text-white transition-colors"
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label-caps text-[#cfcfc8] mb-4">Navigera</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tjanster" className="text-[#cfcfc8] hover:text-white">Tjänster</Link></li>
              <li><Link to="/priser" className="text-[#cfcfc8] hover:text-white">Priser</Link></li>
              <li><Link to="/arbete" className="text-[#cfcfc8] hover:text-white">Arbete</Link></li>
              <li><Link to="/blog" className="text-[#cfcfc8] hover:text-white">Artiklar</Link></li>
              <li><Link to="/om" className="text-[#cfcfc8] hover:text-white">Om</Link></li>
              <li><Link to="/kontakt" className="text-[#cfcfc8] hover:text-white">Kontakt</Link></li>
              <li><Link to="/redaktionell-policy" className="text-[#cfcfc8] hover:text-white">Redaktionell policy</Link></li>
            </ul>
          </div>

          <div>
            <p className="label-caps text-[#cfcfc8] mb-4">SaaS-utveckling i</p>
            <ul className="space-y-2 text-sm">
              {cityLinks.map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/saas-utveckling-${c.slug}`}
                    className="text-[#cfcfc8] hover:text-white transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col gap-2 text-sm text-[#9d9d96] sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Aurora Media AB</p>
          <p className="italic">Byggd med AI, förstås.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
