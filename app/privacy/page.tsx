import type { Metadata } from "next";
import LegalShell from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Política de privacidade · EXA DM automática",
  description:
    "Como a EXA Marketing trata os dados das contas de Instagram conectadas ao painel de DM automática.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Política de privacidade"
      description="O painel EXA · DM automática é uma ferramenta interna da EXA Marketing (exa.marketing) usada para responder, por mensagem direta, quem comenta nos posts das contas de Instagram administradas pela EXA e pelos experts parceiros."
      updatedAt="21 de setembro de 2026"
    >
      <section>
        <h2>Quem opera o painel</h2>
        <p>
          EXA Marketing, Brasil. Contato: contato@exa.marketing. O painel só é
          acessado por pessoas da equipe da EXA autorizadas por e-mail; não há
          cadastro aberto ao público.
        </p>
      </section>

      <section>
        <h2>Quais dados coletamos</h2>
        <ul>
          <li>E-mail de quem acessa o painel, para autenticação por link de acesso.</li>
          <li>Identificadores e nome de usuário das contas profissionais de Instagram conectadas, e o token de acesso da Meta, guardado criptografado.</li>
          <li>Comentários recebidos nos posts dessas contas (texto, autor e identificador), necessários para reconhecer a palavra-chave e responder.</li>
          <li>Mensagens diretas trocadas entre a conta conectada e as pessoas que interagiram com ela, quando lidas pela caixa de entrada do painel.</li>
          <li>Registro das mensagens enviadas pela automação, cliques nos links rastreados e eventos técnicos (webhooks, erros).</li>
        </ul>
      </section>

      <section>
        <h2>Para que usamos</h2>
        <p>
          Exclusivamente para operar as automações de comentário → mensagem
          direta pela API oficial da Meta: identificar comentários com a
          palavra-chave configurada, enviar a resposta pública e a mensagem
          privada, evitar envios duplicados, medir cliques e diagnosticar
          falhas. Não vendemos, alugamos nem compartilhamos esses dados com
          terceiros, e não os usamos para publicidade.
        </p>
      </section>

      <section>
        <h2>Dados da Meta / Instagram</h2>
        <p>
          O acesso às contas é feito pela API do Instagram com login do
          Instagram, com as permissões concedidas pelo administrador de cada
          conta. Seguimos as Políticas da Plataforma da Meta. O token pode ser
          revogado a qualquer momento pelo administrador da conta, no próprio
          painel (Configurações → Desconectar) ou nas configurações do
          Instagram.
        </p>
      </section>

      <section>
        <h2>Onde ficam e por quanto tempo</h2>
        <p>
          Os dados ficam em banco de dados hospedado na Railway (EUA) com
          acesso restrito à rede interna do projeto, e transitam sempre por
          HTTPS. Registros de comentários e mensagens são mantidos enquanto a
          conta estiver conectada e as automações existirem; ao desconectar a
          conta, o token é apagado imediatamente.
        </p>
      </section>

      <section>
        <h2>Seus direitos</h2>
        <p>
          Qualquer pessoa cujos dados apareçam no painel (por exemplo, quem
          comentou num post) pode pedir acesso, correção ou exclusão pelo
          e-mail contato@exa.marketing. Veja também a página de exclusão de
          dados.
        </p>
      </section>
    </LegalShell>
  );
}
