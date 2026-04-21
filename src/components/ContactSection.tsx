import { Mail, MapPin } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="kontakt" className="border-t border-border py-20">
      <div className="container mx-auto px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="label-caps">Kontakt</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">Hör av dig</h2>
            <p className="mt-4 text-muted-foreground max-w-md">
              Mejla mig direkt så svarar jag inom 24 timmar vardagar.
            </p>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary" />
              <a href="mailto:info@auroramedia.se" className="hover:text-foreground">
                info@auroramedia.se
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Linköping, Sverige</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
