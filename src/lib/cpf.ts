export function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const p1 = digits.slice(0, 3);
  const p2 = digits.slice(3, 6);
  const p3 = digits.slice(6, 9);
  const p4 = digits.slice(9, 11);

  let result = p1;
  if (p2) result += `.${p2}`;
  if (p3) result += `.${p3}`;
  if (p4) result += `-${p4}`;
  return result;
}

export function isValidCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcDigit = (base: string) => {
    let total = 0;
    for (let i = 0; i < base.length; i++) {
      total += Number(base[i]) * (base.length + 1 - i);
    }
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const d1 = calcDigit(digits.slice(0, 9));
  const d2 = calcDigit(digits.slice(0, 9) + d1);

  return digits === digits.slice(0, 9) + String(d1) + String(d2);
}
