import { Camera, Code, Search, Share2, PenTool, Megaphone } from "lucide-react";

const services = [
  {
    icon: Share2,
    title: "Sociala Medier",
    description: "Vi blir er social media manager – uppdaterar, postar, engagerar och ser till att ni syns.",
  },
  {
    icon: Camera,
    title: "Fotografering",
    description: "Professionella bilder för portfolio, profiler och hemsida med vår fotograf Martin E.",
  },
  {
    icon: PenTool,
    title: "Content & Blogg",
    description: "SEO-vänliga texter som får sökmotorerna att älska ert innehåll.",
  },
  {
    icon: Code,
    title: "Webbutveckling & Design",
    description: "Hemsidor, logotyper, webbutiker – vi bygger det ni behöver från grunden.",
  },
  {
    icon: Search,
    title: "SEO",
    description: "Vi har tekniken och kunskapen för att ni ska hamna högst på sökmotorerna.",
  },
  {
    icon: Megaphone,
    title: "Digital Marknadsföring",
    description: "Meta Ads, Google Ads, TikTok Ads – vi kör era kampanjer med full transparens.",
  },
];

const ServicesSection = () => {
  return (
    <section id="tjanster" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Vad vi gör</p>
          <h2 className="text-4xl md:text-5xl font-bold">Våra tjänster</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div
              key={service.title}
              className="group p-8 rounded-xl bg-card aurora-border hover:aurora-glow transition-all duration-500"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <service.icon className="w-8 h-8 text-primary mb-5 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-display font-semibold mb-3">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
