const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6 text-center">
        <p className="font-display text-xl font-semibold mb-2">
          aurora media <span className="aurora-text">aB</span>
        </p>
        <p className="text-muted-foreground text-sm mb-1">
          Org.nr: 559272-0220
        </p>
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} Aurora Media AB. Alla rättigheter förbehållna.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
