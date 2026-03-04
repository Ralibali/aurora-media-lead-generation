const CTABanner = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="aurora-gradient rounded-2xl p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Redo att ta nästa steg?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Berätta om ert projekt eller era utmaningar – vi hjälper er att hitta rätt väg framåt. 
            Första samtalet är alltid kostnadsfritt och utan förpliktelser.
          </p>
          <a
            href="#kontakt"
            className="inline-block bg-background text-foreground font-display font-semibold px-8 py-4 rounded-lg text-lg hover:opacity-90 transition-opacity"
          >
            Boka ett kostnadsfritt samtal
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
