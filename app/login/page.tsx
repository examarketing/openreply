import { EMAIL_PROVIDER_ID, signIn } from "@/lib/auth";

export const metadata = {
  title: "Entrar - EXA DM automática",
  description: "Entre para gerenciar as automações de comentário → DM.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    checkEmail?: string;
    callbackUrl?: string;
  }>;
}) {
  const params = await searchParams;
  const checkEmail = params.checkEmail === "1";
  // Só caminhos internos: um callbackUrl externo viraria redirecionamento aberto.
  const requested = params.callbackUrl ?? "";
  const callbackUrl =
    requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";

  async function sendMagicLink(formData: FormData) {
    "use server";
    await signIn(EMAIL_PROVIDER_ID, {
      email: String(formData.get("email") ?? ""),
      redirectTo: callbackUrl,
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            EXA · DM automática
          </h1>
          <p className="text-muted text-sm leading-relaxed mt-2">
            Entre com seu e-mail e depois conecte a conta profissional do Instagram.
          </p>
        </div>

        <div className="panel rounded p-8 shadow-black/40">
          {checkEmail ? (
            <div className="text-center py-4">
              <h2 className="text-lg font-semibold mb-2">Confira seu e-mail</h2>
              <p className="text-sm text-muted">
                Enviamos um link de acesso. Abra neste dispositivo para
                continuar (confira também o Spam).
              </p>
            </div>
          ) : (
            <form action={sendMagicLink} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="voce@exa.marketing"
                  className="w-full px-4 py-3 rounded bg-surface border border-border text-sm text-foreground placeholder:text-zinc-500 focus:border-accent/40 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-indigo-500/25 transition-all hover:shadow-indigo-500/30"
              >
                Me envie o link de acesso
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
