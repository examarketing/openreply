import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Erro 404</p>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">Essa página não existe</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          O endereço pode estar errado ou a página foi removida.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          Ir para o início
        </Link>
      </div>
    </main>
  );
}
