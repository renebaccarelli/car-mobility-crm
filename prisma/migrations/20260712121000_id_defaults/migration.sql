-- As colunas id eram preenchidas pelo Prisma Client (cuid()) antes do INSERT,
-- não por um DEFAULT do Postgres. Agora que os inserts passam pelo cliente
-- Supabase (PostgREST) diretamente, adicionamos DEFAULT gen_random_uuid()
-- para que o banco gere o id sozinho quando não for informado.

ALTER TABLE clientes ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE condutores_autorizados ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE enderecos ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE pedidos ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE pedidos ALTER COLUMN numero SET DEFAULT gen_random_uuid()::text;
ALTER TABLE pedido_itens ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE pagamentos ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE tarefas ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE mensagens ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE arquivos_cliente ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE documento_templates ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE lembretes ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE servicos ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
