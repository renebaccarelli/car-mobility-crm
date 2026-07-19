-- Login por usuário (além de e-mail) para contas de Concessionária: o admin
-- escolhe, ao criar o login, se ele entra com e-mail real ou com um nome de
-- usuário simples. Quando é usuário, um e-mail sintético interno
-- (usuario@concessionaria.local) é usado só para satisfazer o Supabase Auth;
-- a resolução usuário -> e-mail acontece no server, via service role, antes
-- do signInWithPassword (mesmo padrão já usado no lookup de CPF do portal).

ALTER TABLE usuarios ADD COLUMN "username" text UNIQUE;
