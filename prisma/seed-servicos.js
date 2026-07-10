const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SERVICOS = [
  { nome: "CNH CASSADA - AUTO ESCOLA", categoria: "CNH", valorPadrao: 1490 },
  { nome: "CNH ESPECIAL CATEGORIA B", categoria: "CNH", valorPadrao: 1490 },
  { nome: "DEFIS", categoria: "CNH", valorPadrao: 100 },
  { nome: "IDOSO", categoria: "CNH", valorPadrao: 50 },
  { nome: "LICENCIAMENTO", categoria: "CNH", valorPadrao: 50 },
  { nome: "RENOVAÇÃO CNH", categoria: "CNH", valorPadrao: 472 },
  { nome: "Laudo", categoria: "LAUDOS", valorPadrao: 550 },
  { nome: "RELATÓRIO MÉDICO", categoria: "LAUDOS", valorPadrao: 150 },
  { nome: "IPI", categoria: "ISENCOES", valorPadrao: 290 },
  { nome: "ICMS", categoria: "ISENCOES", valorPadrao: 290 },
  { nome: "IPVA", categoria: "ISENCOES", valorPadrao: 390 },
  { nome: "RODÍZIO", categoria: "ISENCOES", valorPadrao: 200 },
  { nome: "PACOTE ISENÇÕES", categoria: "ISENCOES", valorPadrao: 690 },
  { nome: "EMISSÃO CRLV", categoria: "RECOMENDADOS", valorPadrao: 50 },
  { nome: "INDICAÇÃO CONDUTOR", categoria: "RECOMENDADOS", valorPadrao: 150 },
];

async function main() {
  for (const servico of SERVICOS) {
    await prisma.servico.upsert({
      where: { nome: servico.nome },
      update: {},
      create: servico,
    });
  }
  console.log(`Seed concluído: ${SERVICOS.length} serviços.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
