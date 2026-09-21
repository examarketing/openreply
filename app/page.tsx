import { redirect } from "next/navigation";

// Ferramenta interna da EXA: não existe página pública. A raiz manda pro
// painel, e o layout do painel manda pro login quem não estiver autenticado.
export default function RootPage() {
  redirect("/dashboard");
}
