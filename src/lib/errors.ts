import { ApiError } from '../types/api'

export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 0) {
      return 'Nelze se spojit s API. Zkontrolujte, že běží backend.'
    }
    if (err.status === 404) {
      return 'Požadovaný záznam nebyl nalezen.'
    }
    if (err.status === 422) {
      return err.message || 'Formulář obsahuje chyby.'
    }
    if (err.status >= 500) {
      return 'Server momentálně neodpovídá. Zkuste to prosím znovu.'
    }
    return err.message || fallback
  }

  if (err instanceof TypeError) {
    return 'Nelze se spojit s API. Zkontrolujte, že běží backend.'
  }

  if (err instanceof Error && err.message) {
    return err.message
  }

  return fallback
}
