import type {
  ApiErrorBody,
  ApiSuccess,
  CreateOrderPayload,
  Order,
  Product,
} from '../types/api'
import { ApiError } from '../types/api'

const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined)
  ?? (import.meta.env.PROD ? 'https://fapi-orders.onrender.com' : 'http://localhost:8000')
).replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err
    }
    throw new ApiError(0, 'Nelze se spojit s API.')
  }

  const text = await response.text()
  let body: unknown = null
  if (text !== '') {
    try {
      body = JSON.parse(text)
    } catch {
      throw new ApiError(response.status, 'Server vrátil neplatnou odpověď.')
    }
  }

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null
    throw new ApiError(
      response.status,
      errorBody?.error?.message ?? `Požadavek selhal (${response.status}).`,
      errorBody?.error?.errors ?? {},
    )
  }

  return (body as ApiSuccess<T>).data
}

export function getProducts(signal?: AbortSignal): Promise<Product[]> {
  return request<Product[]>('/api/products', { signal })
}

export function createOrder(payload: CreateOrderPayload, signal?: AbortSignal): Promise<Order> {
  return request<Order>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal,
  })
}

export function getOrder(id: number, signal?: AbortSignal): Promise<Order> {
  return request<Order>(`/api/orders/${id}`, { signal })
}

export { API_URL }
