import { useEffect, useState } from 'react'
import { getProducts } from './api/client'
import { OrderForm } from './components/OrderForm'
import { ApiError } from './types/api'
import type { Product } from './types/api'
import './App.css'

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Nepodařilo se načíst produkty.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="page">
      <header className="page__header">
        <h1>Nová objednávka</h1>
        <p className="page__lead">Vyplňte údaje a zvolte produkt. Cena s DPH se přepočítá ihned.</p>
      </header>

      {loading && <p className="status">Načítám produkty…</p>}
      {error && <p className="status status--error">{error}</p>}

      {!loading && !error && <OrderForm products={products} />}
    </main>
  )
}

export default App
