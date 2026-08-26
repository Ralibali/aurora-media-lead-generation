import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { ContactModalProvider } from "@/components/ContactModal";
import {
  LEGAL_ACK_OWNER_CONFIRMATION_REQUIRED,
  LEGAL_ACK_TEXT,
  PRICES,
  PRODUCT_STATUS,
} from "@/config/aiKontoret";
import Villkor from "@/pages/Villkor";
import Integritetspolicy from "@/pages/Integritetspolicy";
import { ReactNode } from "react";

function wrap(ui: ReactNode) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <ContactModalProvider>{ui}</ContactModalProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("AI-KONTORET launch guards (PREPARE)", () => {
  it("does not open live checkout", () => {
    expect(PRODUCT_STATUS).toBe("prelaunch");
    expect(LEGAL_ACK_OWNER_CONFIRMATION_REQUIRED).toBe(true);
  });

  it("keeps locked consumer prices", () => {
    expect(PRICES.guide).toBe(199);
    expect(PRICES.vault).toBe(199);
    expect(PRICES.bundle).toBe(349);
  });

  it("reuses the existing legal ack wording", () => {
    expect(LEGAL_ACK_TEXT).toBe(
      "Jag förstår att detta är en digital produkt som levereras direkt efter köp, och att ångerrätten enligt distansavtalslagen inte gäller när leveransen av det digitala innehållet har påbörjats med mitt samtycke.",
    );
  });
});

describe("UTKAST legal copy on live pages", () => {
  it("keeps AI-kartan terms and adds an AI-KONTORET draft section", () => {
    wrap(<Villkor />);
    expect(screen.getByText("Vad du godkänner")).toBeInTheDocument();
    expect(screen.getByText("Du kan avsluta när du vill")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /AI-KONTORET – digital PDF/ })).toBeInTheDocument();
    expect(screen.getAllByText(/UTKAST · inte juridiskt granskat/).length).toBeGreaterThan(0);
    expect(screen.getByText(LEGAL_ACK_TEXT)).toBeInTheDocument();
    expect(screen.getByText(/Guide 199 kr/)).toBeInTheDocument();
    expect(screen.getByText(/info@auroramedia.se/)).toBeInTheDocument();
    expect(screen.getByText(/14 dagars ångerrätt enligt distansavtalslagen/)).toBeInTheDocument();
  });

  it("adds a short purchase-data draft on the privacy page", () => {
    wrap(<Integritetspolicy />);
    expect(screen.getByRole("heading", { name: "Integritetspolicy" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /AI-KONTORET – köp och leverans/ })).toBeInTheDocument();
    expect(screen.getByText(/Stripe-session-id/)).toBeInTheDocument();
    expect(screen.getByText(/leveranslogg/)).toBeInTheDocument();
    expect(screen.getByText(/Betalningen hanteras av Stripe/)).toBeInTheDocument();
    expect(screen.queryByText(/PayPal|Klarna|Resend/i)).not.toBeInTheDocument();
  });
});
