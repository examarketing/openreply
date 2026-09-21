import type { Metadata } from "next";
import LegalShell from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Exclusão de dados · EXA DM automática",
  description: "Como desconectar uma conta de Instagram e pedir a exclusão dos dados guardados pelo painel.",
};

export default function DataDeletionPage() {
  return (
    <LegalShell
      title="Exclusão de dados"
      description="Como remover uma conta de Instagram do painel e apagar os dados relacionados a ela ou a você."
      updatedAt="21 de setembro de 2026"
    >
      <section>
        <h2>Desconectar uma conta de Instagram</h2>
        <p>
          Quem administra a conta entra no painel, abre Configurações e clica
          em Desconectar. O token de acesso é apagado na hora e as automações
          daquela conta param de enviar mensagens. A autorização também pode
          ser removida direto no Instagram, em Configurações → Segurança →
          Apps e sites.
        </p>
      </section>

      <section>
        <h2>Apagar automações, registros e mensagens</h2>
        <p>
          Para excluir automações, registros de envio, comentários e conversas
          guardados, escreva para contato@exa.marketing a partir do e-mail
          autorizado, informando a conta. A exclusão é confirmada por e-mail
          em até 30 dias.
        </p>
      </section>

      <section>
        <h2>Se você comentou ou mandou mensagem para uma conta conectada</h2>
        <p>
          Você pode pedir que seus dados (comentário, mensagens, identificador)
          sejam apagados do painel enviando um e-mail para contato@exa.marketing
          com o seu @ do Instagram e a conta com que interagiu. Respondemos com
          a confirmação em até 30 dias.
        </p>
      </section>

      <section>
        <h2>Pedidos vindos da Meta</h2>
        <p>
          Pedidos de exclusão encaminhados pela Meta são tratados pelo mesmo
          processo, com confirmação enviada pelo canal de origem.
        </p>
      </section>
    </LegalShell>
  );
}
