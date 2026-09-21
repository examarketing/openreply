import type { MetadataRoute } from "next";

// Instalável na tela inicial (iOS: Compartilhar → Adicionar à Tela de Início;
// Android: aviso de instalação). Abre sem a barra do navegador.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EXA · DM automática do Instagram",
    short_name: "EXA DM",
    description: "Automação de comentário → DM do Instagram das contas da EXA.",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: "#101828",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
