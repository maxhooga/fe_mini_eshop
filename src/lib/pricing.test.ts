import { describe, expect, it } from 'vitest'
import type { Product } from '../types/api'
import { calculateLineTotals, calculateOrderTotals } from './pricing'

const starter: Product = {
  id: 1,
  name: 'FAPI Starter',
  description: 'Základní licence',
  priceCzk: 990,
  vatRate: 21,
  isActive: true,
  createdAt: '2026-11-10 12:00:00',
}

const pro: Product = {
  id: 2,
  name: 'FAPI Pro',
  description: 'Pokročilá licence',
  priceCzk: 1990,
  vatRate: 21,
  isActive: true,
  createdAt: '2026-11-10 12:00:00',
}

describe('calculateLineTotals', () => {
  it('matches backend VAT rounding for one item', () => {
    expect(calculateLineTotals(starter, 1)).toEqual({
      withoutVat: 990,
      vat: 207.9,
      withVat: 1197.9,
    })
  })

  it('recalculates when quantity changes', () => {
    expect(calculateLineTotals(pro, 2)).toEqual({
      withoutVat: 3980,
      vat: 835.8,
      withVat: 4815.8,
    })
  })

  it('returns zeros for invalid quantity', () => {
    expect(calculateLineTotals(starter, 0)).toEqual({
      withoutVat: 0,
      vat: 0,
      withVat: 0,
    })
  })
})

describe('calculateOrderTotals', () => {
  it('sums multiple products like the backend', () => {
    const totals = calculateOrderTotals([
      { product: starter, quantity: 1 },
      { product: pro, quantity: 1 },
    ])

    expect(totals).toEqual({
      lines: [
        {
          product: starter,
          quantity: 1,
          withoutVat: 990,
          vat: 207.9,
          withVat: 1197.9,
        },
        {
          product: pro,
          quantity: 1,
          withoutVat: 1990,
          vat: 417.9,
          withVat: 2407.9,
        },
      ],
      withoutVat: 2980,
      vat: 625.8,
      withVat: 3605.8,
    })
  })

  it('returns null when there are no valid lines', () => {
    expect(calculateOrderTotals([])).toBeNull()
    expect(calculateOrderTotals([{ product: starter, quantity: 0 }])).toBeNull()
  })
})
