const StatsSection = () => {
  const stats = [
    { value: "15%", label: "Administrationsavgift på annonsering – resten går till era kampanjer" },
    { value: "100%", label: "Transparens – ni ser alltid vad vi gör och varför" },
    { value: "6+", label: "Digitala tjänster under ett och samma tak" },
    { value: "∞", label: "Möjligheter att växa med rätt digital partner vid er sida" },
  ];

  return (
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl md:text-5xl font-display font-bold aurora-text mb-3">{stat.value}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
