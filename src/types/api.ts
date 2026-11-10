export type Product = {
  id: number
  name: string
  description: string | null
  priceCzk: number
  vatRate: number
  isActive: boolean
  createdAt: string
}

export type OrderItem = {
  id: number
  productId: number
  productName: string
  quantity: number
  unitPriceCzk: number
  vatRate: number
  lineWithoutVat: number
  lineVat: number
  lineWithVat: number
}

export type Order = {
  id: number
  customerName: string
  customerEmail: string
  customerPhone: string
  totalWithoutVat: number
  totalVat: number
  totalWithVat: number
  currency: string
  exchangeRate: number
  exchangeRateDate: string
  totalForeign: number
  createdAt: string
  items: OrderItem[]
}

export type CreateOrderItem = {
  productId: number
  quantity: number
}

export type CreateOrderPayload = {
  customerName: string
  customerEmail: string
  customerPhone: string
  items: CreateOrderItem[]
}

export type ApiSuccess<T> = {
  data: T
}

export type ApiErrorBody = {
  error: {
    message: string
    errors?: Record<string, string>
  }
}

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}
