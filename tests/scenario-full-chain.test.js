/**
 * Full cross-border payment trust-chain scenario, exercised through the public
 * tool surface of the embedded trust plane.
 *
 * The scenario is the one a real operator performs: identities -> credential ->
 * payment task -> delegation -> authorization -> operation event -> risk ->
 * step-up -> trace case -> report. It asserts the fail-closed rules at every
 * decision point and that the browser overview reflects the recorded chain.
 */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const PLUGIN_URL = new URL('../src/index.js', import.meta.url).href

function createHost() {
  const tools = new Map()
  const services = new Map()
  const disposers = []
  const host = {
    logger: { info() {}, warn() {}, error() {}, debug() {} },
    tools: {
      register(definition) {
        if (tools.has(definition.name)) throw new Error(`duplicate tool ${definition.name}`)
        tools.set(definition.name, definition)
        return () => tools.delete(definition.name)
      },
    },
    provide(name, value) {
      services.set(name, value)
      return () => services.delete(name)
    },
    get(name) {
      return services.get(name)
    },
    effect(fn) {
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
      return dispose
    },
  }
  return { host, tools, services, disposers }
}

function createBrowserHost(host, tools) {
  const registrations = []
  let routeHandler = null
  host.inject = (deps, callback) => {
    if (Array.isArray(deps) && deps.length === 2 && deps.includes('webServer')) {
      const scoped = {
        webServer: {
          register(route) {
            registrations.push(route)
            routeHandler = route.handler
            return () => {}
          },
        },
        connection: { requestRejection: () => undefined },
        effect: (fn) => {
          const dispose = fn()
          return typeof dispose === 'function' ? dispose : () => {}
        },
        get: (name) => host.get(name),
      }
      callback(scoped)
    }
  }
  return {
    registrations,
    request(pathname) {
      return new Promise((resolve, reject) => {
        const req = { method: 'GET', url: pathname, headers: { host: '127.0.0.1:3097' } }
        const res = {
          statusCode: 200,
          headers: {},
          headersSent: false,
          setHeader(name, value) {
            this.headers[name.toLowerCase()] = value
          },
          writeHead(status, headers = {}) {
            res.statusCode = status
            for (const [name, value] of Object.entries(headers)) res.headers[name.toLowerCase()] = value
            res.headersSent = true
          },
          end(body) {
            resolve({ status: res.statusCode, headers: res.headers, body: body === undefined ? '' : String(body) })
          },
          destroy() {},
        }
        Promise.resolve(routeHandler(req, res)).catch(reject)
      })
    },
  }
}

let callSequence = 0

async function call(tools, name, rawArgs = {}) {
  const tool = tools.get(name)
  assert.ok(tool, `tool ${name} is not registered`)
  const args = JSON.parse(JSON.stringify(rawArgs))
  return tool.execute(args, { callId: `scenario-${++callSequence}`, signal: new AbortController().signal })
}

function requireOk(value, label) {
  assert.equal(value?.ok, true, `${label}: ${JSON.stringify(value).slice(0, 400)}`)
  return value
}

const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex')
const iso = (offsetMs) => new Date(Date.now() + offsetMs).toISOString()

