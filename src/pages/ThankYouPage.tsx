import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrder } from '../api/client'
import { ErrorState, LoadingState } from '../components/AsyncState'
import { getErrorMessage } from '../lib/errors'
import { formatCzk, formatMoney } from '../lib/money'
import type { Order } from '../types/api'

export function ThankYouPage() {
  const { orderId } = useParams()
  const id = Number(orderId)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const retry = useCallback(() => {
    setReloadKey((value) => value + 1)
  }, [])

  useEffect(() => {
    if (!Number.isInteger(id) || id < 1) {
      setOrder(null)
      setError('Neplatné číslo objednávky.')
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    getOrder(id, controller.signal)
      .then((data) => {
        setOrder(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        setOrder(null)
        setError(getErrorMessage(err, 'Objednávku se nepodařilo načíst.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [id, reloadKey])

  return (
    <main className="page">
      <header className="page__header">
        <h1>Děkujeme za objednávku</h1>
        <p className="page__lead">
          {order ? `Objednávka #${order.id} byla úspěšně vytvořena.` : 'Rekapitulace vaší objednávky.'}
        </p>
      </header>

      {loading && <LoadingState label="Načítám objednávku…" />}

      {!loading && error && (
        <ErrorState message={error} onRetry={Number.isInteger(id) && id >= 1 ? retry : undefined}>
          <Link className="text-link" to="/">
            Zpět na formulář
          </Link>
        </ErrorState>
      )}

      {order && (
        <div className="stack">
          <section className="detail-block">
            <h2>Zákazník</h2>
            <dl className="detail-list">
              <div>
                <dt>Jméno</dt>
                <dd>{order.customerName}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{order.customerEmail}</dd>
              </div>
              <div>
                <dt>Telefon</dt>
                <dd>{order.customerPhone}</dd>
              </div>
            </dl>
          </section>

          <section className="detail-block">
            <h2>Položky</h2>
            <div className="summary">
              {order.items.map((item) => (
                <div key={item.id} className="summary__line">
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>{formatCzk(item.lineWithoutVat)}</span>
                </div>
              ))}
              <div className="summary__line">
                <span>Bez DPH</span>
                <span>{formatCzk(order.totalWithoutVat)}</span>
              </div>
              <div className="summary__line">
                <span>DPH</span>
                <span>{formatCzk(order.totalVat)}</span>
              </div>
              <div className="summary__line summary__line--total">
                <span>Celkem s DPH</span>
                <strong>{formatCzk(order.totalWithVat)}</strong>
              </div>
            </div>
          </section>

          <section className="detail-block">
            <h2>Přepočet podle ČNB</h2>
            <dl className="detail-list">
              <div>
                <dt>Kurz</dt>
                <dd>
                  1 {order.currency} = {order.exchangeRate.toFixed(3)} CZK
                </dd>
              </div>
              <div>
                <dt>Datum kurzu</dt>
                <dd>{order.exchangeRateDate}</dd>
              </div>
              <div>
                <dt>Celkem v {order.currency}</dt>
                <dd>
                  <strong>{formatMoney(order.totalForeign, order.currency)}</strong>
                </dd>
              </div>
            </dl>
          </section>

          <Link className="text-link" to="/">
            Vytvořit další objednávku
          </Link>
        </div>
      )}
    </main>
  )
}
