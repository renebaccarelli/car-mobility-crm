import "server-only";

// A Vercel injeta VERCEL_GIT_COMMIT_SHA automaticamente no build; localmente
// (npm run dev) essa variável não existe, então cai no fallback "dev".
export function getAppVersion() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  return sha ? sha.slice(0, 7) : "dev";
}
