import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { setSEOMeta } from "@/lib/seoHelpers";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    setSEOMeta({
      title: "Sidan hittades inte | Aurora Media",
      description: "Sidan du söker finns inte. Gå tillbaka till startsidan eller kontakta Aurora Media för hjälp med SaaS, appar och digitala projekt.",
      canonical: location.pathname,
      noindex: true,
    });
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-6">
      <main className="max-w-lg rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">404</p>
        <h1 className="mt-3 text-4xl font-bold">Sidan hittades inte</h1>
        <p className="mt-4 text-muted-foreground">
          Länken kan vara gammal eller felstavad. Gå tillbaka till startsidan, se våra tjänster eller kontakta oss så hjälper vi dig vidare.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Till startsidan
          </Link>
          <Link to="/tjanster" className="rounded-lg border border-border px-5 py-3 text-sm font-medium hover:bg-secondary">
            Se tjänster
          </Link>
          <Link to="/kontakt" className="rounded-lg border border-border px-5 py-3 text-sm font-medium hover:bg-secondary">
            Kontakta oss
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
