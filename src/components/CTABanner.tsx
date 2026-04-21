import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";

const CTABanner = () => {
  const { open } = useContactModal();
  return (
    <section className="border-t border-border py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl">
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05]">
            Har du en idé som borde varit en app för länge sen?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            Skicka ett mejl så svarar jag inom 24 timmar. Beskriv problemet kort så säger jag direkt
            om jag kan bygga det och vad det kostar.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button size="lg" onClick={() => open()}>
              Skriv till mig
            </Button>
            <a
              href="mailto:info@auroramedia.se"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm hover:bg-secondary transition-colors"
            >
              info@auroramedia.se
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
