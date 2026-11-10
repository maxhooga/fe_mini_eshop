import type {
  ApiErrorBody,
  ApiSuccess,
  CreateOrderPayload,
  Order,
  Product,
} from '../types/api'
import { ApiError } from '../types/api'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')
  ?? 'http://localhost:8000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  const text = await response.text()
  let body: unknown = null
  if (text !== '') {
    try {
      body = JSON.parse(text)
    } catch {
      throw new ApiError(response.status, 'Server returned invalid JSON.')
    }
  }

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null
    throw new ApiError(
      response.status,
      errorBody?.error?.message ?? `Request failed with status ${response.status}.`,
      errorBody?.error?.errors ?? {},
    )
  }

  return (body as ApiSuccess<T>).data
}

export function getProducts(): Promise<Product[]> {
  return request<Product[]>('/api/products')
}

export function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return request<Order>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getOrder(id: number): Promise<Order> {
  return request<Order>(`/api/orders/${id}`)
}

export { API_URL }
