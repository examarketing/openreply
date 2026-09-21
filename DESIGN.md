---
version: 1.0
name: EXA (institucional, painéis e apps próprios)
description: Marca da EXA — coprodutora de experts. Preto e verde-lima elétrico, tipografia sans neutra, zero enfeite. Dois usos - (1) institucional/propostas/site de coprodução, onde o lima é a assinatura; (2) painéis e apps internos (Painel EXA, painéis de funil, deck de tarefas), onde a interface é cinza-azulada limpa com semáforo de KPI e o lima aparece só no logo.
fontes-de-verdade:
  - "EXA - Institucional/ (LogoEXAGreen.png, LogoEXAWhite.png, LogoEXABlack.png, LogoEXAPadrão.png, Site Coprodução)"
  - "EXA - Dashboards/painel-exa/app (CSS em produção em www.exa.marketing/painel)"

colors:
  lima: "#B0F800"            # verde-lima do logo — assinatura, destaque, botão em fundo preto
  preto: "#0A0A0A"           # fundo institucional, logo
  branco: "#FFFFFF"
  # UI de painel
  navy: "#101828"            # texto principal, títulos
  cinza-700: "#344054"       # texto
  cinza-500: "#667085"       # texto secundário
  cinza-400: "#98A2B3"       # placeholder, ícones inativos
  cinza-300: "#C5CCD6"       # bordas
  cinza-100: "#F2F4F7"       # fundo de seção, linhas de tabela
  azul: "#2A78D6"            # links, dados, gráfico primário
  laranja: "#EB6834"         # atenção, ação secundária, marco no gráfico
  ok: "#12B76A"              # semáforo verde (meta batida)
  atencao: "#F79009"         # semáforo âmbar (perto da meta)
  ruim: "#A12A2A"            # semáforo vermelho (abaixo da meta)
  ambar-suave: "#FFF3D6"     # fundo de aviso
  ambar-ink: "#8A5A00"       # texto sobre ambar-suave

typography:
  display:
    fontFamily: "Inter, -apple-system, Segoe UI, Roboto, sans-serif"
    fontWeight: 700
    letterSpacing: -0.5px
    lineHeight: 1.15
  body:
    fontFamily: "Inter, -apple-system, Segoe UI, Roboto, sans-serif"
    fontWeight: 400-500
    fontSize: 14-16px
    lineHeight: 1.5
  numeros:
    fontFamily: "Inter, tabular-nums"
    fontWeight: 600
    uso: "KPIs, tabelas — sempre com font-variant-numeric: tabular-nums"
  mono:
    fontFamily: "IBM Plex Mono, SF Mono, Menlo, monospace"
    uso: "ids, códigos de oferta, UTMs, chaves"

rounding:
  botao: 8px
  cartao: 12px
  input: 8px
  pill: 999px

spacing:
  base: 8px
  gutter-mobile: 16px
  sidebar: 240px
  largura-max: 1280px

elevation:
  cartao: "0 1px 2px rgba(16, 24, 40, .06), 0 1px 3px rgba(16, 24, 40, .10)"
  flutuante: "0 12px 24px rgba(16, 24, 40, .12)"
---

## Visão geral

- **Institucional** (site de coprodução, propostas, apresentações, PDFs): fundo preto `#0A0A0A` ou branco, logo lima, títulos grandes em Inter 700, muito espaço. O lima é raro e por isso chama — um bloco por página.
- **Painéis e apps internos**: interface clara (branco + cinza-100), texto navy, bordas cinza-300, dados em azul, semáforo verde/âmbar/vermelho para KPI contra meta, laranja para atenção e marcos. O lima só no logo do topo. Mobile e PWA (os painéis são abertos no celular do André).

## Cores — regras

- Lima nunca como fundo de tela inteira nem como texto pequeno (contraste ruim sobre branco). Sobre preto, lima em títulos e botão; sobre branco, lima só em detalhe (linha, ícone, logo).
- Semáforo tem significado fixo: verde = meta batida, âmbar = até 15% abaixo, vermelho = abaixo disso. Não usar essas cores para outra coisa no painel.
- Azul é dado/link; laranja é atenção. Não trocar entre si.
- Fundo de painel é branco com seções cinza-100; nada de dark mode por padrão (leitura de número).

## Tipografia — regras

- Inter em tudo; números sempre tabulares e alinhados à direita nas tabelas.
- KPI: valor em 28–32 px 600, rótulo em 12–13 px cinza-500 caixa alta com tracking 0.06em, variação em 13 px colorida pelo semáforo.
- Títulos de tela em 20–24 px 700 navy.

## Layout

- Painel: topo com logo + seletor de período + cliente; abas horizontais no mobile, sidebar 240 px no desktop; cartões de KPI em grade 2 col (mobile) / 4 col (desktop); tabelas com cabeçalho fixo.
- Institucional: seções de 96 px (desktop) / 56 px (mobile), texto em coluna de 720 px.

## Componentes

- **Cartão de KPI**: fundo branco, borda cinza-300, raio 12, valor + rótulo + variação + barrinha de meta.
- **Tabela**: linhas 44 px, zebra cinza-100, ordenável, números tabulares.
- **Botão primário (painel)**: navy com texto branco; **institucional**: lima com texto preto.
- **Botão secundário**: contorno cinza-300, texto cinza-700.
- **Aviso**: fundo ambar-suave, texto ambar-ink, ícone.
- **Marco no gráfico**: linha vertical laranja tracejada com rótulo (ex.: "capa v2 17/09").
- **Semáforo**: bolinha 8 px ao lado do KPI, cor conforme regra.

## Faça / não faça

- Faça: mostrar meta ao lado de todo KPI; período e cliente sempre visíveis; estados vazios explicando o que falta (ex.: "webhook Hubla não ligado").
- Faça: PWA com ícone EXA (lima sobre preto).
- Não faça: gráfico com mais de 4 séries, gradientes, sombras coloridas, ícones decorativos.
- Não faça: cores de semáforo em botão ou texto comum.

## Responsivo

- Painéis: mobile-first (360–430 px), grade 2 col, abas roláveis; desktop ≥ 1024 px com sidebar.

## Lacunas conhecidas

- O site de coprodução e as propostas em PDF ainda não seguem um template único; ao refazer, usar este arquivo.
- Não há ícone/favicon oficial em SVG — gerar a partir de LogoEXAGreen (lima sobre preto).
