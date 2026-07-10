-- Habilita Row Level Security (sem políticas) em todas as tabelas.
-- Bloqueia o acesso via API REST pública do Supabase (anon/authenticated),
-- já que a aplicação acessa o banco exclusivamente via Prisma (conexão direta,
-- que não passa pelo RLS por ser o owner das tabelas).
ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_metodos_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condutores_autorizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arquivos_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documento_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;
