import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { describe, expect, it, vi } from "vitest";
import Index from "./Index";
const { open } = vi.hoisted(() => ({ open: vi.fn() }));
vi.mock("@/components/ContactModal", () => ({ useContactModal: () => ({ open }) }));
vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
describe("homepage business journey", () => {
  it("links its real case to the documented Stayboost workflow and carries the chosen need into contact", () => {
    render(<MemoryRouter><HelmetProvider><Index /></HelmetProvider></MemoryRouter>);
    expect(screen.getByRole("link", { name: /Från bokning till gästupplevelse/ })).toHaveAttribute("href", "/arbete/bergs-slussar-stayboost");
    fireEvent.click(screen.getByRole("button", { name: "Kundkontakt" }));
    expect(screen.getByRole("heading", { name: "Ge kunden ett tydligt nästa steg." })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Det här vill vi lösa" }));
    expect(open).toHaveBeenCalledWith({ internalNote: "Kundportal, bokning och AI-assistent" });
  });
});
