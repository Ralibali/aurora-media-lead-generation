import { Link } from "react-router-dom";

export default function AuroraPlanDemo() {
  return (
    <main className="flex min-h-screen flex-col bg-[#111827] text-white">
      <header className="border-b border-white/10 px-5 py-4">
        <Link to="/" className="inline-flex min-h-11 items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[#e8500a] text-sm font-extrabold" aria-hidden="true">A</span>
          <span className="font-bold">Aurora Plan</span>
        </Link>
      </header>
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16" aria-labelledby="planner-status">
        <p className="mb-3 text-sm font-medium text-white/60">Planeringsverktyget</p>
        <h1 id="planner-status" className="text-3xl font-bold">Planeringen är tillfälligt stängd</h1>
        <p className="mt-5 leading-relaxed text-white/80">
          Vi uppdaterar åtkomsten för att skydda uppgifter om lag, kontaktpersoner och planeringsönskemål.
          Arbetsytan öppnas igen när behörigheterna har kontrollerats.
        </p>
        <p className="mt-4 leading-relaxed text-white/80">
          Behöver du hjälp med planeringen under tiden kan du kontakta Aurora Media.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/kontakt" className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#e8500a] px-5 py-3 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Kontakta oss</Link>
          <Link to="/integritetspolicy" className="inline-flex min-h-11 items-center rounded-md px-2 py-3 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Läs integritetspolicyn</Link>
        </div>
      </section>
    </main>
  );
}
