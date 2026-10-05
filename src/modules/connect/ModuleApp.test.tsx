import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthError } from "@supabase/supabase-js";
import ConnectModule from "./ModuleApp";
import LocalBoostModule from "../local-boost/ModuleApp";
import { supabase as connectClient } from "./integrations/supabase/client";
import { supabase as localClient } from "../local-boost/integrations/supabase/client";

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function renderModule(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LocationProbe />
      <Routes>
        <Route path="/portal/connect/*" element={<ConnectModule />} />
        <Route path="/portal/local-boost/*" element={<LocalBoostModule />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  for (const client of [connectClient, localClient]) {
    vi.spyOn(client.auth, "getUser").mockResolvedValue({
      data: { user: null },
      error: new AuthError("No session"),
    });
    vi.spyOn(client.auth, "getSession").mockResolvedValue({
      data: { session: null },
      error: null,
    });
  }
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Unexpected network request"));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("native product routing and original account boundaries", () => {
  it.each([
    ["/portal/connect/kunder/customer-a", "AI-receptionist", "/portal/connect/auth"],
    ["/portal/local-boost/platser/location-a", "Lokal synlighet", "/portal/local-boost/auth"],
  ])("keeps an unauthenticated deep link inside its product: %s", async (path, name, authPath) => {
    renderModule(path);
    expect(await screen.findByRole("heading", { name: `Logga in i ${name}` })).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent(authPath);
    expect(screen.getByLabelText("E-post")).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it.each(["connect", "local-boost"])("shows a readable missing-page state for %s", (id) => {
    renderModule(`/portal/${id}/missing-page`);
    expect(screen.getByRole("heading", { name: "Sidan finns inte" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Till översikten" }).getAttribute("href")).toMatch(
      new RegExp(`^/portal/${id}/`),
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
