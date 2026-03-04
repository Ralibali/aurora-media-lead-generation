import heroImage from "@/assets/hero-aurora.jpg";
import { MapPin } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Aurora Media AB – digital byrå i Linköping"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-2 text-sm md:text-base text-muted-foreground mb-6 animate-fade-in-up">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="uppercase tracking-[0.3em]">Digital byrå i Linköping</span>
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Aurora Media <span className="aurora-text">AB</span>
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-secondary-foreground max-w-3xl mx-auto mb-4 animate-fade-in-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
          Vi hjälper företag i Linköping och hela Sverige att synas, växa och sälja mer online.
        </p>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          Sociala medier · SEO · Webbutveckling · Fotografering · Content · Digital annonsering – allt under ett tak, med full transparens.
        </p>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <a
            href="#kontakt"
            className="inline-block aurora-gradient text-primary-foreground font-display font-semibold px-8 py-4 rounded-lg text-lg hover:opacity-90 transition-opacity animate-pulse-glow"
          >
            Få en kostnadsfri konsultation
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
