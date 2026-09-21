# EXA · DM automática — como operar

Painel de automação de comentário → DM do Instagram das contas da EXA e dos experts. Fork do OpenReply, no ar em **https://dm.exa.marketing**.

## Onde está cada coisa

| O quê | Onde |
|---|---|
| Painel | https://dm.exa.marketing (login por link no e-mail; só e-mails em `ALLOWED_EMAILS`) |
| Hospedagem | Railway, projeto `openreply` → serviços `web`, `worker` (fila + cron), `Postgres`, `Redis`. Postgres e Redis sem acesso público (só rede interna). |
| App na Meta | "EXA DM" (id 1120030220449063), publicado. Webhook `https://dm.exa.marketing/api/webhook` |
| E-mail de acesso | Resend (`RESEND_API_KEY`); remetente em `EMAIL_FROM` |
| Domínio | `dm` CNAME na Hostinger → Railway |
| Código | GitHub `examarketing/openreply` (fork de `diwenne/openreply`) |
| Backups | `~/.claude/openreply-backup.sh` (pg_dump por SSH → `../openreply-backups/`); backups nativos do Railway após o plano Hobby |

## Telas

- **Início** — KPIs, gráfico por dia, funil, status dos envios, ranking por automação.
- **Automações** — lista; **Nova automação** tem o construtor (formulário) + "Fluxo em blocos" (desenho do caminho) + "Prévia no celular".
- **Registro de DMs** — cada envio com status (Enviada, Falhou, Na fila, Pessoa repetida, Limite da Meta…).
- **Caixa de entrada** — conversas da conta, com foto e nome de quem escreveu.
- **Visão geral** — perfil e seguidores da conta conectada.
- **Configurações** — conectar/desconectar Instagram, membros.
- **Diagnóstico** — fila, worker, falhas de webhook/token.

## Rotina de deploy

```bash
npm run db:generate && npm run typecheck && npx vitest run && npx next build
railway up --service web --detach
railway up --service worker --detach   # só se mexeu em lib/ ou worker/
```

Saúde: `https://dm.exa.marketing/api/health` (detalhes só logado).

## Segurança — o que está ligado

- Login por link mágico (Auth.js + Resend) restrito a `ALLOWED_EMAILS`; limite de 5 pedidos por IP a cada 15 min; botão **Sair** na barra lateral.
- Cabeçalhos: HSTS, CSP, nosniff, sem iframe, sem indexação (robots + `X-Robots-Tag`).
- Webhook da Meta só aceita payload assinado com o segredo do app; cron só com `CRON_SECRET`.
- Tokens do Instagram criptografados no banco (`ENCRYPTION_KEY`); OAuth com `state` assinado.
- Dependências: `npm audit --omit=dev` — o que sobra está só na CLI do Prisma (não roda em produção).

## Limites conhecidos

- O motor é linear (sem ramificações/condições como no ManyChat).
- Meta: 750 DMs privadas por hora por conta; comentário sem palavra-chave não gera DM.
- Sem evento de "novo seguidor" na API oficial.
