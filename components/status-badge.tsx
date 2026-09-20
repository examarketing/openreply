/**
 * Pílula de status da DM. A cor carrega o estado; o texto explica em português.
 */

const statusConfig: Record<string, { cls: string; label: string }> = {
  SENT: { cls: "bg-[#E6F4EA] text-[#0B6B3A]", label: "Enviada" },
  FAILED: { cls: "bg-[#FDE8E7] text-[#A12A2A]", label: "Falhou" },
  PENDING: { cls: "bg-[#FFF3D6] text-[#8A5A00]", label: "Na fila" },
  SKIPPED_DEDUP: { cls: "bg-surface text-muted", label: "Pessoa repetida" },
  SKIPPED_RATE_LIMIT: { cls: "bg-[#FFF3D6] text-[#8A5A00]", label: "Limite da Meta" },
  SKIPPED_PLAN_LIMIT: { cls: "bg-surface text-muted", label: "Limite do plano" },
  SKIPPED_NO_MATCH: { cls: "bg-surface text-muted", label: "Sem palavra-chave" },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { cls: "bg-surface text-muted", label: status };

  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${config.cls}`}
    >
      {config.label}
    </span>
  );
}
