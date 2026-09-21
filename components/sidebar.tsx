"use client";

/**
 * Sidebar Navigation
 *
 * Text-only nav with active state and workspace section.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sair } from "@/app/actions/sair";

// Ícones inline (traços simples, 20px) — sem dependência extra.
const ICONS: Record<string, string> = {
  inicio: "M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10",
  visao: "M4 19V5m0 14h16M8 15l3-4 3 2 4-6",
  inbox: "M3 13V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 13h5l2 3h4l2-3h5M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5",
  automacoes: "M13 3 4 14h7l-1 7 9-11h-7l1-7Z",
  registro: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  config: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7.6 7.6 0 0 0-1.8-1l-.3-2.5H9.1l-.3 2.5a7.6 7.6 0 0 0-1.8 1l-2.3-1-2 3.4 2 1.5a7.4 7.4 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7.6 7.6 0 0 0 1.8 1l.3 2.5h5.8l.3-2.5a7.6 7.6 0 0 0 1.8-1l2.3 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z",
  diag: "M3 12h4l3-8 4 16 3-8h4",
};

const navItems = [
  { label: "Início", href: "/dashboard", icon: "inicio" },
  { label: "Automações", href: "/campaigns", icon: "automacoes" },
  { label: "Registro de DMs", href: "/logs", icon: "registro" },
  { label: "Caixa de entrada", href: "/inbox", icon: "inbox" },
  { label: "Visão geral", href: "/overview", icon: "visao" },
  { label: "Configurações", href: "/settings", icon: "config" },
  { label: "Diagnóstico", href: "/diagnostics", icon: "diag" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
}

export default function Sidebar({
  isOpen,
  onClose,
  workspaceName,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-dvh w-64 max-w-[85vw] shrink-0 bg-surface border-r border-border flex flex-col
          transition-transform duration-200 ease-out
          lg:h-full lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Same reason as the top bar: the drawer is full height, so the
            wordmark would otherwise land under the status bar. */}
        <div
          className="px-6 py-5 border-b border-border"
          style={{ paddingTop: "calc(1.25rem + env(safe-area-inset-top))" }}
        >
          <Link href="/dashboard" className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <span className="inline-block h-3 w-3 rounded-sm bg-[#B0F800]" aria-hidden="true" />
            <span>EXA <span className="text-muted font-normal">· DM automática</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  ${
                    isActive
                      ? "bg-background text-foreground font-medium shadow-sm border border-border"
                      : "text-muted hover:text-foreground hover:bg-surface-hover"
                  }
                `}
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isActive ? "text-[#2A78D6]" : "text-muted"}
                >
                  <path d={ICONS[item.icon]} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-border">
          <div className="min-w-0">
            <p className="text-sm text-foreground truncate">{workspaceName}</p>
            <p className="text-xs text-muted">Stack própria da EXA · dm.exa.marketing</p>
          </div>
          <form action={sair}>
            <button
              type="submit"
              title="Sair do painel"
              className="shrink-0 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-[#101828] hover:text-foreground"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
