-- ===========================================================================
-- Enum: adiciona CONCESSIONARIA a TipoPerfil (recria o tipo, mesmo padrão
-- já usado na migration 20260712120000 para trocar esse mesmo enum).
-- ===========================================================================

ALTER TABLE usuarios ALTER COLUMN perfil DROP DEFAULT;
ALTER TYPE "TipoPerfil" RENAME TO "TipoPerfil_old";
CREATE TYPE "TipoPerfil" AS ENUM ('ADMINISTRADOR', 'VENDEDOR', 'CONCESSIONARIA');
ALTER TABLE usuarios ALTER COLUMN perfil TYPE "TipoPerfil" USING perfil::text::"TipoPerfil";
ALTER TABLE usuarios ALTER COLUMN perfil SET DEFAULT 'VENDEDOR';
DROP TYPE "TipoPerfil_old";

-- ===========================================================================
-- Tabelas novas: marcas, concessionarias, concessionaria_marcas
-- ===========================================================================

CREATE TABLE marcas (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome text NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE concessionarias (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome text NOT NULL,
  telefone text,
  ativo boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

-- A "unidade autônoma": uma marca dentro de uma concessionária. O Vendedor
-- é vinculado aqui (não direto à concessionária) para que marcas diferentes
-- da mesma concessionária fiquem isoladas entre si.
CREATE TABLE concessionaria_marcas (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "concessionariaId" text NOT NULL REFERENCES concessionarias(id) ON DELETE CASCADE,
  "marcaId" text NOT NULL REFERENCES marcas(id) ON DELETE RESTRICT,
  UNIQUE ("concessionariaId", "marcaId")
);

drop trigger if exists set_updated_at on concessionarias;
create trigger set_updated_at before update on concessionarias
  for each row execute procedure public.set_updated_at();

-- ===========================================================================
-- usuarios: FKs opcionais pra unidade (vendedor) e concessionária (login)
-- ===========================================================================

ALTER TABLE usuarios ADD COLUMN "concessionariaMarcaId" text
  REFERENCES concessionaria_marcas(id) ON DELETE SET NULL;
ALTER TABLE usuarios ADD COLUMN "concessionariaId" text
  REFERENCES concessionarias(id) ON DELETE SET NULL;

-- ===========================================================================
-- RLS: habilita nas tabelas novas
-- ===========================================================================

ALTER TABLE public.marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concessionarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concessionaria_marcas ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- Funções auxiliares
-- ===========================================================================

create or replace function public.is_concessionaria()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from usuarios
    where id = auth.uid() and perfil = 'CONCESSIONARIA' and ativo = true
  );
$$;

-- true se o vendedor "vendedor_id" pertence a alguma unidade (marca) da
-- concessionária representada pelo usuário logado (que precisa ser
-- perfil CONCESSIONARIA). SECURITY DEFINER pra evitar recursão de RLS.
create or replace function public.is_concessionaria_dono(vendedor_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from usuarios v
    join concessionaria_marcas cm on cm.id = v."concessionariaMarcaId"
    join usuarios uc on uc.id = auth.uid()
    where v.id = vendedor_id
      and uc.perfil = 'CONCESSIONARIA' and uc.ativo = true
      and cm."concessionariaId" = uc."concessionariaId"
  );
$$;

-- Id da concessionária/unidade do usuário logado — SECURITY DEFINER pra não
-- depender de RLS em usuarios ao ser chamada de policies de outras tabelas
-- (mesmo motivo de is_admin() já existir).
create or replace function public.minha_concessionaria_id()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select "concessionariaId" from usuarios where id = auth.uid();
$$;

create or replace function public.minha_unidade_id()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select "concessionariaMarcaId" from usuarios where id = auth.uid();
$$;

-- ===========================================================================
-- Policies: marcas / concessionarias / concessionaria_marcas
-- ===========================================================================

drop policy if exists "marcas_select" on marcas;
create policy "marcas_select" on marcas
  for select using (auth.uid() is not null);

drop policy if exists "marcas_write_admin" on marcas;
create policy "marcas_write_admin" on marcas
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "concessionarias_select" on concessionarias;
create policy "concessionarias_select" on concessionarias
  for select using (
    public.is_admin()
    or id = public.minha_concessionaria_id()
    or exists (
      select 1 from concessionaria_marcas cm
      where cm."concessionariaId" = concessionarias.id
        and cm.id = public.minha_unidade_id()
    )
  );

drop policy if exists "concessionarias_write_admin" on concessionarias;
create policy "concessionarias_write_admin" on concessionarias
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "concessionaria_marcas_select" on concessionaria_marcas;
create policy "concessionaria_marcas_select" on concessionaria_marcas
  for select using (
    public.is_admin()
    or "concessionariaId" = public.minha_concessionaria_id()
    or id = public.minha_unidade_id()
  );

drop policy if exists "concessionaria_marcas_write_admin" on concessionaria_marcas;
create policy "concessionaria_marcas_write_admin" on concessionaria_marcas
  for all using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- Estende policies existentes: concessionária vê os vendedores das suas
-- unidades e os clientes cadastrados por eles (só leitura).
-- ===========================================================================

drop policy if exists "usuarios_select" on usuarios;
create policy "usuarios_select" on usuarios
  for select using (
    id = auth.uid()
    or public.is_admin()
    or public.is_concessionaria_dono(id)
  );

drop policy if exists "clientes_select" on clientes;
create policy "clientes_select" on clientes
  for select using (
    public.is_admin()
    or "cadastradoPorId" = auth.uid()
    or "userId" = auth.uid()
    or public.is_concessionaria_dono("cadastradoPorId")
  );

drop policy if exists "enderecos_select" on enderecos;
create policy "enderecos_select" on enderecos
  for select using (
    exists (
      select 1 from clientes c
      where c.id = enderecos."clienteId"
        and (
          public.is_admin()
          or c."cadastradoPorId" = auth.uid()
          or c."userId" = auth.uid()
          or public.is_concessionaria_dono(c."cadastradoPorId")
        )
    )
  );

drop policy if exists "condutores_select" on condutores_autorizados;
create policy "condutores_select" on condutores_autorizados
  for select using (
    exists (
      select 1 from clientes c
      where c.id = condutores_autorizados."clienteId"
        and (
          public.is_admin()
          or c."cadastradoPorId" = auth.uid()
          or c."userId" = auth.uid()
          or public.is_concessionaria_dono(c."cadastradoPorId")
        )
    )
  );

drop policy if exists "pedidos_select" on pedidos;
create policy "pedidos_select" on pedidos
  for select using (
    exists (
      select 1 from clientes c
      where c.id = pedidos."clienteId"
        and (
          public.is_admin()
          or c."cadastradoPorId" = auth.uid()
          or c."userId" = auth.uid()
          or public.is_concessionaria_dono(c."cadastradoPorId")
        )
    )
  );

drop policy if exists "pedido_itens_select" on pedido_itens;
create policy "pedido_itens_select" on pedido_itens
  for select using (
    exists (
      select 1 from pedidos p join clientes c on c.id = p."clienteId"
      where p.id = pedido_itens."pedidoId"
        and (
          public.is_admin()
          or c."cadastradoPorId" = auth.uid()
          or c."userId" = auth.uid()
          or public.is_concessionaria_dono(c."cadastradoPorId")
        )
    )
  );

drop policy if exists "pagamentos_select" on pagamentos;
create policy "pagamentos_select" on pagamentos
  for select using (
    exists (
      select 1 from pedidos p join clientes c on c.id = p."clienteId"
      where p.id = pagamentos."pedidoId"
        and (
          public.is_admin()
          or c."cadastradoPorId" = auth.uid()
          or c."userId" = auth.uid()
          or public.is_concessionaria_dono(c."cadastradoPorId")
        )
    )
  );

drop policy if exists "tarefas_select" on tarefas;
create policy "tarefas_select" on tarefas
  for select using (
    exists (
      select 1 from clientes c
      where c.id = tarefas."clienteId"
        and (
          public.is_admin()
          or c."cadastradoPorId" = auth.uid()
          or c."userId" = auth.uid()
          or public.is_concessionaria_dono(c."cadastradoPorId")
        )
    )
  );

drop policy if exists "mensagens_select" on mensagens;
create policy "mensagens_select" on mensagens
  for select using (
    exists (
      select 1 from clientes c
      where c.id = mensagens."clienteId"
        and (
          public.is_admin()
          or c."cadastradoPorId" = auth.uid()
          or c."userId" = auth.uid()
          or public.is_concessionaria_dono(c."cadastradoPorId")
        )
    )
  );

drop policy if exists "arquivos_cliente_select" on arquivos_cliente;
create policy "arquivos_cliente_select" on arquivos_cliente
  for select using (
    exists (
      select 1 from clientes c
      where c.id = arquivos_cliente."clienteId"
        and (
          public.is_admin()
          or c."cadastradoPorId" = auth.uid()
          or c."userId" = auth.uid()
          or public.is_concessionaria_dono(c."cadastradoPorId")
        )
    )
  );
