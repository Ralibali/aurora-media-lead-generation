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
        style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          minHeight: "100vh", textAlign: "center",
          padding: "clamp(100px,14vw,160px) clamp(20px,4vw,48px) 60px",
        }}
      >
        <p style={{
          fontFamily: "'Instrument Serif',Georgia,serif",
          fontSize: "clamp(80px,14vw,140px)",
          lineHeight: 1,
          color: "#EDE9DC",
          letterSpacing: "-0.04em",
          marginBottom: 20,
        }}>
          404.
        </p>
        <p style={{
          fontFamily: "'Inter',system-ui,sans-serif",
          fontSize: 15, lineHeight: 1.6,
          color: "rgba(237,233,220,0.55)",
          maxWidth: 340, marginBottom: 40,
        }}>
          Sidan finns inte.{" "}
          <em style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontStyle: "italic", color: "rgba(237,233,220,0.75)" }}>
            Eller så har vi inte byggt den än.
          </em>
        </p>
        <Link to="/" className="btn-primary">Tillbaka till start →</Link>
      </main>
    </div>
  );
};

export default NotFound;
