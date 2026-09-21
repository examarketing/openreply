import Link from "next/link";

interface LegalShellProps {
  title: string;
  description: string;
  updatedAt: string;
  children: React.ReactNode;
}

// Páginas legais exigidas pela Meta (privacidade, termos, exclusão de dados).
// São as únicas páginas públicas do painel.
export default function LegalShell({
  title,
  description,
  updatedAt,
  children,
}: LegalShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <span className="flex items-center gap-2 text-base font-semibold">
            <span className="inline-block h-3 w-3 rounded-[3px] bg-[#B0F800]" aria-hidden="true" />
            EXA · DM automática
          </span>
          <Link
            href="/login"
            className="text-sm font-semibold text-muted transition hover:text-foreground"
          >
            Entrar
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Atualizado em {updatedAt}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-muted">{description}</p>
        <div className="mt-10 space-y-8 text-sm leading-7 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
        <nav className="mt-12 flex flex-wrap gap-4 border-t border-border pt-6 text-sm text-muted">
          <Link href="/privacy" className="hover:text-foreground">Política de privacidade</Link>
          <Link href="/terms" className="hover:text-foreground">Termos de uso</Link>
          <Link href="/data-deletion" className="hover:text-foreground">Exclusão de dados</Link>
        </nav>
      </article>
    </main>
  );
}
