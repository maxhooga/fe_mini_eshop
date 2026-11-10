export type OrderLineValues = {
  productId: string
  quantity: string
}

export type OrderFormValues = {
  customerName: string
  customerEmail: string
  customerPhone: string
  items: OrderLineValues[]
}

export type OrderFormErrors = {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  items?: string
  itemErrors?: Array<{ quantity?: string }>
}

const phonePattern = /^\+?[0-9\s\-/]{9,20}$/

export function validateOrderForm(values: OrderFormValues): OrderFormErrors {
  const errors: OrderFormErrors = {}
  const name = values.customerName.trim()
  const email = values.customerEmail.trim()
  const phone = values.customerPhone.trim()

  if (name === '') {
    errors.customerName = 'Jméno je povinné.'
  } else if (name.length < 2) {
    errors.customerName = 'Jméno musí mít alespoň 2 znaky.'
  }

  if (email === '') {
    errors.customerEmail = 'E-mail je povinný.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.customerEmail = 'E-mail není platný.'
  }

  if (phone === '') {
    errors.customerPhone = 'Telefon je povinný.'
  } else if (!phonePattern.test(phone)) {
    errors.customerPhone = 'Telefon není platný.'
  }

  if (values.items.length === 0) {
    errors.items = 'Přidejte alespoň jeden produkt.'
    return errors
  }

  const itemErrors = values.items.map(() => ({} as { quantity?: string }))
  let hasItemError = false

  values.items.forEach((item, index) => {
    const quantity = Number(item.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) {
      itemErrors[index].quantity = 'Počet kusů musí být alespoň 1.'
      hasItemError = true
    }
  })

  if (hasItemError) {
    errors.itemErrors = itemErrors
  }

  return errors
}
