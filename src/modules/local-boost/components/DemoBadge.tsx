export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md bg-demo px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-demo-foreground ${className}`}
      title="Simulerad data — inte hämtad från någon extern tjänst"
    >
      Demo
    </span>
  );
}

export function NotConfigured({ message }: { message?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Ej konfigurerad</p>
      <p className="mt-1">
        {message ??
          "Ingen extern tjänst är kopplad. Inga siffror visas och inget publiceras förrän du kopplar en leverantör."}
      </p>
    </div>
  );
}
