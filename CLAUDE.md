# EXA · DM automática — instruções pro Claude

Fork do [OpenReply](https://github.com/diwenne/openreply) (ManyChat open source) adaptado pra EXA. No ar em **https://dm.exa.marketing** (Railway: serviços `web`, `worker`, Postgres, Redis). Leia `LEIA-ME-EXA.md` pro mapa de operação e `README.md` (upstream) pra arquitetura.

- **Design:** siga o `DESIGN.md` desta pasta (cópia do DESIGN.md da EXA, modo "painéis e apps internos": Inter, navy `#101828`, cinza-azulado, azul `#2A78D6` pra dados, lima `#B0F800` só no logo). Interface toda em **português do Brasil**.
- **Deploy:** `npm run db:generate && npm run typecheck && npx vitest run && npx next build` antes; depois `railway up --service web --detach` (e `--service worker` se mexeu em `lib/` ou `worker/`). CLI em `~/.npm-global/bin/railway`.
- **Segredos:** nunca no chat, nunca no commit. Variáveis do Railway via `railway variables --set` com valor vindo de janela nativa ou clipboard (`~/.claude/openreply-secret-from-clipboard.sh VAR`). Cópia local não sensível em `.env.railway.local` (gitignored).
- **Segurança (revisão 21/09/2026):** cabeçalhos + CSP em `next.config.ts`; limite de tentativas de login e proteção de rotas em `proxy.ts`; `ALLOWED_EMAILS` obrigatório; webhook da Meta verificado por assinatura (`INSTAGRAM_APP_SECRET`); cron protegido por `CRON_SECRET`; tokens do Instagram criptografados (`ENCRYPTION_KEY`). Não remover nada disso.
- **Meta:** app "EXA DM" (id 1120030220449063, Instagram app 944927058113056), publicado (Live). Webhook `/api/webhook` com campos `comments` + `messages`. Páginas legais exigidas: `/privacy`, `/terms`, `/data-deletion`.
- **Motor:** o fluxo é linear (gatilho → palavra → resposta pública → DM de abertura → seguir → DM com link → acompanhamento). O "fluxo em blocos" do construtor só desenha esse caminho; ramificações exigiriam motor novo no worker.
- **Backup:** `~/.claude/openreply-backup.sh` faz `pg_dump` via SSH do Railway pra `../openreply-backups/` (fora do repo). Backups nativos do Railway só no plano Hobby (ligar após assinar).
- **Commit + push** ao terminar qualquer entrega (repo `examarketing/openreply`), mensagem em português no padrão `área: o que mudou`.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
