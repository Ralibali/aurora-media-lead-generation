const products = [
  { name: "Aurora Transport", url: "https://auroratransport.se" },
  { name: "Updro", url: "https://updro.se" },
  { name: "AgilityManager", url: "https://agilitymanager.se" },
  { name: "Hönsgården", url: "https://honsgarden.se" },
  { name: "Odlingsdagboken", url: "https://odlingsdagboken.com" },
  { name: "GoGlamping Sweden", url: "https://goglampingsweden.se" },
  { name: "Viriditas", url: "https://viriditasmassage.se" },
];

const TrustBarSection = () => {
  return (
    <section className="border-y border-border bg-secondary/40 py-8">
      <div className="container mx-auto px-6">
        <p className="label-caps text-center mb-4">Mina egna produkter live</p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          {products.map((p, i) => (
            <span key={p.url} className="flex items-center gap-x-6">
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {p.name}
              </a>
              {i < products.length - 1 && <span className="text-border">·</span>}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBarSection;
