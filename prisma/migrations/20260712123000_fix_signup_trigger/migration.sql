-- O trigger só deve criar a linha em usuarios (vendedor/admin) quando o
-- signup vier explicitamente do formulário de vendedor (metadata tipo=vendedor).
-- Login de cliente via magic link também cria uma linha em auth.users, mas
-- NÃO deve virar um "usuario" — o cliente é vinculado via clientes.userId.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data->>'tipo' = 'vendedor' then
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
  end if;
  return new;
end;
$$;
