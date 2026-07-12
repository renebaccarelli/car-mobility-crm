-- 1. Limpar dados de teste (descartáveis)
TRUNCATE TABLE clientes CASCADE;
DELETE FROM usuarios;

-- 2. Derrubar constraints que impedem troca de tipo
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS "clientes_cadastradoPorId_fkey";
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS "clientes_consultorId_fkey";
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS "clientes_empresaId_fkey";
ALTER TABLE mensagens DROP CONSTRAINT IF EXISTS "mensagens_autorId_fkey";
ALTER TABLE arquivos_cliente DROP CONSTRAINT IF EXISTS "arquivos_cliente_enviadoPorId_fkey";
ALTER TABLE lembretes DROP CONSTRAINT IF EXISTS "lembretes_usuarioId_fkey";
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS "usuarios_empresaId_fkey";
ALTER TABLE enderecos DROP CONSTRAINT IF EXISTS "enderecos_empresaId_fkey";

-- 3. Derrubar tabelas multi-tenant antigas
DROP TABLE IF EXISTS empresa_metodos_pagamento CASCADE;
DROP TABLE IF EXISTS empresa_servicos CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;
DROP TABLE IF EXISTS grupos CASCADE;

-- 4. Reestruturar usuarios (vira perfil 1:1 com auth.users)
ALTER TABLE usuarios DROP COLUMN IF EXISTS "empresaId";
ALTER TABLE usuarios DROP COLUMN IF EXISTS "senhaHash";
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone text;
ALTER TABLE usuarios ALTER COLUMN id TYPE uuid USING id::uuid;

ALTER TABLE usuarios ALTER COLUMN perfil DROP DEFAULT;
ALTER TYPE "TipoPerfil" RENAME TO "TipoPerfil_old";
CREATE TYPE "TipoPerfil" AS ENUM ('ADMINISTRADOR', 'VENDEDOR');
ALTER TABLE usuarios ALTER COLUMN perfil TYPE "TipoPerfil" USING perfil::text::"TipoPerfil";
ALTER TABLE usuarios ALTER COLUMN perfil SET DEFAULT 'VENDEDOR';
DROP TYPE "TipoPerfil_old";

ALTER TABLE usuarios ADD CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Reestruturar clientes
ALTER TABLE clientes DROP COLUMN IF EXISTS "empresaId";
ALTER TABLE clientes DROP COLUMN IF EXISTS "consultorId";
ALTER TABLE clientes ALTER COLUMN "cadastradoPorId" TYPE uuid USING "cadastradoPorId"::uuid;
ALTER TABLE clientes ALTER COLUMN "cadastradoPorId" SET NOT NULL;
ALTER TABLE clientes ADD COLUMN "userId" uuid;
ALTER TABLE clientes ADD CONSTRAINT clientes_userId_key UNIQUE ("userId");
ALTER TABLE clientes ADD CONSTRAINT clientes_userId_fkey FOREIGN KEY ("userId") REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE clientes ADD CONSTRAINT clientes_cadastradoPorId_fkey FOREIGN KEY ("cadastradoPorId") REFERENCES usuarios(id) ON DELETE RESTRICT;

-- 6. enderecos perde vínculo com empresa
ALTER TABLE enderecos DROP COLUMN IF EXISTS "empresaId";

-- 7. FKs para usuarios (uuid) em mensagens / arquivos_cliente / lembretes
ALTER TABLE mensagens ALTER COLUMN "autorId" TYPE uuid USING "autorId"::uuid;
ALTER TABLE mensagens ADD CONSTRAINT "mensagens_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES usuarios(id) ON DELETE SET NULL;

ALTER TABLE arquivos_cliente ALTER COLUMN "enviadoPorId" TYPE uuid USING "enviadoPorId"::uuid;
ALTER TABLE arquivos_cliente ADD CONSTRAINT "arquivos_cliente_enviadoPorId_fkey" FOREIGN KEY ("enviadoPorId") REFERENCES usuarios(id) ON DELETE SET NULL;

ALTER TABLE lembretes ALTER COLUMN "usuarioId" TYPE uuid USING "usuarioId"::uuid;
ALTER TABLE lembretes ADD CONSTRAINT "lembretes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES usuarios(id) ON DELETE CASCADE;
