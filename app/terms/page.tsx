import type { Metadata } from "next";
import LegalShell from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Termos de uso · EXA DM automática",
  description: "Condições de uso do painel interno de DM automática da EXA Marketing.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Termos de uso"
      description="Estes termos valem para quem acessa o painel EXA · DM automática. É uma ferramenta interna da EXA Marketing, sem oferta ao público."
      updatedAt="21 de setembro de 2026"
    >
      <section>
        <h2>Acesso</h2>
        <p>
          O acesso é individual, por e-mail autorizado pela EXA, e pode ser
          revogado a qualquer momento. Quem acessa se compromete a não
          compartilhar o link de acesso nem usar o painel fora das atividades
          da EXA e dos experts parceiros.
        </p>
      </section>

      <section>
        <h2>Uso das contas de Instagram</h2>
        <p>
          Só podem ser conectadas contas profissionais cujo administrador
          autorizou a EXA a operá-las. As automações devem respeitar as
          Políticas da Plataforma da Meta e os Termos do Instagram: nada de
          spam, mensagens enganosas ou conteúdo que viole as regras da
          plataforma. A EXA pode pausar qualquer automação que descumpra isso.
        </p>
      </section>

      <section>
        <h2>Limites e responsabilidade</h2>
        <p>
          O envio depende da API da Meta, que impõe limites de volume e pode
          mudar sem aviso. A EXA não garante entrega de todas as mensagens nem
          disponibilidade contínua do painel, e não se responsabiliza por
          decisões da Meta sobre as contas conectadas.
        </p>
      </section>

      <section>
        <h2>Contato</h2>
        <p>Dúvidas sobre estes termos: contato@exa.marketing.</p>
      </section>
    </LegalShell>
  );
}
