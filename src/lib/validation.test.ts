import { describe, expect, it } from 'vitest'
import { validateOrderForm } from './validation'

const valid = {
  customerName: 'Jan Novák',
  customerEmail: 'jan@example.com',
  customerPhone: '+420777123456',
  items: [{ productId: '1', quantity: '2' }],
}

describe('validateOrderForm', () => {
  it('accepts a valid multi-item order', () => {
    expect(validateOrderForm(valid)).toEqual({})
  })

  it('requires customer fields', () => {
    const errors = validateOrderForm({
      ...valid,
      customerName: '',
      customerEmail: 'bad',
      customerPhone: '123',
    })

    expect(errors.customerName).toBe('Jméno je povinné.')
    expect(errors.customerEmail).toBe('E-mail není platný.')
    expect(errors.customerPhone).toBe('Telefon není platný.')
  })

  it('requires at least one product', () => {
    const errors = validateOrderForm({
      ...valid,
      items: [],
    })

    expect(errors.items).toBe('Přidejte alespoň jeden produkt.')
  })

  it('validates quantity per line', () => {
    const errors = validateOrderForm({
      ...valid,
      items: [
        { productId: '1', quantity: '0' },
        { productId: '2', quantity: '1' },
      ],
    })

    expect(errors.itemErrors?.[0]?.quantity).toBe('Počet kusů musí být alespoň 1.')
    expect(errors.itemErrors?.[1]).toEqual({})
  })
})
