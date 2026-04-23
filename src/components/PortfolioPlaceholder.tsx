/**
 * CSS-only placeholder for portfolio items without a screenshot.
 * Aspect 16:10, soft forest-green → off-white gradient,
 * domain rendered in Instrument Serif, "Preview" label in mono.
 */
type Props = {
  domain: string;
  className?: string;
  label?: string;
};

const PortfolioPlaceholder = ({ domain, className = "", label = "Preview" }: Props) => (
  <div
    className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[0.875rem] bg-gradient-to-br from-[hsl(154_43%_21%)]/10 via-[hsl(137_30%_50%)]/10 to-[hsl(60_20%_97%)] ${className}`}
  >
    <div className="text-center px-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 font-serif text-3xl text-foreground/75 md:text-5xl">
        {domain}
      </p>
    </div>
    <span className="absolute bottom-3 right-4 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">
      Screenshot pending
    </span>
  </div>
);

export default PortfolioPlaceholder;
