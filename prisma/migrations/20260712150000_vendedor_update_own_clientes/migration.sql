-- Permite que o vendedor edite os próprios clientes (dados cadastrais),
-- mas nunca a etapa do processo — isso continua exclusivo do administrador,
-- garantido por trigger (não apenas pela UI).

create or replace function public.prevent_vendedor_etapa_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() and (new."etapaAtual" is distinct from old."etapaAtual") then
    raise exception 'Apenas administradores podem alterar a etapa do processo.';
  end if;
  return new;
end;
$$;

drop trigger if exists clientes_prevent_vendedor_etapa_change on clientes;
create trigger clientes_prevent_vendedor_etapa_change
  before update on clientes
  for each row execute procedure public.prevent_vendedor_etapa_change();

drop policy if exists "clientes_update_vendedor" on clientes;
create policy "clientes_update_vendedor" on clientes
  for update
  using ("cadastradoPorId" = auth.uid())
  with check ("cadastradoPorId" = auth.uid());
