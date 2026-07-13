-- CPF e e-mail identificam uma pessoa/contato de forma única. Índices únicos
-- parciais (ignoram NULL, então continuam opcionais no cadastro).

create unique index if not exists clientes_cpf_key on clientes (cpf) where cpf is not null;
create unique index if not exists clientes_email_key on clientes (email) where email is not null;
