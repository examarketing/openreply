"use client";

import { useEffect } from "react";

// Tela de erro genérica (client boundary). Não mostra a mensagem técnica: ela
// vai só pro console e pros logs do Railway.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Algo deu errado</p>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">Não conseguimos carregar esta tela</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Tente de novo. Se continuar, avise o André com o horário e o que você estava fazendo.
          {error.digest ? ` Código: ${error.digest}` : ""}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Tentar de novo
          </button>
          <a
            href="/dashboard"
            className="rounded border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </main>
  );
}
