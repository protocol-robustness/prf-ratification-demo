export const diagnosticStorageKey = 'prf-ratification-demo:browser-events:v1'
export const diagnosticLimit = 250

export type BrowserDiagnosticEvent = {
  schema_version: 'prf-browser-diagnostic.v1'
  event_id: string
  event_type: 'page_viewed' | 'response_selected' | 'preview_opened' | 'preview_cancelled' | 'diagnostics_exported'
  source_component: 'ratification-demo-browser'
  source_revision: string
  occurred_at: string
  occurred_at_trust: 'browser-clock-unverified'
  observed_at: null
  observed_at_status: 'unavailable-no-server'
  interaction_id: string
  outcome: 'observed' | 'cancelled'
  event_detail?: string
  reason_code?: string
  trust_level: 'browser-reported-untrusted'
}

export function readDiagnosticEvents(): BrowserDiagnosticEvent[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(diagnosticStorageKey) ?? '[]')
    return Array.isArray(parsed) ? parsed as BrowserDiagnosticEvent[] : []
  } catch {
    return []
  }
}

export function recordDiagnosticEvent(
  event: Omit<BrowserDiagnosticEvent, 'schema_version' | 'event_id' | 'source_component' | 'source_revision' | 'occurred_at' | 'occurred_at_trust' | 'observed_at' | 'observed_at_status' | 'trust_level'>,
): BrowserDiagnosticEvent[] {
  const observedAt = new Date().toISOString()
  const next: BrowserDiagnosticEvent = {
    schema_version: 'prf-browser-diagnostic.v1',
    event_id: crypto.randomUUID(),
    source_component: 'ratification-demo-browser',
    source_revision: process.env.NEXT_PUBLIC_SOURCE_REVISION || 'unavailable',
    occurred_at: observedAt,
    occurred_at_trust: 'browser-clock-unverified',
    observed_at: null,
    observed_at_status: 'unavailable-no-server',
    trust_level: 'browser-reported-untrusted',
    ...event,
  }
  const events = [...readDiagnosticEvents(), next].slice(-diagnosticLimit)
  try {
    localStorage.setItem(diagnosticStorageKey, JSON.stringify(events))
  } catch {
    // Browser diagnostics are optional; storage failure must not affect the demo.
  }
  return events
}
