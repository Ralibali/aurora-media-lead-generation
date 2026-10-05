import AdminShell from './AdminShell';
import PortfolioDashboard from './PortfolioDashboard';

export default function Projects() {
  return <AdminShell title="Alla projekt" kicker="Admin · Projekt och uppföljning"><PortfolioDashboard managementMode /></AdminShell>;
}