test('cross-border payment trust chain runs end to end and fails closed', async () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'trust-scenario-'))
  const { host, tools } = createHost()
  const browser = createBrowserHost(host, tools)

  try {
    const { apply } = await import(PLUGIN_URL)
    apply(host, {
      mode: 'embedded',
      dataDir,
      actorDid: 'system:scenario-runner',
      allowInterventionExecution: false,
    })

    assert.equal(tools.size, 60, 'default tool surface is 60 tools')
    assert.equal(tools.has('execute_intervention'), false, 'intervention execution stays gated by default')
    assert.ok(host.get('trustPlane'), 'embedded mode provides trustPlane service')
    assert.equal(browser.registrations.length, 1, 'browser API route is registered once')

    const domain = `scenario-${Date.now()}.example`
    const payer = requireOk(
      await call(tools, 'register_identity', { domain_id: domain, subject_id: 'payer', display_name: 'Payer Agent' }),
      'register payer',
    )
    const operator = requireOk(
      await call(tools, 'register_identity', { domain_id: domain, subject_id: 'operator', display_name: 'Operator Agent' }),
      'register operator',
    )
    const payerDid = payer.identity?.did
    const operatorDid = operator.identity?.did
    assert.match(payerDid, /^did:trust:/)
    assert.match(operatorDid, /^did:trust:/)
    assert.equal(requireOk(await call(tools, 'get_identity_status', { did: payerDid }), 'payer status').identity?.status, 'ACTIVE')

    // Credential: issuer authority + deterministic verification.
    const credential = requireOk(
      await call(tools, 'issue_credential', {
        credential_type: 'AgentRegistrationCredential',
        issuer_did: payerDid,
        subject_did: operatorDid,
        claims: { capabilities: ['PAYREQ', 'RESULT'], jurisdiction: 'CN' },
        valid_from: iso(-60_000),
        valid_to: iso(86_400_000),
      }),
      'issue credential',
    )
    const credentialId = credential.credential?.id
    assert.ok(credentialId, 'credential id')

    const readCredential = requireOk(await call(tools, 'read_credential', { credential_id: credentialId }), 'read credential')
    const verified = requireOk(
      await call(tools, 'verify_credential', {
        credential: readCredential.credential?.document ?? readCredential.credential?.credential,
        required_claims: ['capabilities'],
      }),
      'verify credential',
    )
    assert.equal(verified.verification?.status, 'VALID')

    const admission = requireOk(
      await call(tools, 'resolve_identity_admission', { did: operatorDid, required_actions: ['PAYREQ'] }),
      'admission',
    )
    assert.equal(admission.admission?.status, 'ALLOW', 'operator is admissible for PAYREQ')

    // Draft task, delegation and deterministic authorization.
    const draft = requireOk(
      await call(tools, 'create_payment_task', {
        requester_did: payerDid,
        amount: 800,
        asset_id: 'USD',
        beneficiary: 'merchant-demo-1',
        purpose: 'full-chain scenario draft',
      }),
      'draft task',
    )
    const draftTaskId = draft.task?.id
    assert.equal(draft.task?.status, 'CREATED')
    assert.equal(Number(draft.task?.amount), 800)

    const delegation = requireOk(
      await call(tools, 'create_delegation', {
        task_id: draftTaskId,
        issuer_did: payerDid,
        subject_did: operatorDid,
        actions: ['PAYREQ'],
        asset_id: 'USD',
        amount_limit: 600,
        daily_limit: 700,
        valid_from: iso(-60_000),
        valid_to: iso(86_400_000),
        can_redelegate: false,
        claims: { purpose: 'full-chain scenario' },
      }),
      'create delegation',
    )
    const delegationId = delegation.delegation?.id
    assert.equal(delegation.delegation?.status, 'ACTIVE')

    const denied = requireOk(
      await call(tools, 'check_authorization', { delegation_id: delegationId, did: operatorDid, amount: 900, currency: 'USD' }),
      'over-limit authorization',
    )
    assert.equal(denied.decision, 'DENY', 'amount above delegation limit never authorizes')
    const deniedTask = await call(tools, 'create_payment_task', {
      authorization_id: denied.authorization?.id,
      beneficiary: 'merchant-demo-1',
      purpose: 'must not be created from a DENY authorization',
    })
    assert.equal(deniedTask.ok, false, 'a DENY authorization can never create a payment task')
    assert.equal(deniedTask.code, 'TRUST_AUTHORIZATION_REQUIRED')

    const allowed = requireOk(
      await call(tools, 'check_authorization', { delegation_id: delegationId, did: operatorDid, amount: 300, currency: 'USD' }),
      'in-limit authorization',
    )
    assert.equal(allowed.decision, 'ALLOW')
    const authorizationId = allowed.authorization?.id
    assert.match(authorizationId, /^authorization_/)

    const unknownDelegation = requireOk(
      await call(tools, 'check_authorization', { delegation_id: 'delegation_missing', did: operatorDid, amount: 10, currency: 'USD' }),
      'unknown delegation authorization',
    )
    assert.notEqual(unknownDelegation.decision, 'ALLOW', 'unknown delegation fails closed')

    const authorizedTask = requireOk(
      await call(tools, 'create_payment_task', {
        authorization_id: authorizationId,
        beneficiary: 'merchant-demo-1',
        purpose: 'authorized cross-border payment',
      }),
      'authorized task',
    )
    const authorizedTaskId = authorizedTask.task?.id
    assert.equal(Number(authorizedTask.task?.amount), 300)
    assert.equal(authorizedTask.task?.requester_did, payerDid)
    assert.notEqual(authorizedTaskId, draftTaskId, 'an authorized payment task is a distinct task')

    // The delegation is scoped to the task it was issued for, so the operational
    // chain (events, risk, case, report) runs against that delegated task.
    const taskId = draftTaskId

    // Operation event: authoritative verification never trusts signatures it cannot check.
    const event = requireOk(
      await call(tools, 'submit_operation_event', {
        task_id: taskId,
        event_type: 'PAYREQ',
        actor_did: operatorDid,
        payload: { amount: 300, currency: 'USD', beneficiary: 'merchant-demo-1' },
        source_ref: 'scenario-payreq-1',
        finality: 'OBSERVED',
        source_ledger: { ledger: 'scenario-ledger', sequence: 1 },
      }),
      'submit event',
    )
    const eventId = event.event?.id
    assert.ok(eventId, 'event id')

    // Risk is evaluable from the recorded features before any claim of verification
    // is made; the decision never authorizes payment and always carries evidence.
    const risk = requireOk(
      await call(tools, 'get_risk_decision', {
        task_id: taskId,
        subject_did: operatorDid,
        event_id: eventId,
        features: { velocity: 0.1, new_counterparty: 0.1 },
      }),
      'risk decision',
    )
    assert.equal(risk.evaluation_status, 'VALID')
    assert.equal(risk.decision, 'ALLOW', 'low risk features stay below the policy thresholds')
    assert.ok(risk.risk?.evidence_id, 'risk evidence is recorded')
    requireOk(await call(tools, 'read_risk_evidence', { task_id: taskId }), 'read risk evidence')

    // Authoritative verification never trusts what it cannot check: unsigned events
    // are UNKNOWN overall, even when the delegation covers them.
    const eventVerification = requireOk(await call(tools, 'verify_operation_event', { event_id: eventId }), 'verify event')
    const verification = eventVerification.verification
    assert.notEqual(verification?.overall_status, 'VALID', 'unsigned event never verifies as VALID')
    assert.equal(verification?.identity_status, 'UNKNOWN', 'unsigned event has unknown identity status')
    assert.equal(verification?.authorization_status, 'VALID', 'the active delegation covers the event')
    assert.equal(verification?.ledger_status, 'UNKNOWN', 'observed-only finality is not a ledger proof')
    assert.equal(verification?.overall_status, 'UNKNOWN')

    // Once verification is UNKNOWN, risk can no longer be evaluated from features alone.
    const deferredRisk = requireOk(
      await call(tools, 'get_risk_decision', {
        task_id: taskId,
        subject_did: operatorDid,
        event_id: eventId,
        features: { velocity: 0.1, new_counterparty: 0.1 },
      }),
      'risk after unknown verification',
    )
    assert.equal(deferredRisk.evaluation_status, 'UNKNOWN')
    assert.equal(deferredRisk.decision, 'DEFER', 'unknown verification downgrades risk to DEFER')

    // An event above the delegation limit is never covered by the delegation.
    const overLimitEvent = requireOk(
      await call(tools, 'submit_operation_event', {
        task_id: taskId,
        event_type: 'PAYREQ',
        actor_did: operatorDid,
        payload: { amount: 700, currency: 'USD', beneficiary: 'merchant-demo-1' },
        source_ref: 'scenario-payreq-over-limit',
        finality: 'OBSERVED',
      }),
      'submit over-limit event',
    )
    const overLimitVerification = requireOk(
      await call(tools, 'verify_operation_event', { event_id: overLimitEvent.event?.id }),
      'verify over-limit event',
    )
    assert.equal(
      overLimitVerification.verification?.authorization_status,
      'INVALID',
      'an event above the delegation limit fails closed',
    )
    assert.equal(overLimitVerification.verification?.overall_status, 'INVALID')

    const stepUp = requireOk(
      await call(tools, 'request_step_up', { task_id: taskId, reason: '大额跨境支付需要人工复核' }),
      'step-up',
    )
    assert.ok(stepUp.intervention?.id, 'step-up intervention recorded')
    requireOk(await call(tools, 'read_interventions', {}), 'read interventions')

    // Transition, trace case, evidence and report.
    const transitioned = requireOk(
      await call(tools, 'transition_payment_task', { task_id: taskId, status: 'SELECTED', reason: 'scenario selected' }),
      'transition task',
    )
    assert.equal(transitioned.task?.status, 'SELECTED')
    const invalidTransition = await call(tools, 'transition_payment_task', {
      task_id: taskId,
      status: 'SETTLED',
      reason: 'invalid target status',
    })
    assert.equal(invalidTransition.ok, false, 'unknown task status fails closed')

    const caseRecord = requireOk(await call(tools, 'create_trace_case', { task_id: taskId }), 'trace case')
    const caseId = caseRecord.case?.id
    assert.equal(caseRecord.case?.task_id, taskId)

    const content = 'cross-border payment ledger evidence'
    const evidence = requireOk(
      await call(tools, 'ingest_evidence', {
        case_id: caseId,
        source_type: 'ledger',
        source_ref: 'scenario-ledger-ref-1',
        content_hash: sha256(content),
        content,
        metadata: { source: 'scenario' },
      }),
      'ingest evidence',
    )
    requireOk(await call(tools, 'anchor_evidence', { evidence_id: evidence.evidence?.id }), 'anchor evidence')

    const report = requireOk(await call(tools, 'create_trace_report', { case_id: caseId }), 'trace report')
    assert.equal(report.report?.case_id, caseId)
    const reportId = report.report?.id
    requireOk(await call(tools, 'read_report', { report_id: reportId }), 'read report')
    requireOk(await call(tools, 'read_trace_context', { case_id: caseId }), 'read trace context')

    // Dashboard and browser overview reflect the chain, not cached session maps.
    const dashboard = requireOk(await call(tools, 'read_dashboard_summary', {}), 'dashboard')
    assert.ok(dashboard.summary, 'dashboard summary payload')
    const overviewResponse = await browser.request('/trust-platform/api/overview')
    assert.equal(overviewResponse.status, 200)
    const overview = JSON.parse(overviewResponse.body)
    assert.equal(overview.ok, true)
    assert.equal(overview.plugin.mode, 'embedded')
    assert.equal(overview.plugin.source, 'embedded-engine')
    assert.ok(overview.counts.identities >= 2, 'overview counts identities')
    assert.ok(overview.counts.tasks >= 2, 'overview counts tasks')
    assert.ok(overview.counts.events >= 1, 'overview counts events')
    assert.ok(overview.counts.credentials >= 1, 'overview counts credentials')
    assert.ok(overview.recent_events.length >= 1, 'overview lists recent activity')
    assert.equal(overviewResponse.headers['cache-control'], 'no-store')

    // Persistence: the state file holds the whole chain for the next restart.
    host.get('trustPlane')?.flush?.()
    const statePath = join(dataDir, 'state.json')
    assert.ok(existsSync(statePath), 'state.json written')
    const state = JSON.parse(readFileSync(statePath, 'utf8'))
    for (const collection of ['identities', 'credentials', 'delegations', 'tasks', 'events', 'risk_evidence', 'interventions', 'cases', 'reports', 'evidence', 'activity']) {
      const value = state[collection]
      assert.ok(value && typeof value === 'object', `state collection ${collection}`)
      assert.ok(Object.keys(value).length >= 1, `state collection ${collection} is not empty`)
    }
    assert.equal(state.settings.actorDid, 'system:scenario-runner')
    assert.ok(state.activity.length >= 1, 'activity log recorded')
  } finally {
    rmSync(dataDir, { recursive: true, force: true })
  }
})
