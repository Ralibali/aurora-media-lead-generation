import heroImage from "@/assets/hero-aurora.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Aurora borealis bakgrund"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <p className="text-sm md:text-base uppercase tracking-[0.3em] text-muted-foreground mb-6 animate-fade-in-up">
          Digital byrå i Sverige
        </p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          aurora media <span className="aurora-text">aB</span>
        </h1>
        <p className="text-lg md:text-xl text-secondary-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Vi hjälper er att växa digitalt – sociala medier, SEO, webbutveckling, fotografering och marknadsföring. Allt under ett tak.
        </p>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <a
            href="#kontakt"
            className="inline-block aurora-gradient text-primary-foreground font-display font-semibold px-8 py-4 rounded-lg text-lg hover:opacity-90 transition-opacity animate-pulse-glow"
          >
            Kontakta oss
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/40 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 rounded-full bg-primary" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
