-- Um lead só vira cliente quando o administrador atribui um serviço a ele.
-- Vendedor deixa de poder criar pedidos/itens de pedido (só visualiza).

drop policy if exists "pedidos_insert" on pedidos;
create policy "pedidos_insert" on pedidos
  for insert
  with check (public.is_admin());

drop policy if exists "pedido_itens_insert" on pedido_itens;
create policy "pedido_itens_insert" on pedido_itens
  for insert
  with check (public.is_admin());
