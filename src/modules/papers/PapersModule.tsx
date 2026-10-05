import { Navigate, Route, Routes } from "react-router-dom";
import ModuleFrame from "@/modules/shared/ModuleFrame";
import { PapersAuthGate, PapersAuthProvider } from "./auth";
import Auth from "./pages/Auth";
import Organisations from "./pages/Organisations";
import OrganisationLayout from "./pages/OrganisationLayout";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import Document from "./pages/Document";
import Exports from "./pages/Exports";
import Rules from "./pages/Rules";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";
import "./papers.css";

/** Native Aurora Media module; Papers retains its existing protected data and account boundary. */
export default function PapersModule() {
  return (
    <ModuleFrame id="papers" name="Dokumentinkorgen">
      <div className="papers-module">
          <PapersAuthProvider>
            <Routes>
              <Route path="auth" element={<Auth />} />
              <Route element={<PapersAuthGate />}>
                <Route index element={<Organisations />} />
                <Route path="app" element={<Organisations />} />
                <Route path="o/:orgId" element={<OrganisationLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="inbox" element={<Inbox />} />
                  <Route path="documents/:docId" element={<Document />} />
                  <Route path="exports" element={<Exports />} />
                  <Route path="rules" element={<Rules />} />
                  <Route path="audit" element={<Audit />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/portal/papers" replace />} />
            </Routes>
          </PapersAuthProvider>
      </div>
    </ModuleFrame>
  );
}
