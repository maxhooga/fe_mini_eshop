import type { Product } from '../types/api'

export type LineTotals = {
  withoutVat: number
  vat: number
  withVat: number
}

export type OrderTotals = LineTotals & {
  lines: Array<LineTotals & { product: Product; quantity: number }>
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** Same rounding as backend PriceCalculator. */
export function calculateLineTotals(product: Product, quantity: number): LineTotals {
  const qty = Number.isFinite(quantity) ? Math.max(0, Math.trunc(quantity)) : 0
  const withoutVat = round2(product.priceCzk * qty)
  const vat = round2(withoutVat * (product.vatRate / 100))
  const withVat = round2(withoutVat + vat)

  return { withoutVat, vat, withVat }
}

export function calculateOrderTotals(
  lines: Array<{ product: Product; quantity: number }>,
): OrderTotals | null {
  const priced = lines
    .filter((line) => Number.isInteger(line.quantity) && line.quantity >= 1)
    .map((line) => ({
      product: line.product,
      quantity: line.quantity,
      ...calculateLineTotals(line.product, line.quantity),
    }))

  if (priced.length === 0) {
    return null
  }

  const withoutVat = round2(priced.reduce((sum, line) => sum + line.withoutVat, 0))
  const vat = round2(priced.reduce((sum, line) => sum + line.vat, 0))

  return {
    lines: priced,
    withoutVat,
    vat,
    withVat: round2(withoutVat + vat),
  }
}
