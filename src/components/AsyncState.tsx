import type { ReactNode } from 'react'

type LoadingProps = {
  label: string
}

export function LoadingState({ label }: LoadingProps) {
  return (
    <p className="status status--loading" role="status" aria-live="polite">
      <span className="status__spinner" aria-hidden="true" />
      {label}
    </p>
  )
}

type ErrorProps = {
  message: string
  onRetry?: () => void
  retryLabel?: string
  children?: ReactNode
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = 'Zkusit znovu',
  children,
}: ErrorProps) {
  return (
    <div className="stack" role="alert">
      <p className="status status--error">{message}</p>
      {(onRetry || children) && (
        <div className="actions">
          {onRetry && (
            <button type="button" className="secondary-button" onClick={onRetry}>
              {retryLabel}
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  )
}
