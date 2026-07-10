export function periodoParaData(periodo: string): { inicio: Date; fim: Date } | null {
  const fim = new Date();
  const inicio = new Date();

  switch (periodo) {
    case "hoje":
      inicio.setHours(0, 0, 0, 0);
      return { inicio, fim };
    case "ontem": {
      inicio.setDate(inicio.getDate() - 1);
      inicio.setHours(0, 0, 0, 0);
      const fimOntem = new Date(inicio);
      fimOntem.setHours(23, 59, 59, 999);
      return { inicio, fim: fimOntem };
    }
    case "3":
      inicio.setDate(inicio.getDate() - 3);
      return { inicio, fim };
    case "7":
      inicio.setDate(inicio.getDate() - 7);
      return { inicio, fim };
    case "30":
      inicio.setDate(inicio.getDate() - 30);
      return { inicio, fim };
    default:
      return null;
  }
}
