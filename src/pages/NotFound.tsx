import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import NordicLayout from "@/components/nordic/NordicLayout";
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
    <NordicLayout>
      <section
        style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          minHeight: "65vh", textAlign: "center",
          padding: "clamp(100px,14vw,160px) clamp(20px,4vw,48px) 60px",
        }}
      >
        <p style={{
          fontFamily: "'Fraunces',Georgia,serif",
          fontSize: "clamp(80px,14vw,140px)",
          lineHeight: 1,
          color: "var(--gran)",
          letterSpacing: "-0.04em",
          marginBottom: 20,
        }}>
          404.
        </p>
        <h1 style={{
          fontFamily: "'Inter',system-ui,sans-serif",
          fontSize: 15, lineHeight: 1.6,
          color: "var(--granbark-mut)",
          maxWidth: 340, marginBottom: 40,
        }}>
          Sidan finns inte.{" "}
          <em style={{ fontFamily: "'Fraunces',Georgia,serif", fontStyle: "italic", color: "var(--granbark)" }}>
            Eller så har vi inte byggt den än.
          </em>
        </h1>
        <Link to="/" className="btn-primary">Tillbaka till start →</Link>
      </section>
    </NordicLayout>
  );
};

export default NotFound;
