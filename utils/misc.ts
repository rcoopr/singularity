export const html = String.raw;

export function toNumOr<F = undefined>(val: unknown, fallback?: F): number | F {
  const asNum = Number(val);
  return isNaN(asNum) ? (fallback as F) : asNum;
}
