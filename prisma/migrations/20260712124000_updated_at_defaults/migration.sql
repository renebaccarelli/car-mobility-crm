-- "updatedAt" era preenchido pelo Prisma Client (@updatedAt) antes de cada
-- INSERT/UPDATE, não pelo Postgres. Isso quebrou o trigger de signup (INSERT
-- em usuarios sem updatedAt -> violação de NOT NULL). Corrige com DEFAULT
-- para inserts e um trigger BEFORE UPDATE para manter o comportamento em updates.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

ALTER TABLE usuarios ALTER COLUMN "updatedAt" SET DEFAULT now();
ALTER TABLE clientes ALTER COLUMN "updatedAt" SET DEFAULT now();
ALTER TABLE servicos ALTER COLUMN "updatedAt" SET DEFAULT now();
ALTER TABLE pedidos ALTER COLUMN "updatedAt" SET DEFAULT now();
ALTER TABLE documento_templates ALTER COLUMN "updatedAt" SET DEFAULT now();

drop trigger if exists set_updated_at on usuarios;
create trigger set_updated_at before update on usuarios
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on clientes;
create trigger set_updated_at before update on clientes
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on servicos;
create trigger set_updated_at before update on servicos
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on pedidos;
create trigger set_updated_at before update on pedidos
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on documento_templates;
create trigger set_updated_at before update on documento_templates
  for each row execute procedure public.set_updated_at();
