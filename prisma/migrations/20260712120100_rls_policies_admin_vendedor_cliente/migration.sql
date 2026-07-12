-- ===========================================================================
-- Funções auxiliares (SECURITY DEFINER para evitar recursão de RLS)
-- ===========================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from usuarios
    where id = auth.uid() and perfil = 'ADMINISTRADOR' and ativo = true
  );
$$;

create or replace function public.is_vendedor_dono(dono_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select dono_id = auth.uid();
$$;

-- Trigger: cria a linha em usuarios quando alguém se cadastra (vendedor).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, nome, email, telefone, perfil, ativo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    new.raw_user_meta_data->>'telefone',
    'VENDEDOR',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RPC chamada pelo callback do magic link do cliente para vincular a conta.
create or replace function public.link_cliente_to_current_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update clientes
  set "userId" = auth.uid()
  where "userId" is null
    and email = (select email from auth.users where id = auth.uid());
end;
$$;

-- ===========================================================================
-- usuarios
-- ===========================================================================

drop policy if exists "usuarios_select" on usuarios;
create policy "usuarios_select" on usuarios
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "usuarios_update_admin" on usuarios;
create policy "usuarios_update_admin" on usuarios
  for update using (public.is_admin());

-- ===========================================================================
-- clientes ("oportunidades")
-- ===========================================================================

drop policy if exists "clientes_select" on clientes;
create policy "clientes_select" on clientes
  for select using (
    public.is_admin()
    or "cadastradoPorId" = auth.uid()
    or "userId" = auth.uid()
  );

drop policy if exists "clientes_insert" on clientes;
create policy "clientes_insert" on clientes
  for insert with check (
    public.is_admin() or "cadastradoPorId" = auth.uid()
  );

drop policy if exists "clientes_update_admin" on clientes;
create policy "clientes_update_admin" on clientes
  for update using (public.is_admin());

-- ===========================================================================
-- enderecos / condutores_autorizados (seguem o dono do cliente)
-- ===========================================================================

drop policy if exists "enderecos_select" on enderecos;
create policy "enderecos_select" on enderecos
  for select using (
    exists (
      select 1 from clientes c
      where c.id = enderecos."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid() or c."userId" = auth.uid())
    )
  );

drop policy if exists "enderecos_insert" on enderecos;
create policy "enderecos_insert" on enderecos
  for insert with check (
    exists (
      select 1 from clientes c
      where c.id = enderecos."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid())
    )
  );

drop policy if exists "enderecos_update" on enderecos;
create policy "enderecos_update" on enderecos
  for update using (
    exists (
      select 1 from clientes c
      where c.id = enderecos."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid())
    )
  );

drop policy if exists "condutores_select" on condutores_autorizados;
create policy "condutores_select" on condutores_autorizados
  for select using (
    exists (
      select 1 from clientes c
      where c.id = condutores_autorizados."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid() or c."userId" = auth.uid())
    )
  );

drop policy if exists "condutores_insert" on condutores_autorizados;
create policy "condutores_insert" on condutores_autorizados
  for insert with check (
    exists (
      select 1 from clientes c
      where c.id = condutores_autorizados."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid())
    )
  );

-- ===========================================================================
-- pedidos / pedido_itens / pagamentos
-- ===========================================================================

drop policy if exists "pedidos_select" on pedidos;
create policy "pedidos_select" on pedidos
  for select using (
    exists (
      select 1 from clientes c
      where c.id = pedidos."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid() or c."userId" = auth.uid())
    )
  );

drop policy if exists "pedidos_insert" on pedidos;
create policy "pedidos_insert" on pedidos
  for insert with check (
    exists (
      select 1 from clientes c
      where c.id = pedidos."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid())
    )
  );

drop policy if exists "pedido_itens_select" on pedido_itens;
create policy "pedido_itens_select" on pedido_itens
  for select using (
    exists (
      select 1 from pedidos p join clientes c on c.id = p."clienteId"
      where p.id = pedido_itens."pedidoId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid() or c."userId" = auth.uid())
    )
  );

drop policy if exists "pedido_itens_insert" on pedido_itens;
create policy "pedido_itens_insert" on pedido_itens
  for insert with check (
    exists (
      select 1 from pedidos p join clientes c on c.id = p."clienteId"
      where p.id = pedido_itens."pedidoId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid())
    )
  );

-- Só admin muda status do serviço / pago (vendedor só visualiza).
drop policy if exists "pedido_itens_update_admin" on pedido_itens;
create policy "pedido_itens_update_admin" on pedido_itens
  for update using (public.is_admin());

drop policy if exists "pagamentos_select" on pagamentos;
create policy "pagamentos_select" on pagamentos
  for select using (
    exists (
      select 1 from pedidos p join clientes c on c.id = p."clienteId"
      where p.id = pagamentos."pedidoId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid() or c."userId" = auth.uid())
    )
  );

drop policy if exists "pagamentos_insert_admin" on pagamentos;
create policy "pagamentos_insert_admin" on pagamentos
  for insert with check (public.is_admin());

-- ===========================================================================
-- tarefas / mensagens / arquivos_cliente
-- ===========================================================================

drop policy if exists "tarefas_select" on tarefas;
create policy "tarefas_select" on tarefas
  for select using (
    exists (
      select 1 from clientes c
      where c.id = tarefas."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid() or c."userId" = auth.uid())
    )
  );

drop policy if exists "tarefas_insert" on tarefas;
create policy "tarefas_insert" on tarefas
  for insert with check (
    exists (
      select 1 from clientes c
      where c.id = tarefas."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid())
    )
  );

drop policy if exists "tarefas_update" on tarefas;
create policy "tarefas_update" on tarefas
  for update using (
    exists (
      select 1 from clientes c
      where c.id = tarefas."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid())
    )
  );

drop policy if exists "mensagens_select" on mensagens;
create policy "mensagens_select" on mensagens
  for select using (
    exists (
      select 1 from clientes c
      where c.id = mensagens."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid() or c."userId" = auth.uid())
    )
  );

drop policy if exists "mensagens_insert" on mensagens;
create policy "mensagens_insert" on mensagens
  for insert with check (
    exists (
      select 1 from clientes c
      where c.id = mensagens."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid() or c."userId" = auth.uid())
    )
  );

drop policy if exists "arquivos_cliente_select" on arquivos_cliente;
create policy "arquivos_cliente_select" on arquivos_cliente
  for select using (
    exists (
      select 1 from clientes c
      where c.id = arquivos_cliente."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid() or c."userId" = auth.uid())
    )
  );

drop policy if exists "arquivos_cliente_insert" on arquivos_cliente;
create policy "arquivos_cliente_insert" on arquivos_cliente
  for insert with check (
    exists (
      select 1 from clientes c
      where c.id = arquivos_cliente."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid() or c."userId" = auth.uid())
    )
  );

drop policy if exists "arquivos_cliente_delete" on arquivos_cliente;
create policy "arquivos_cliente_delete" on arquivos_cliente
  for delete using (
    exists (
      select 1 from clientes c
      where c.id = arquivos_cliente."clienteId"
        and (public.is_admin() or c."cadastradoPorId" = auth.uid())
    )
  );

-- ===========================================================================
-- servicos / documento_templates (catálogo — leitura geral, escrita admin)
-- ===========================================================================

drop policy if exists "servicos_select" on servicos;
create policy "servicos_select" on servicos
  for select using (auth.uid() is not null);

drop policy if exists "servicos_write_admin" on servicos;
create policy "servicos_write_admin" on servicos
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "documento_templates_select" on documento_templates;
create policy "documento_templates_select" on documento_templates
  for select using (auth.uid() is not null);

drop policy if exists "documento_templates_write_admin" on documento_templates;
create policy "documento_templates_write_admin" on documento_templates
  for all using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- lembretes
-- ===========================================================================

drop policy if exists "lembretes_select" on lembretes;
create policy "lembretes_select" on lembretes
  for select using (
    "usuarioId" = auth.uid() or publico = true or public.is_admin()
  );

drop policy if exists "lembretes_insert" on lembretes;
create policy "lembretes_insert" on lembretes
  for insert with check ("usuarioId" = auth.uid() or public.is_admin());

drop policy if exists "lembretes_update" on lembretes;
create policy "lembretes_update" on lembretes
  for update using ("usuarioId" = auth.uid() or public.is_admin());
