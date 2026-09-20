"use client";

/**
 * Início — painel visual da EXA.
 *
 * KPIs do período, gráfico comentários × DMs × cliques por dia, funil,
 * situação dos envios, ranking por automação e atividade recente.
 * Dados: /api/dashboard/stats?days=7|30|90&instagramAccountId=…
 */

import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AccountSelect, { type AccountOption } from "@/components/account-select";
import StatusBadge from "@/components/status-badge";

interface PeriodData {
  days: number;
  series: { date: string; comentarios: number; enviadas: number; cliques: number }[];
  funnel: {
    comentarios: number;
    comPalavra: number;
    enviadas: number;
    cliques: number;
    pessoas: number;
  };
  ctr: number;
  statusBreakdown: Record<string, number>;
  perAutomation: Array<{
    id: string;
    name: string;
    isActive: boolean;
    username: string;
    comentarios: number;
    enviadas: number;
    cliques: number;
    pessoas: number;
    ctr: number;
  }>;
}

interface DashboardStats {
  userName: string | null;
  contactsCount: number;
  totalAutomations: number;
  activeAutomations: number;
  dmsSentToday: number;
  dmsSentWeek: number;
  dmsSentMonth: number;
  totalDMs: number;
  totalClicks: number;
  instagramAccounts: AccountOption[];
  instagramAccount: {
    username: string;
    tokenExpiresAt: string | null;
    webhookSubscribed: boolean;
  } | null;
  recentLogs: Array<{
    id: string;
    commenterName: string | null;
    commentText: string;
    status: string;
    createdAt: string;
    automation: { name: string };
    instagramAccount?: { username: string };
  }>;
  period: PeriodData;
}

const PERIODS = [
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  SENT: { label: "Enviadas", color: "#12B76A" },
  PENDING: { label: "Na fila", color: "#F79009" },
  FAILED: { label: "Falharam", color: "#A12A2A" },
  SKIPPED_DEDUP: { label: "Pessoa repetida", color: "#98A2B3" },
  SKIPPED_RATE_LIMIT: { label: "Limite da Meta", color: "#EB6834" },
  SKIPPED_PLAN_LIMIT: { label: "Limite do plano", color: "#98A2B3" },
  SKIPPED_NO_MATCH: { label: "Sem palavra-chave", color: "#C5CCD6" },
};

const CORES = { comentarios: "#C5CCD6", enviadas: "#2A78D6", cliques: "#12B76A" };

