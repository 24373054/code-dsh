/**
 * Deterministic in-memory sandbox tools.
 *
 * These tools model the trust workflows without a control plane: every record
 * lives in this Node.js process and disappears on reload. They are useful for
 * demos, prompt development and offline evaluation, and they are explicitly
 * non-authoritative - the sandbox can never approve a real payment.
 *
 * @module dsh-trust-platform/in-memory-tools
 */

import {
  SANDBOX_SOURCE,
  definePluginTool,
  failed,
  finiteNumber,
  succeeded,
  text,
  uniqueId,
} from './toolkit.js'

/** Demo-only per-intent ceiling enforced by the sandbox authorization policy. */
const SANDBOX_AMOUNT_CEILING = 10000

/** Sandbox policy version stamped on local authorization records. */
const SANDBOX_POLICY_VERSION = 'policy-demo-001'

const SANDBOX_NOTE = 'In-memory sandbox: this record is not authoritative and is lost when the process reloads.'

/**
 * Create the nine canonical tools backed by the local sandbox.
 *
 * @returns tool definitions to register on `ctx.tools`.
 */
export function createInMemoryTools() {
  const identities = new Map()
  const credentials = new Map()
  const authorizations = new Map()
  const tasks = new Map()
  const events = []
  const executions = new Map()

  return [
    definePluginTool({
      name: 'register_identity',
      description:
        'Sandbox: register an agent identity in local memory. Records intent only and never grants payment authority. ' +
        'This is not a registry entry - use control-plane mode for real DIDs.',
      parameters: {
        did: { type: 'string', required: true, description: 'Agent DID to record.' },
        domain: { type: 'string', required: true, description: 'Domain that the identity belongs to.' },
        display_name: { type: 'string', description: 'Human-readable name.' },
      },
      execute(args) {
        const did = text(args.did)
        const domain = text(args.domain)
        if (!did || !domain) return failed({ code: 'TRUST_INVALID_ARGUMENT', message: 'did and domain are required' })
        const identity = {
          did,
          domain,
          display_name: text(args.display_name) || did,
          status: 'PENDING_VERIFICATION',
          source: SANDBOX_SOURCE,
          authoritative: false,
          created_at: new Date().toISOString(),
        }
        identities.set(did, identity)
        return succeeded({ identity, source: SANDBOX_SOURCE, authoritative: false, note: SANDBOX_NOTE })
      },
    }),

    definePluginTool({
      name: 'get_identity_status',
      description: 'Sandbox: read the locally recorded identity state. Never authoritative.',
      parameters: {
        did: { type: 'string', required: true, description: 'Agent DID to look up.' },
      },
      execute(args) {
        const identity = identities.get(text(args.did))
        if (!identity) {
          return failed({
            code: 'DID_NOT_FOUND',
            message: 'identity is not registered in this sandbox',
            decision: 'UNKNOWN',
          })
        }
        return succeeded({ identity, source: SANDBOX_SOURCE, authoritative: false })
      },
    }),

    definePluginTool({
      name: 'verify_credential',
      description:
        'Sandbox: record a credential reference and return a local verification decision. ' +
        'A reference alone is not cryptographic proof - use control-plane mode for real verification.',
      parameters: {
        did: { type: 'string', required: true, description: 'Subject DID the credential belongs to.' },
        credential_type: { type: 'string', required: true, description: 'Credential type label.' },
        credential_ref: { type: 'string', required: true, description: 'Opaque credential reference.' },
      },
      execute(args) {
        const did = text(args.did)
        const reference = text(args.credential_ref)
        if (!identities.has(did)) {
          return failed({ code: 'DID_NOT_FOUND', message: 'identity must be registered first', decision: 'UNKNOWN' })
        }
        const credential = {
          id: uniqueId('cred'),
          did,
          credential_type: text(args.credential_type),
          credential_ref: reference,
          status: reference === '' ? 'NOT_EVALUABLE' : 'VERIFIED',
          source: SANDBOX_SOURCE,
          authoritative: false,
          verified_at: new Date().toISOString(),
        }
        credentials.set(credential.id, credential)
        if (credential.status !== 'VERIFIED') {
          return failed({
            code: 'CREDENTIAL_NOT_EVALUABLE',
            message: 'the sandbox needs a non-empty credential reference to record a verification',
            credential,
            status: 'NOT_EVALUABLE',
          })
        }
        return succeeded({ credential, source: SANDBOX_SOURCE, authoritative: false })
      },
    }),

    definePluginTool({
      name: 'check_authorization',
      description:
        'Sandbox: evaluate a demo payment intent against fixed local rules ' +
        `(registered identity, amount above 0 and at most ${SANDBOX_AMOUNT_CEILING}, three-letter currency). ` +
        'A model cannot approve its own authority; the result is not authoritative.',
      parameters: {
        did: { type: 'string', required: true, description: 'Payer DID.' },
        beneficiary: { type: 'string', required: true, description: 'Payment beneficiary.' },
        amount: { type: 'number', required: true, description: 'Payment amount.' },
        currency: { type: 'string', required: true, description: 'Three-letter asset code.' },
      },
      execute(args) {
        const did = text(args.did)
        const amount = finiteNumber(args.amount)
        const currency = text(args.currency).toUpperCase()
        const allowed =
          identities.has(did) &&
          amount !== null &&
          amount > 0 &&
          amount <= SANDBOX_AMOUNT_CEILING &&
          currency.length === 3
        const reasons = []
        if (!identities.has(did)) reasons.push('identity is not registered in this sandbox')
        if (amount === null || amount <= 0) reasons.push('amount must be a positive number')
        if (amount !== null && amount > SANDBOX_AMOUNT_CEILING) reasons.push(`amount exceeds the sandbox ceiling of ${SANDBOX_AMOUNT_CEILING}`)
        if (currency.length !== 3) reasons.push('currency must be a three-letter asset code')

        const authorization = {
          id: uniqueId('auth'),
          did,
          beneficiary: text(args.beneficiary),
          amount,
          currency,
          decision: allowed ? 'ALLOW' : 'DEFER',
          reasons,
          policy_version: SANDBOX_POLICY_VERSION,
          source: SANDBOX_SOURCE,
          authoritative: false,
          evaluated_at: new Date().toISOString(),
        }
        authorizations.set(authorization.id, authorization)
        if (!allowed) {
          return failed({
            code: 'TRUST_AUTHORIZATION_DEFERRED',
            message: reasons.join('; '),
            authorization,
            source: SANDBOX_SOURCE,
          })
        }
        return succeeded({ authorization, source: SANDBOX_SOURCE, authoritative: false, note: SANDBOX_NOTE })
      },
    }),

    definePluginTool({
      name: 'create_payment_task',
      description:
        'Sandbox: create a local payment task after a sandbox ALLOW authorization. This tool never moves funds.',
      parameters: {
        authorization_id: { type: 'string', required: true, description: 'Authorization record returned by check_authorization.' },
        purpose: { type: 'string', required: true, description: 'Business purpose of the task.' },
      },
      execute(args) {
        const authorization = authorizations.get(text(args.authorization_id))
        if (!authorization || authorization.decision !== 'ALLOW') {
          return failed({
            code: 'TRUST_AUTHORIZATION_REQUIRED',
            message: 'an ALLOW sandbox authorization is required before creating a task',
            decision: 'DENY',
          })
        }
        const task = {
          id: uniqueId('task'),
          authorization_id: authorization.id,
          purpose: text(args.purpose),
          status: 'PENDING_EXECUTION_GATEWAY',
          source: SANDBOX_SOURCE,
          authoritative: false,
          created_at: new Date().toISOString(),
        }
        tasks.set(task.id, task)
        return succeeded({ task, source: SANDBOX_SOURCE, authoritative: false, note: SANDBOX_NOTE })
      },
    }),

    definePluginTool({
      name: 'submit_operation_event',
      description: 'Sandbox: append a local operation event for replay. Events are unverified local notes.',
      parameters: {
        task_id: { type: 'string', required: true, description: 'Sandbox task identifier.' },
        event_type: { type: 'string', required: true, description: 'Operation event type.' },
        event_ref: { type: 'string', required: true, description: 'External reference for the event.' },
      },
      execute(args) {
        const task = tasks.get(text(args.task_id))
        if (!task) {
          return failed({ code: 'TASK_NOT_FOUND', message: 'task is not known in this sandbox', decision: 'UNKNOWN' })
        }
        const event = {
          id: uniqueId('evt'),
          task_id: task.id,
          event_type: text(args.event_type),
          event_ref: text(args.event_ref),
          source: SANDBOX_SOURCE,
          authoritative: false,
          observed_at: new Date().toISOString(),
        }
        events.push(event)
        return succeeded({ event, source: SANDBOX_SOURCE, authoritative: false })
      },
    }),

    definePluginTool({
      name: 'get_risk_decision',
      description:
        'Sandbox: return a local review hint with evidence references. Risk never replaces authorization.',
      parameters: {
        task_id: { type: 'string', required: true, description: 'Sandbox task identifier.' },
      },
      execute(args) {
        const task = tasks.get(text(args.task_id))
        if (!task) {
          return failed({ code: 'TASK_NOT_FOUND', message: 'task is not known in this sandbox', decision: 'UNKNOWN' })
        }
        const evidenceRefs = events.filter((event) => event.task_id === task.id).map((event) => event.id)
        const decision = {
          task_id: task.id,
          decision: evidenceRefs.length > 0 ? 'REVIEW' : 'DEFER',
          evidence_refs: evidenceRefs,
          model_version: 'rules-0.1',
          authorization_effect: 'NONE',
          source: SANDBOX_SOURCE,
          authoritative: false,
        }
        return succeeded({ decision, note: 'Risk decisions never authorize payment.' })
      },
    }),

    definePluginTool({
      name: 'request_step_up',
      description: 'Sandbox: request stronger verification before continuing. Records a local challenge only.',
      parameters: {
        task_id: { type: 'string', required: true, description: 'Sandbox task identifier.' },
        reason: { type: 'string', required: true, description: 'Why step-up verification is required.' },
      },
      execute(args) {
        const task = tasks.get(text(args.task_id))
        if (!task) {
          return failed({ code: 'TASK_NOT_FOUND', message: 'task is not known in this sandbox', decision: 'UNKNOWN' })
        }
        return succeeded({
          task_id: task.id,
          challenge_id: uniqueId('stepup'),
          status: 'REQUIRED',
          reason: text(args.reason),
          source: SANDBOX_SOURCE,
          authoritative: false,
        })
      },
    }),

    definePluginTool({
      name: 'get_execution_receipt',
      description:
        'Sandbox: read the local execution gateway receipt. Absence of a receipt is not proof of settlement.',
      parameters: {
        task_id: { type: 'string', required: true, description: 'Sandbox task identifier.' },
      },
      execute(args) {
        const receipt = executions.get(text(args.task_id))
        if (!receipt) {
          return succeeded({ receipt: null, status: 'NOT_SETTLED', source: SANDBOX_SOURCE, authoritative: false })
        }
        return succeeded({ receipt, source: SANDBOX_SOURCE, authoritative: false })
      },
    }),
  ]
}
