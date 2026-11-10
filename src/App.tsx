import { useEffect, useState } from 'react'
import { getProducts, API_URL } from './api/client'
import { ApiError } from './types/api'
import type { Product } from './types/api'
import './App.css'

function formatCzk(value: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
  }).format(value)
}

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
        <p className="page__eyebrow">fe_mini_eshop</p>
        <h1>API klient</h1>
        <p className="page__lead">
          Načtení katalogu z <code>{API_URL}/api/products</code>
        </p>
      </header>

      {loading && <p className="status">Načítám produkty…</p>}
      {error && <p className="status status--error">{error}</p>}

      {!loading && !error && (
        <ul className="product-list">
          {products.map((product) => (
            <li key={product.id} className="product">
              <div>
                <h2>{product.name}</h2>
                <p>{product.description ?? 'Bez popisu'}</p>
              </div>
              <div className="product__meta">
                <strong>{formatCzk(product.priceCzk)}</strong>
                <span>DPH {product.vatRate} %</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