function fmt(n: number) {
  return n.toLocaleString("pt-BR");
}

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function iniciais(nome: string | null) {
  const n = (nome ?? "?").replace(/^@/, "");
  return n.slice(0, 2).toUpperCase();
}

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.round(h / 24);
  return `${d} d`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState("all");
  const [days, setDays] = useState(7);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAccountId !== "all") params.set("instagramAccountId", selectedAccountId);
    params.set("days", String(days));
    setLoading(true);
    fetch(`/api/dashboard/stats?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedAccountId, days]);

  if (loading && !stats) {
    return (
      <div className="p-6 text-sm text-muted">Carregando o painel…</div>
    );
  }
  if (!stats) {
    return (
      <div className="p-6 text-sm text-error">
        Não foi possível carregar o painel. Recarregue a página.
      </div>
    );
  }

  const p = stats.period;
  const f = p.funnel;
  const semConta = stats.instagramAccounts.length === 0;
  const statusRows = Object.entries(p.statusBreakdown)
    .map(([k, v]) => ({ key: k, count: v, ...(STATUS_LABELS[k] ?? { label: k, color: "#98A2B3" }) }))
    .sort((a, b) => b.count - a.count);
  const totalStatus = statusRows.reduce((acc, r) => acc + r.count, 0);

  const kpis = [
    { label: "Comentários captados", value: fmt(f.comentarios), hint: `${p.days} dias` },
    { label: "DMs enviadas", value: fmt(f.enviadas), hint: `${pct(f.enviadas, f.comentarios)}% dos comentários` },
    { label: "Cliques no link", value: fmt(f.cliques), hint: `CTR ${p.ctr}%` },
    { label: "Pessoas alcançadas", value: fmt(f.pessoas), hint: "contatos únicos no período" },
    { label: "Automações ativas", value: fmt(stats.activeAutomations), hint: `${stats.totalAutomations} no total` },
    { label: "DMs hoje", value: fmt(stats.dmsSentToday), hint: `${fmt(stats.dmsSentMonth)} no mês` },
  ];

  const funil = [
    { label: "Comentários lidos", value: f.comentarios, color: CORES.comentarios },
    { label: "Com palavra-chave", value: f.comPalavra, color: "#98A2B3" },
    { label: "DM enviada", value: f.enviadas, color: CORES.enviadas },
    { label: "Clicou no link", value: f.cliques, color: CORES.cliques },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-surface min-h-full">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {stats.userName ? `Olá, ${stats.userName}` : "Painel"}
          </h1>
          <p className="text-sm text-muted mt-1">
            {semConta
              ? "Conecte uma conta do Instagram em Configurações para começar."
              : `Resultado das automações de comentário → DM nos últimos ${p.days} dias.`}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="inline-flex rounded-lg border border-border bg-background p-1">
            {PERIODS.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setDays(opt.days)}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  days === opt.days
                    ? "bg-accent text-white font-medium"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {stats.instagramAccounts.length > 1 && (
            <AccountSelect
              accounts={stats.instagramAccounts}
              value={selectedAccountId}
              onChange={setSelectedAccountId}
              label="Conta"
            />
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-background p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              {k.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
              {k.value}
            </p>
            <p className="mt-1 text-xs text-muted">{k.hint}</p>
          </div>
        ))}
      </div>

      {/* Gráfico + Funil */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Por dia</h2>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: CORES.comentarios }} />
                Comentários
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: CORES.enviadas }} />
                DMs enviadas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: CORES.cliques }} />
                Cliques
              </span>
            </div>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={p.series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#E9EDF2" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#667085" }}
                  tickLine={false}
                  axisLine={false}
                  interval={p.days > 30 ? 9 : p.days > 7 ? 3 : 0}
                />
                <YAxis tick={{ fontSize: 11, fill: "#667085" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "#F2F4F7" }}
                  contentStyle={{ borderRadius: 10, border: "1px solid #D6DAE0", fontSize: 12 }}
                  formatter={(value, name) => [
                    fmt(Number(value)),
                    name === "comentarios" ? "Comentários" : name === "enviadas" ? "DMs enviadas" : "Cliques",
                  ]}
                />
                <Bar dataKey="comentarios" fill={CORES.comentarios} radius={[3, 3, 0, 0]} maxBarSize={28} />
                <Bar dataKey="enviadas" fill={CORES.enviadas} radius={[3, 3, 0, 0]} maxBarSize={28} />
                <Line type="monotone" dataKey="cliques" stroke={CORES.cliques} strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <h2 className="text-sm font-semibold text-foreground">Funil do período</h2>
          <div className="mt-4 space-y-3">
            {funil.map((step, i) => {
              const base = funil[0].value || 1;
              const width = Math.max(4, Math.round((step.value / base) * 100));
              const prev = i > 0 ? funil[i - 1].value : null;
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">{step.label}</span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {fmt(step.value)}
                      {prev !== null && (
                        <span className="ml-1 font-normal text-muted">({pct(step.value, prev)}%)</span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1 h-3 w-full overflow-hidden rounded bg-surface">
                    <div className="h-full rounded" style={{ width: `${width}%`, background: step.color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted">
            Percentual entre parênteses = conversão em relação à etapa anterior.
          </p>
        </div>
      </div>

      {/* Status + Ranking */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-4">
          <h2 className="text-sm font-semibold text-foreground">O que aconteceu com cada comentário</h2>
          {totalStatus === 0 ? (
            <p className="mt-4 text-sm text-muted">Nenhum comentário processado no período.</p>
          ) : (
            <>
              <div className="mt-4 flex h-3 w-full overflow-hidden rounded bg-surface">
                {statusRows.map((r) => (
                  <div
                    key={r.key}
                    title={`${r.label}: ${fmt(r.count)}`}
                    style={{ width: `${Math.max(1, (r.count / totalStatus) * 100)}%`, background: r.color }}
                  />
                ))}
              </div>
              <ul className="mt-4 space-y-2">
                {statusRows.map((r) => (
                  <li key={r.key} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-foreground">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: r.color }} />
                      {r.label}
                    </span>
                    <span className="tabular-nums text-muted">
                      {fmt(r.count)} <span className="text-xs">({pct(r.count, totalStatus)}%)</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background p-4 xl:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">Por automação</h2>
          {p.perAutomation.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Nenhuma automação criada ainda.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted">
                    <th className="py-2 pr-3 font-semibold">Automação</th>
                    <th className="py-2 pr-3 text-right font-semibold">Comentários</th>
                    <th className="py-2 pr-3 text-right font-semibold">DMs</th>
                    <th className="py-2 pr-3 text-right font-semibold">Cliques</th>
                    <th className="py-2 pr-3 text-right font-semibold">CTR</th>
                    <th className="py-2 text-right font-semibold">Pessoas</th>
                  </tr>
                </thead>
                <tbody>
                  {p.perAutomation.slice(0, 8).map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${a.isActive ? "bg-success" : "bg-border-hover"}`}
                            title={a.isActive ? "Ativa" : "Pausada"}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{a.name || "Sem nome"}</p>
                            <p className="text-xs text-muted">@{a.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{fmt(a.comentarios)}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{fmt(a.enviadas)}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{fmt(a.cliques)}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{a.ctr}%</td>
                      <td className="py-2.5 text-right tabular-nums">{fmt(a.pessoas)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Atividade recente + conta */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Atividade recente</h2>
            <a href="/logs" className="text-xs text-[#2A78D6] hover:underline">
              Ver registro completo
            </a>
          </div>
          {stats.recentLogs.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Nenhuma atividade ainda.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {stats.recentLogs.map((log) => (
                <li key={log.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold text-foreground">
                    {iniciais(log.commenterName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      <span className="font-medium">@{log.commenterName ?? "alguém"}</span>
                      <span className="text-muted"> comentou </span>
                      <span className="italic">“{log.commentText.slice(0, 60)}”</span>
                    </p>
                    <p className="text-xs text-muted">
                      {log.automation.name || "automação"}
                      {log.instagramAccount ? ` · @${log.instagramAccount.username}` : ""} · {tempoRelativo(log.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={log.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <h2 className="text-sm font-semibold text-foreground">Conta conectada</h2>
          {stats.instagramAccount ? (
            <div className="mt-3 space-y-2 text-sm">
              <p className="font-medium text-foreground">@{stats.instagramAccount.username}</p>
              <p className="text-muted">
                Webhook: {stats.instagramAccount.webhookSubscribed ? "ligado" : "verificar"}
              </p>
              {stats.instagramAccount.tokenExpiresAt && (
                <p className="text-muted">
                  Token válido até {new Date(stats.instagramAccount.tokenExpiresAt).toLocaleDateString("pt-BR")}
                </p>
              )}
              <p className="pt-2 text-xs text-muted">
                Total histórico: {fmt(stats.totalDMs)} DMs · {fmt(stats.totalClicks)} cliques · {fmt(stats.contactsCount)} pessoas
              </p>
            </div>
          ) : (
            <a href="/settings" className="mt-3 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
              Conectar Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
