import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SiteHeader from "@/components/layout/SiteHeader";
import { setSEOMeta } from "@/lib/seoHelpers";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    setSEOMeta({
      title: "Sidan hittades inte | Aurora Media",
      description: "Sidan du söker finns inte.",
      canonical: location.pathname,
      noindex: true,
    });
  }, [location.pathname]);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <SiteHeader />
      <main
        id="main"
        className="flex min-h-screen flex-col items-center justify-center px-5 text-center"
        style={{ paddingTop: "80px" }}
      >
        <p
          className="font-serif leading-none"
          style={{ fontSize: "80px", color: "#EDE9DC" }}
        >
          404.
        </p>
        <p
          className="mt-5 font-sans text-[16px] leading-relaxed max-w-[360px]"
          style={{ color: "rgba(237, 233, 220, 0.65)" }}
        >
          Sidan finns inte.{" "}
          <em
            className="font-serif"
            style={{ color: "rgba(237, 233, 220, 0.80)" }}
          >
            Eller så har vi inte byggt den än.
          </em>
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center rounded-lg px-[18px] py-[10px] font-sans text-[13px] font-medium transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#EDE9DC", color: "#100F0D" }}
        >
          Tillbaka till start →
        </Link>
      </main>
    </div>
  );
};

export default NotFound;
