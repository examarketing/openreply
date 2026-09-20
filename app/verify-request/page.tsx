import Link from "next/link";

export const metadata = {
  title: "Confira seu e-mail - EXA DM automática",
  description: "Um link de acesso foi enviado para o seu e-mail.",
};

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            EXA · DM automática
          </h1>
        </div>

        <div className="panel rounded p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Confira seu e-mail</h2>
          <p className="text-sm text-muted">
            Enviamos um link de acesso. Abra neste dispositivo para
            continuar (confira também o Spam).
          </p>
          <p className="mt-6 text-sm">
            <Link href="/login" className="text-accent hover:underline">
              Voltar para o login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
