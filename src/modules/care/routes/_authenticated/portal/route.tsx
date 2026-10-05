import { createFileRoute, Outlet } from "@/modules/shared/router";

import { AppShell, type NavItem } from "@/modules/care/components/app/AppShell";
import { LoadingRows } from "@/modules/care/components/common/States";
import { useViewer } from "@/modules/care/hooks/useViewer";
import { isAdmin } from "@/modules/care/lib/access";

export const Route = createFileRoute("/_authenticated/portal")({
  component: PortalLayout,
});

const items: NavItem[] = [
  { to: "/portal", label: "Mina sajter" },
  { to: "/portal/rapporter", label: "Rapporter" },
  { to: "/portal/support", label: "Support" },
];

function PortalLayout() {
  const { loading, viewer } = useViewer();

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl p-6">
        <LoadingRows rows={5} />
      </div>
    );
  }

  return (
    <AppShell
      items={items}
      title="Kundportal"
      subtitle={isAdmin(viewer) ? "Administratörsvy av kundportalen" : "Aurora Care"}
    >
      <Outlet />
    </AppShell>
  );
}
