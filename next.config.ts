import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Upload de arquivos do cliente vai direto pro Storage (não passa
      // mais por aqui). Isso ainda cobre o upload de templates .docx pelo
      // admin, que continua indo via Server Action.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
