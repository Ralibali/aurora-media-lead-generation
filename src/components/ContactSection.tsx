import { useState } from "react";
import { Send, Mail, CheckCircle } from "lucide-react";

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Kontaktförfrågan från ${formData.name}`);
    const body = encodeURIComponent(
      `Namn: ${formData.name}\nE-post: ${formData.email}\n\nMeddelande:\n${formData.message}`
    );
    window.location.href = `mailto:info@auroramedia.se?subject=${subject}&body=${body}`;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="kontakt" className="py-24 md:py-32">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Redo att växa?</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Hör av dig</h2>
          <p className="text-muted-foreground text-lg">
            Berätta vad ni behöver hjälp med – vi återkommer snabbt!
          </p>
        </div>

        <div className="bg-card rounded-2xl p-8 md:p-12 aurora-border aurora-glow">
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-display font-semibold mb-2">Tack!</h3>
              <p className="text-muted-foreground">
                Din e-postklient bör ha öppnats. Skicka mailet så hör vi av oss!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary-foreground mb-2">
                  Namn
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Ert namn"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-foreground mb-2">
                  E-post
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  maxLength={255}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="er@email.se"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-secondary-foreground mb-2">
                  Meddelande
                </label>
                <textarea
                  id="message"
                  required
                  maxLength={2000}
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  placeholder="Berätta vad ni behöver hjälp med..."
                />
              </div>
              <button
                type="submit"
                className="w-full aurora-gradient text-primary-foreground font-display font-semibold py-4 rounded-lg text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
              >
                <Send className="w-5 h-5" />
                Skicka meddelande
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Mail className="w-4 h-4" />
            <a href="mailto:info@auroramedia.se" className="hover:text-primary transition-colors">
              info@auroramedia.se
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
