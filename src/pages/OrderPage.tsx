import { useCallback, useEffect, useState } from 'react'
import { getProducts } from '../api/client'
import { ErrorState, LoadingState } from '../components/AsyncState'
import { OrderForm } from '../components/OrderForm'
import { getErrorMessage } from '../lib/errors'
import type { Product } from '../types/api'

export function OrderPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    getProducts(controller.signal)
      .then((data) => {
        setProducts(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        setProducts([])
        setError(getErrorMessage(err, 'Nepodařilo se načíst produkty.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [reloadKey])

  return (
    <main className="page">
      <header className="page__header">
        <h1>Nová objednávka</h1>
        <p className="page__lead">Vyplňte údaje a zvolte produkt. Cena s DPH se přepočítá ihned.</p>
      </header>

      {loading && <LoadingState label="Načítám produkty…" />}

      {!loading && error && (
        <ErrorState message={error} onRetry={retry} />
      )}

      {!loading && !error && products.length === 0 && (
        <ErrorState
          message="Katalog je prázdný. Nejdřív spusťte seed na backendu."
          onRetry={retry}
        />
      )}

      {!loading && !error && products.length > 0 && <OrderForm products={products} />}
    </main>
  )
}
