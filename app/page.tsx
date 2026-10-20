'use client'

import { useEffect, useRef, useState } from 'react'
import fixture from '../examples/ratified-with-dissent.json'
import { diagnosticStorageKey, readDiagnosticEvents, recordDiagnosticEvent, type BrowserDiagnosticEvent } from './forensics'
import styles from './page.module.css'

type ContributionKind = 'approve' | 'dissent' | 'challenge'

const short = (root: string) => `${root.slice(0, 17)}…${root.slice(-8)}`
const names: Record<string, string> = { alex: 'Alex Morgan', blair: 'Blair Chen', casey: 'Casey Okafor' }

export default function Home() {
  const [preview, setPreview] = useState<ContributionKind | null>(null)
  const [diagnosticEvents, setDiagnosticEvents] = useState<BrowserDiagnosticEvent[]>([])
  const interactionId = useRef<string | null>(null)
  const pageViewRecorded = useRef(false)
  const approvals = fixture.contributions.filter((c) => c.kind === 'approve').length
  const dissent = fixture.contributions.filter((c) => c.kind === 'dissent')

  useEffect(() => {
    if (pageViewRecorded.current) return
    pageViewRecorded.current = true
    interactionId.current = crypto.randomUUID()
    setDiagnosticEvents(readDiagnosticEvents())
    setDiagnosticEvents(recordDiagnosticEvent({
      event_type: 'page_viewed',
      interaction_id: interactionId.current,
      outcome: 'observed',
    }))
  }, [])

  function selectResponse(kind: ContributionKind) {
    const id = interactionId.current ?? crypto.randomUUID()
    interactionId.current = id
    recordDiagnosticEvent({ event_type: 'response_selected', interaction_id: id, outcome: 'observed', event_detail: kind })
    setDiagnosticEvents(recordDiagnosticEvent({ event_type: 'preview_opened', interaction_id: id, outcome: 'observed', event_detail: kind }))
    setPreview(kind)
  }

  function cancelPreview() {
    if (interactionId.current) {
      setDiagnosticEvents(recordDiagnosticEvent({
        event_type: 'preview_cancelled',
        interaction_id: interactionId.current,
        outcome: 'cancelled',
        reason_code: 'visitor-dismissed-preview',
      }))
    }
    setPreview(null)
  }

  function exportDiagnostics() {
    const id = interactionId.current ?? crypto.randomUUID()
    interactionId.current = id
    const events = recordDiagnosticEvent({ event_type: 'diagnostics_exported', interaction_id: id, outcome: 'observed' })
    setDiagnosticEvents(events)
    const blob = new Blob([JSON.stringify({ schema_version: 'prf-browser-diagnostic-export.v1', trust_level: 'browser-reported-untrusted', events }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `prf-browser-diagnostics-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function clearDiagnostics() {
    try {
      localStorage.removeItem(diagnosticStorageKey)
    } catch {
      // The page remains usable when browser storage is unavailable.
    }
    setDiagnosticEvents([])
  }

  return (
    <main className={styles.page}>
      <div className={styles.topline}>
        <a className={styles.brand} href="https://protocolrobustness.com" aria-label="Protocol Robustness Framework">
          <img src="/prf-logo.png" alt="" /><span>PRF <i>/</i> Research</span>
        </a>
        <span className={styles.local}>USER-OWNED · LOCAL PREVIEW</span>
      </div>

      <section className={styles.notice} aria-label="Demonstration notice">
        <span className={styles.noticeIcon}>i</span>
        <p><strong>DEMONSTRATION ONLY</strong><br />This page displays a committed example with test identities and test-only signatures. Local page and response diagnostics stay in this browser. Hosting access logs record request IP, path, method, status, and browser user-agent in restricted AWS storage for up to 90 days; delivery is best-effort. Nothing is signed or submitted, and no operational authorization is granted.</p>
      </section>

      <header className={styles.hero}>
        <div className={styles.eyebrow}>RESEARCH RATIFICATION <span>·</span> SAMPLE WORKSPACE</div>
        <h1>A claim, considered together.</h1>
        <p className={styles.lede}>Researchers respond to one frozen basis. Agreement, dissent, and challenges stay attached to that exact version.</p>
      </header>

      <section className={styles.result} aria-labelledby="result-title">
        <div>
          <div className={styles.resultEyebrow}>PRF FIXTURE RESULT · NOT RECOMPUTED HERE</div>
          <h2 id="result-title">{fixture.ratification.status.replaceAll('-', ' ')}</h2>
          <p>{approvals} approvals meet the {fixture.policy.threshold}-of-{fixture.policy.eligiblePrincipals.length} policy threshold. {dissent.length} dissenting position is retained.</p>
          <details className={styles.forensic}><summary>Ratification record · fixture-reported</summary>
            <ForensicRow label="Schema" value={fixture.ratification.schemaVersion} />
            <ForensicRow label="Status" value={fixture.ratification.status} />
            <ForensicRow label="Verification field" value={fixture.ratification.verification} />
            <ForensicRow label="Operational authority" value={String(fixture.ratification.operationalAuthority)} />
            <ForensicRow label="Approval count" value={String(fixture.ratification.approvalCount)} />
            <ForensicRow label="Dissent count" value={String(fixture.ratification.dissentCount)} />
            <ForensicRow label="Ratification root" value={fixture.ratification.root} />
            <ForensicRow label="Target root" value={fixture.ratification.targetRoot} />
            <ForensicRow label="Policy root" value={fixture.ratification.policyRoot} />
            {fixture.ratification.challengeRoots.map((root, i) => <ForensicRow key={root} label={`Challenge root ${i + 1}`} value={root} />)}
            {fixture.ratification.contributionRoots.map((root, i) => <ForensicRow key={root} label={`Included contribution ${i + 1}`} value={root} />)}
          </details>
        </div>
        <div className={styles.resultState}><span className={styles.check}>✓</span><span>Example<br /><small>not authority</small></span></div>
      </section>

      <div className={styles.columns}>
        <section className={styles.card} aria-labelledby="basis-title">
          <div className={styles.sectionHead}><div><div className={styles.kicker}>01 / FROZEN BASIS</div><h2 id="basis-title">What is being reviewed</h2></div><span className={styles.lock}>LOCKED</span></div>
          <p className={styles.claim}><span>ILLUSTRATIVE DISPLAY TEXT · NOT IN FIXTURE</span><br />Analytical claim: the protocol’s reserve policy remains solvent under the sampled stress path.</p>
          <div className={styles.fields}>
            <Root label="Basis root" value={fixture.target.root} />
            <Root label="Subject" value={fixture.target.subjectRoot} />
            <Root label="Evidence set" value={fixture.target.evidenceRoot} />
            <Root label="Review round" value={fixture.target.roundRoot} />
            <Root label="Ratification policy" value={fixture.policy.root} />
          </div>
          <div className={styles.policy}><span className={styles.policyMark}>2 / 3</span><span><strong>Sample policy</strong><br />Two approvals required · dissent retained · challenges block</span></div>
          <details className={styles.forensic}><summary>Target and policy provenance</summary>
            <ForensicRow label="Target schema" value={fixture.target.schemaVersion} />
            <ForensicRow label="Domain" value={fixture.target.domain} />
            <ForensicRow label="Target type" value={fixture.target.targetSchema} />
            <ForensicRow label="Target root" value={fixture.target.root} />
            <ForensicRow label="Policy schema" value={fixture.policy.schemaVersion} />
            <ForensicRow label="Policy ID" value={fixture.policy.id} />
            <ForensicRow label="Authority root" value={fixture.policy.authorityRoot} />
            <ForensicRow label="Policy root" value={fixture.policy.root} />
            <ForensicRow label="Threshold" value={`${fixture.policy.threshold} of ${fixture.policy.eligiblePrincipals.length}`} />
            <ForensicRow label="Dissent allowed" value={String(fixture.policy.allowDissent)} />
            <ForensicRow label="Challenges block" value={String(fixture.policy.challengesBlock)} />
            {fixture.policy.eligiblePrincipals.map((principal, i) => <ForensicRow key={principal} label={`Eligible principal ${i + 1}`} value={principal} />)}
          </details>
        </section>

        <section className={styles.card} aria-labelledby="people-title">
          <div className={styles.sectionHead}><div><div className={styles.kicker}>02 / CONTRIBUTIONS</div><h2 id="people-title">Researcher positions</h2></div><span className={styles.count}>3 recorded</span></div>
          <div className={styles.people}>
            {fixture.contributions.map((item) => {
              const researcher = item.decision.researcherId
              const isDissent = item.kind === 'dissent'
              return <article className={styles.person} key={item.contributionRoot}>
                <div className={`${styles.avatar} ${isDissent ? styles.avatarDissent : ''}`}>{researcher.slice(0, 1).toUpperCase()}</div>
                <div className={styles.personBody}><div className={styles.personLine}><strong>{names[researcher] ?? researcher}</strong><span className={isDissent ? styles.dissentTag : styles.approveTag}>{isDissent ? 'DISSENT' : 'AGREES'}</span></div>
                  <p>{isDissent ? item.decision.dissentReason : 'Supports this resolution basis.'}</p>
                  <div className={styles.signed}><span>●</span> Fixture reports signature status: <strong>{item.signatureStatus}</strong></div>
                  <details className={styles.forensic}><summary>Contribution and signed decision fields</summary>
                    <ForensicRow label="Contribution root" value={item.contributionRoot} />
                    <ForensicRow label="Principal ID" value={item.principalId} />
                    <ForensicRow label="Researcher ID" value={item.decision.researcherId} />
                    <ForensicRow label="Contribution kind" value={item.kind} />
                    <ForensicRow label="Recorded at" value={item.recordedAt} />
                    <ForensicRow label="Decision schema" value={item.decision.schemaVersion} />
                    <ForensicRow label="Decision" value={item.decision.decision} />
                    <ForensicRow label="Signing key ID" value={item.decision.signingKeyId} />
                    <ForensicRow label="Decision hash" value={item.decision.decisionHash} />
                    <ForensicRow label="Outcome root" value={item.decision.outcomeRoot} />
                    <ForensicRow label="Request root" value={item.decision.requestRoot} />
                    <ForensicRow label="Authorisation ID" value={item.decision.authorisationId} />
                    <ForensicRow label="Review round root" value={item.decision.reviewRoundRoot} />
                    {item.decision.dissentReason && <ForensicRow label="Dissent reason" value={item.decision.dissentReason} />}
                    <ForensicRow label="Signature algorithm" value={item.decision.signature.algorithm} />
                    <ForensicRow label="Signed at" value={item.decision.signature.signedAt} />
                    <ForensicRow label="Signature bytes · test fixture" value={item.decision.signature.value} />
                  </details>
                </div>
              </article>
            })}
          </div>
          <div className={styles.integrity}><span>●</span> Binding values are visible per contribution. This page does not verify signatures or recompute canonical roots.</div>
        </section>
      </div>

      <section className={styles.actions} aria-labelledby="action-title">
        <div><div className={styles.kicker}>03 / YOUR RESPONSE</div><h2 id="action-title">Explore a researcher response</h2><p>Preview an intent against this exact basis. No keys are collected and nothing is submitted.</p></div>
        <div className={styles.buttons}>
          <button onClick={() => selectResponse('approve')}>Agree</button>
          <button className={styles.outline} onClick={() => selectResponse('dissent')}>Dissent</button>
          <button className={styles.outline} onClick={() => selectResponse('challenge')}>Challenge</button>
        </div>
      </section>

      {preview && <section className={styles.preview} aria-live="polite">
        <div><div className={styles.kicker}>LOCAL PREVIEW · NOT SUBMITTED</div><h2>{preview === 'approve' ? 'Agreement intent' : preview === 'dissent' ? 'Dissent intent' : 'Challenge intent'}</h2>
          <p>This response would be bound to the basis below. A real client would request a server-prepared intent, show the exact signed fields, then use a user-controlled signer.</p>
          <code className={styles.previewRoot}>{fixture.target.root}</code>
        </div><button className={styles.close} onClick={cancelPreview} aria-label="Close preview">×</button>
      </section>}

      <section className={styles.diagnostics} aria-labelledby="diagnostics-title">
        <div className={styles.diagnosticsHead}>
          <div><div className={styles.kicker}>LOCAL ONLY · BROWSER REPORTED</div><h2 id="diagnostics-title">Diagnostic activity</h2></div>
          <div className={styles.diagnosticButtons}>
            <button onClick={exportDiagnostics} disabled={diagnosticEvents.length === 0}>Export JSON</button>
            <button className={styles.outline} onClick={clearDiagnostics} disabled={diagnosticEvents.length === 0}>Clear local history</button>
          </div>
        </div>
        <p>Page views and response previews are stored in this browser only. They are not uploaded and do not prove who acted. The event time comes from the unverified browser clock; server observation time is unavailable. Clear them at any time; export creates a local JSON file.</p>
        <div className={styles.diagnosticMeta}><span>{diagnosticEvents.length} events saved in this browser</span><span>Trust: browser-reported, untrusted</span><span>Storage: localStorage · max 250 events</span></div>
        {diagnosticEvents.length > 0 && <details className={styles.forensic}><summary>Inspect recent diagnostic events</summary>
          {[...diagnosticEvents].reverse().slice(0, 8).map((event) => <div className={styles.diagnosticEvent} key={event.event_id}>
            <code>{event.occurred_at}</code><strong>{event.event_type.replaceAll('_', ' ')}</strong><span>{event.reason_code ?? event.event_detail ?? event.outcome}</span>
          </div>)}
        </details>}
      </section>

      <details className={styles.artifact}><summary>Inspect example artifact</summary><pre>{JSON.stringify(fixture, null, 2)}</pre></details>

      <footer className={styles.footer}><div><strong>Research agreement is not decision authority.</strong><br />This user-controlled frontend is a read-only illustration of a PRF ratification fixture. It does not resolve a dispute, establish governance authority, issue a ruling, or permit an operation.</div><span>FIXTURE ROOT<br /><code>{short(fixture.ratification.root)}</code></span></footer>
    </main>
  )
}

function Root({ label, value }: { label: string; value: string }) {
  return <div className={styles.rootRow}><span>{label}</span><code title={value}>{short(value)}</code><button onClick={() => navigator.clipboard?.writeText(value)} aria-label={`Copy ${label}`}>COPY</button></div>
}

function ForensicRow({ label, value }: { label: string; value: string }) {
  return <div className={styles.forensicRow}><span>{label}</span><code>{value}</code><button onClick={() => navigator.clipboard?.writeText(value)} aria-label={`Copy ${label}`}>COPY</button></div>
}
