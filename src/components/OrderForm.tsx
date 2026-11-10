import { useMemo, useState, type FormEvent } from 'react'
import { formatCzk } from '../lib/money'
import { calculateOrderTotals } from '../lib/pricing'
import {
  validateOrderForm,
  type OrderFormErrors,
  type OrderFormValues,
} from '../lib/validation'
import type { Product } from '../types/api'

type Props = {
  products: Product[]
}

export function OrderForm({ products }: Props) {
  const [values, setValues] = useState<OrderFormValues>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [],
  })
  const [productToAdd, setProductToAdd] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [errors, setErrors] = useState<OrderFormErrors>({})
  const [touchedSubmit, setTouchedSubmit] = useState(false)

  const availableProducts = useMemo(() => {
    const used = new Set(values.items.map((item) => item.productId))
    return products.filter((product) => !used.has(String(product.id)))
  }, [products, values.items])

  const pricedLines = useMemo(() => {
    return values.items.flatMap((item) => {
      const product = products.find((entry) => String(entry.id) === item.productId)
      const quantity = Number(item.quantity)
      if (!product || !Number.isInteger(quantity) || quantity < 1) {
        return []
      }
      return [{ product, quantity }]
    })
  }, [products, values.items])

  const totals = calculateOrderTotals(pricedLines)

  function revalidate(next: OrderFormValues) {
    if (touchedSubmit) {
      setErrors(validateOrderForm(next))
    }
  }

  function updateCustomer<K extends 'customerName' | 'customerEmail' | 'customerPhone'>(
    key: K,
    value: string,
  ) {
    const next = { ...values, [key]: value }
    setValues(next)
    revalidate(next)
  }

  function updateQuantity(index: number, quantity: string) {
    const items = values.items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, quantity } : item,
    )
    const next = { ...values, items }
    setValues(next)
    revalidate(next)
  }

  function addProduct() {
    if (productToAdd === '') {
      setAddError('Vyberte produkt.')
      return
    }

    if (values.items.some((item) => item.productId === productToAdd)) {
      setAddError('Produkt je už v objednávce.')
      return
    }

    const next = {
      ...values,
      items: [...values.items, { productId: productToAdd, quantity: '1' }],
    }
    setValues(next)
    setProductToAdd('')
    setAddError(null)
    revalidate(next)
  }

  function removeLine(index: number) {
    const next = {
      ...values,
      items: values.items.filter((_, itemIndex) => itemIndex !== index),
    }
    setValues(next)
    revalidate(next)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouchedSubmit(true)
    setErrors(validateOrderForm(values))
  }

  return (
    <form className="order-form" onSubmit={handleSubmit} noValidate>
      <div className="order-form__group">
        <h2>Osobní údaje</h2>

        <label className="field">
          <span>Jméno a příjmení</span>
          <input
            type="text"
            name="customerName"
            autoComplete="name"
            value={values.customerName}
            onChange={(event) => updateCustomer('customerName', event.target.value)}
            aria-invalid={Boolean(errors.customerName)}
          />
          {errors.customerName && <em className="field__error">{errors.customerName}</em>}
        </label>

        <div className="order-form__row">
          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              name="customerEmail"
              autoComplete="email"
              value={values.customerEmail}
              onChange={(event) => updateCustomer('customerEmail', event.target.value)}
              aria-invalid={Boolean(errors.customerEmail)}
            />
            {errors.customerEmail && <em className="field__error">{errors.customerEmail}</em>}
          </label>

          <label className="field">
            <span>Telefon</span>
            <input
              type="tel"
              name="customerPhone"
              autoComplete="tel"
              placeholder="+420 777 123 456"
              value={values.customerPhone}
              onChange={(event) => updateCustomer('customerPhone', event.target.value)}
              aria-invalid={Boolean(errors.customerPhone)}
            />
            {errors.customerPhone && <em className="field__error">{errors.customerPhone}</em>}
          </label>
        </div>
      </div>

      <div className="order-form__group">
        <h2>Produkty</h2>

        <div className="add-product">
          <label className="field">
            <span>Přidat produkt</span>
            <div className="add-product__controls">
              <select
                value={productToAdd}
                onChange={(event) => {
                  setProductToAdd(event.target.value)
                  setAddError(null)
                }}
                disabled={availableProducts.length === 0}
                aria-invalid={Boolean(addError)}
              >
                <option value="">
                  {availableProducts.length === 0 ? 'Všechny produkty jsou přidané' : 'Vyberte produkt'}
                </option>
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — {formatCzk(product.priceCzk)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="add-product__button"
                onClick={addProduct}
                disabled={availableProducts.length === 0}
              >
                Přidat
              </button>
            </div>
          </label>
          {addError && <em className="field__error">{addError}</em>}
        </div>

        {errors.items && <em className="field__error">{errors.items}</em>}

        {values.items.length > 0 && (
          <div className="order-lines">
            <div className="order-lines__head" aria-hidden="true">
              <span>Produkt</span>
              <span>Počet</span>
              <span />
            </div>

            {values.items.map((item, index) => {
              const product = products.find((entry) => String(entry.id) === item.productId)
              const itemError = errors.itemErrors?.[index]

              return (
                <div key={item.productId} className="order-line">
                  <div className="order-line__product">
                    <strong>{product?.name ?? `Produkt #${item.productId}`}</strong>
                    <span>
                      {product ? formatCzk(product.priceCzk) : '—'}
                      {product?.description ? ` · ${product.description}` : ''}
                    </span>
                  </div>

                  <label className="field field--qty">
                    <span className="visually-hidden">Počet</span>
                    <input
                      type="number"
                      name={`quantity-${item.productId}`}
                      min={1}
                      step={1}
                      value={item.quantity}
                      onChange={(event) => updateQuantity(index, event.target.value)}
                      aria-invalid={Boolean(itemError?.quantity)}
                    />
                    {itemError?.quantity && <em className="field__error">{itemError.quantity}</em>}
                  </label>

                  <button
                    type="button"
                    className="order-line__remove"
                    onClick={() => removeLine(index)}
                    aria-label={`Odebrat ${product?.name ?? 'produkt'}`}
                  >
                    Odebrat
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="summary" aria-live="polite">
        <h2>Shrnutí</h2>
        {totals ? (
          <>
            {totals.lines.map((line) => (
              <div key={line.product.id} className="summary__line">
                <span>
                  {line.product.name} × {line.quantity}
                </span>
                <span>{formatCzk(line.withoutVat)}</span>
              </div>
            ))}
            <div className="summary__line">
              <span>DPH</span>
              <span>{formatCzk(totals.vat)}</span>
            </div>
            <div className="summary__line summary__line--total">
              <span>Celkem s DPH</span>
              <strong>{formatCzk(totals.withVat)}</strong>
            </div>
          </>
        ) : (
          <p className="summary__empty">Přidejte alespoň jeden produkt.</p>
        )}
      </div>

      <button type="submit" className="order-form__submit">
        Ověřit formulář
      </button>
    </form>
  )
}
