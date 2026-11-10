import { describe, expect, it } from 'vitest'
import { ApiError } from '../types/api'
import { getErrorMessage } from './errors'

describe('getErrorMessage', () => {
  it('maps network failure', () => {
    expect(getErrorMessage(new ApiError(0, 'down'), 'fallback')).toBe(
      'Nelze se spojit s API. Zkontrolujte, že běží backend.',
    )
  })

  it('maps not found', () => {
    expect(getErrorMessage(new ApiError(404, 'missing'), 'fallback')).toBe(
      'Požadovaný záznam nebyl nalezen.',
    )
  })

  it('maps server errors', () => {
    expect(getErrorMessage(new ApiError(500, 'boom'), 'fallback')).toBe(
      'Server momentálně neodpovídá. Zkuste to prosím znovu.',
    )
  })

  it('uses fallback for unknown values', () => {
    expect(getErrorMessage(null, 'fallback')).toBe('fallback')
  })
})
