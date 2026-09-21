import NextAuth, { type NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/client";
import { ensureWorkspaceForUser, getPrimaryWorkspace } from "@/lib/workspace";
import { isEmailAllowedToSignIn } from "@/lib/env";

type AdapterPrismaClient = Parameters<typeof PrismaAdapter>[0];

const emailFrom = process.env.EMAIL_FROM ?? "EXA DM automática <login@example.com>";

// Só Resend (HTTP). O provedor SMTP do upstream foi removido: a EXA não usa
// e ele puxava o pacote nodemailer, que tinha falhas abertas sem correção.
export const EMAIL_PROVIDER_ID = "resend";

export const authConfig = {
  adapter: PrismaAdapter(prisma as unknown as AdapterPrismaClient),
  providers: [
    Resend({
          apiKey: process.env.RESEND_API_KEY ?? "missing-resend-api-key",
          from: emailFrom,
          // E-mail de acesso em português, com a cara da EXA.
          async sendVerificationRequest({ identifier, url, provider }) {
            const host = new URL(url).host;
            const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#F2F4F7;font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif;color:#101828">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#ffffff;border:1px solid #D6DAE0;border-radius:12px">
<tr><td style="padding:28px 28px 8px"><span style="display:inline-block;width:12px;height:12px;background:#B0F800;border-radius:3px;vertical-align:middle;margin-right:8px"></span><strong style="font-size:16px;vertical-align:middle">EXA · DM automática</strong></td></tr>
<tr><td style="padding:8px 28px 0;font-size:15px;line-height:1.55">Seu link de acesso ao painel de automações do Instagram (<strong>${host}</strong>). Ele vale por 24 horas e só funciona uma vez.</td></tr>
<tr><td style="padding:24px 28px"><a href="${url}" style="display:inline-block;background:#101828;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 24px;border-radius:10px">Entrar no painel</a></td></tr>
<tr><td style="padding:0 28px 28px;font-size:13px;line-height:1.5;color:#667085">Se você não pediu este acesso, pode ignorar este e-mail. Se o botão não abrir, copie este endereço no navegador:<br><span style="word-break:break-all">${url}</span></td></tr>
</table></td></tr></table></body></html>`;
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${provider.apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: provider.from,
                to: identifier,
                subject: `Seu acesso ao painel EXA · DM automática`,
                html,
                text: `Seu link de acesso ao painel EXA · DM automática (${host}): ${url}\n\nVale por 24 horas e funciona uma vez. Se você não pediu, ignore este e-mail.`,
              }),
            });
            if (!res.ok) {
              throw new Error(`Resend error: ${res.status} ${await res.text()}`);
            }
          },
        }),
  ],
  callbacks: {
    // Runs before the magic link is sent, so a blocked address never receives
    // one, and again when the link is verified.
    async signIn({ user }) {
      return isEmailAllowedToSignIn(user?.email);
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await ensureWorkspaceForUser(user.id, user.email);
      }
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
  },
  session: {
    strategy: "database",
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function getCurrentWorkspaceId(): Promise<string | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const workspace = await getPrimaryWorkspace(userId);
  if (workspace) return workspace.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const createdWorkspace = await ensureWorkspaceForUser(userId, user?.email);
  return createdWorkspace.id;
}
