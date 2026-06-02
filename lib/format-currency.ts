// Path: lib/format-currency.ts

export function formatIndianCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = formatIndianNumber(Math.round(abs));
  return amount < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

export function formatIndianNumber(n: number): string {
  const numStr = String(Math.round(n));
  const lastThree = numStr.slice(-3);
  const rest = numStr.slice(0, -3);
  if (!rest) return lastThree;
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
}
