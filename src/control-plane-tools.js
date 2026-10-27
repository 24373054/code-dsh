/**
 * Canonical trust tools backed by the real control plane.
 *
 * These tools keep their controller-facing names and safety semantics, and map
 * them onto authoritative service calls. Local maps only cache identifiers and
 * decisions produced by the service - they never substitute for a service call.
 *
 * @module dsh-trust-platform/control-plane-tools
 */

import {
  CONTROL_PLANE_SOURCE,
  controlPlaneTool,
  failed,
  finiteNumber,
  optionalText,
  plainObject,
  succeeded,
  text,
  uniqueId,
} from './toolkit.js'

/** Fields that must be present before a delegation can authorize anything. */
const REQUIRED_DELEGATION_FIELDS = [
  'status',
  'actions',
  'asset_id',
  'subject_did',
  'valid_from',
  'valid_to',
  'amount_limit',
  'daily_limit',
]

/** Event types accepted by the operation-event endpoint. */
const EVENT_TYPES = ['DELEGATE', 'QUOTE', 'SELECT', 'PAYREQ', 'RESULT', 'BRIDGE', 'SETTLE']

/** Event finality values accepted by the operation-event endpoint. */
const FINALITIES = ['OBSERVED', 'CONFIRMED', 'FINAL']

/**
 * Evaluate one delegation against a requested payment intent.
 *
 * The evaluation is deliberately conservative: anything that cannot be checked
 * from the delegation record yields `DEFER`, and approval requires every check
 * to pass. The function is pure so tests and callers can reuse it.
 *
 * @param delegation - delegation record returned by the control plane.
 * @param request - intent fields: `did`, `beneficiary`, `amount`, `currency`, `action`.
 * @param now - evaluation time (injectable for tests).
 * @param task_requester - when the task record is available, its requester DID;
 *   a root delegation must be issued by that requester.
 * @returns `{ decision, reasons, checks, policy_version, evaluated_at }`.
 */
export function evaluateDelegationAuthorization({ delegation, request = {}, now = new Date(), task_requester }) {
  const reasons = []
  const checks = {}
  const deny = (reason) => {
    reasons.push(reason)
    return { decision: 'DENY', reasons, checks, evaluated_at: now.toISOString() }
  }
  const defer = (reason) => {
    reasons.push(reason)
    return { decision: 'DEFER', reasons, checks, evaluated_at: now.toISOString() }
  }

  if (!plainObject(delegation)) return defer('delegation record is missing or unreadable')

  const missing = REQUIRED_DELEGATION_FIELDS.filter((field) => {
    const value = delegation[field]
    return value === undefined || value === null || value === ''
  })
  if (missing.length > 0) return defer(`delegation is missing required fields: ${missing.join(', ')}`)

  const status = text(delegation.status).toUpperCase()
  checks.status = status
  if (status !== 'ACTIVE') return deny(`delegation status is ${status}, not ACTIVE`)

  const validFrom = Date.parse(delegation.valid_from)
  const validTo = Date.parse(delegation.valid_to)
  if (!Number.isFinite(validFrom) || !Number.isFinite(validTo)) {
    return defer('delegation validity window is not parseable')
  }
  const nowMs = now.getTime()
  checks.valid_from = delegation.valid_from
  checks.valid_to = delegation.valid_to
  if (nowMs < validFrom) return deny('delegation is not valid yet')
  if (nowMs > validTo) return deny('delegation has expired')

  const actions = Array.isArray(delegation.actions)
    ? delegation.actions.map((action) => String(action).toUpperCase())
    : []
  const action = (optionalText(request.action) ?? 'PAYREQ').toUpperCase()
  checks.action = action
  if (!actions.includes(action)) return deny(`action ${action} is not delegated`)

  const subjectDid = text(delegation.subject_did)
  const requestedDid = optionalText(request.did)
  checks.subject_did = subjectDid
  if (requestedDid !== undefined && requestedDid !== subjectDid) {
    return deny(`delegation is bound to ${subjectDid}, not ${requestedDid}`)
  }

  const amount = finiteNumber(request.amount)
  if (amount === null || amount <= 0) return defer('payment amount is missing or not a positive number')
  const amountLimit = finiteNumber(delegation.amount_limit)
  const dailyLimit = finiteNumber(delegation.daily_limit)
  if (amountLimit === null || dailyLimit === null) return defer('delegation limits are not numeric')
  checks.amount = amount
  checks.amount_limit = amountLimit
  checks.daily_limit = dailyLimit
  if (amount > amountLimit) return deny(`amount ${amount} exceeds amount_limit ${amountLimit}`)
  if (amount > dailyLimit) return deny(`amount ${amount} exceeds daily_limit ${dailyLimit}`)

  const assetId = String(delegation.asset_id)
  const currency = (optionalText(request.currency) ?? assetId).toUpperCase()
  checks.asset_id = assetId
  checks.currency = currency
  if (currency !== assetId.toUpperCase()) {
    return deny(`delegation is scoped to asset ${assetId}, not ${currency}`)
  }

  const expectedRequester = optionalText(task_requester)
  if (expectedRequester !== undefined && optionalText(delegation.parent_id) === undefined) {
    const issuerDid = text(delegation.issuer_did)
    checks.issuer_did = issuerDid
    if (issuerDid !== expectedRequester) {
      return deny(`root delegation issuer ${issuerDid} is not the task requester ${expectedRequester}`)
    }
  }

  if (optionalText(request.task_id) !== undefined && optionalText(delegation.task_id) !== optionalText(request.task_id)) {
    return deny(`delegation is scoped to task ${text(delegation.task_id)}, not ${text(request.task_id)}`)
  }

  return {
    decision: 'ALLOW',
    reasons,
    checks,
    policy_version: optionalText(delegation.policy_version) ?? '',
    evaluated_at: now.toISOString(),
  }
}

/**
 * Extract the domain segment of a `did:trust:<domain>:<subject>` identifier.
 *
 * @param did - DID string.
 * @returns the domain, or the empty string when the DID is not in that form.
 */
export function domainFromDid(did) {
  const parts = text(did).split(':')
  return parts.length >= 4 && parts[0] === 'did' && parts[1] === 'trust' ? parts[2] : ''
}

/** Extract the subject segment of a `did:trust:<domain>:<subject>` identifier. */
export function subjectFromDid(did) {
  const parts = text(did).split(':')
  return parts.length >= 4 && parts[0] === 'did' && parts[1] === 'trust' ? parts.slice(3).join(':') : ''
}

/**
 * Create the canonical tools for control-plane mode.
 *
 * @param options.resolveClient - lazy lookup of the `trustPlatformClient` service.
 * @param options.config - normalized plugin configuration.
 * @param options.allowInterventionExecution - register the execution tool.
 * @returns tool definitions to register on `ctx.tools`.
 */
export function createControlPlaneTools({ resolveClient, config, allowInterventionExecution }) {
  const identities = new Map()
  const authorizations = new Map()
  const tasks = new Map()

  /** Tool builder: resolve the client lazily and forward caller cancellation. */
  const tool = (name, description, parameters, execute) =>
    controlPlaneTool(resolveClient, {
      name,
      description,
      parameters,
      execute: async (client, args, exec) => {
        const options = { signal: exec?.signal }
        return execute(client, args, exec, options)
      },
    })

  const definitions = [
    tool(
      'register_identity',
      'Register an agent identity (DID) with the real trust control plane. ' +
        'Registration creates the domain when it does not exist yet and never grants payment authority.',
      {
        domain_id: { type: 'string', description: 'Domain to register the identity in, e.g. "corp.example".' },
        subject_id: { type: 'string', description: 'Subject identifier within the domain.' },
        display_name: { type: 'string', description: 'Human-readable name for the identity.' },
        did: { type: 'string', description: 'Legacy DID argument; its domain and subject are reused when the other fields are absent.' },
        domain: { type: 'string', description: 'Legacy domain argument.' },
        jurisdiction: { type: 'string', description: 'Jurisdiction code; the service defaults to CN.' },
      },
      async (client, args, _exec, options) => {
        const didValue = text(args.did)
        const domainId = text(args.domain_id) || text(args.domain) || domainFromDid(didValue)
        const subjectId = text(args.subject_id) || subjectFromDid(didValue) || text(args.display_name)
        const displayName = text(args.display_name) || didValue || subjectId
        if (domainId === '' || subjectId === '' || displayName === '') {
          return failed({
            code: 'TRUST_INVALID_ARGUMENT',
            message: 'domain_id and subject_id (or a did:trust:<domain>:<subject> value) are required',
          })
        }
        const payload = { domain_id: domainId, subject_id: subjectId, display_name: displayName }
        const jurisdiction = optionalText(args.jurisdiction)
        if (jurisdiction !== undefined) payload.jurisdiction = jurisdiction
        const { data } = await client.request('didRegister', payload, options)
        if (plainObject(data) && typeof data.did === 'string') identities.set(data.did, data)
        return succeeded({ identity: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'get_identity_status',
      'Read the authoritative status and DID document of a registered identity from the control plane.',
      {
        did: { type: 'string', required: true, description: 'DID, e.g. "did:trust:corp.example:agent-7".' },
      },
      async (client, args, _exec, options) => {
        const did = text(args.did)
        if (did === '') return failed({ code: 'TRUST_INVALID_ARGUMENT', message: 'did is required' })
        const { data } = await client.request('didGet', undefined, { ...options, path: { did } })
        if (plainObject(data) && typeof data.did === 'string') identities.set(data.did, data)
        return succeeded({ identity: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'verify_credential',
      'Verify a verifiable credential with the control plane. ' +
        'Verification is authoritative and never assumes a credential is valid when data is missing.',
      {
        credential: {
          type: 'object',
          additionalProperties: true,
          description: 'Verifiable credential JSON document to verify.',
        },
        credential_id: { type: 'string', description: 'Identifier of a credential already issued by the control plane.' },
        required_claims: {
          type: 'array',
          items: { type: 'string' },
          description: 'Claims that must be present for the credential to remain valid.',
        },
      },
      async (client, args, _exec, options) => {
        let credential = plainObject(args.credential)
        if (!credential) {
          const credentialId = text(args.credential_id)
          if (credentialId === '') {
            return failed({
              code: 'TRUST_CREDENTIAL_NOT_EVALUABLE',
              message: 'provide a credential document or a credential_id to verify',
              decision: 'NOT_EVALUABLE',
            })
          }
          const { data } = await client.request('credentialGet', undefined, {
            ...options,
            path: { credential_id: credentialId },
          })
          credential = plainObject(data?.credential)
          if (!credential) {
            return failed({
              code: 'TRUST_CREDENTIAL_NOT_EVALUABLE',
              message: 'the control plane did not return a credential document for this identifier',
              decision: 'NOT_EVALUABLE',
            })
          }
        }
        const payload = { credential }
        const requiredClaims = Array.isArray(args.required_claims)
          ? args.required_claims.map((claim) => text(claim)).filter((claim) => claim !== '')
          : []
        if (requiredClaims.length > 0) payload.required_claims = requiredClaims
        const { data } = await client.request('credentialVerify', payload, options)
        const status = text(data?.status).toUpperCase() || 'UNKNOWN'
        if (data?.valid !== true || status !== 'VALID') {
          const reasons = Array.isArray(data?.reasons) ? data.reasons.filter((reason) => typeof reason === 'string') : []
          return failed({
            code: `TRUST_CREDENTIAL_${status === 'UNKNOWN' ? 'UNKNOWN' : 'NOT_VALID'}`,
            message: reasons.length > 0 ? reasons.join('; ') : `credential verification returned ${status}`,
            decision: status === 'UNKNOWN' ? 'UNKNOWN' : 'DEFER',
            verification: data,
            evidence_refs: Array.isArray(data?.evidence_refs) ? data.evidence_refs : [],
            policy_version: data?.policy_version ?? null,
          })
        }
        return succeeded({ verification: data, valid: true, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'check_authorization',
      'Check whether a delegation authorizes a payment intent. ' +
        'The decision is deterministic and delegated: ACTIVE status, validity window, delegated action, subject binding, ' +
        'amount and daily limits, and asset scope must all pass. Missing data is DEFER, never ALLOW.',
      {
        delegation_id: { type: 'string', required: true, description: 'Delegation identifier to evaluate.' },
        did: { type: 'string', description: 'Payer DID expected by the delegation subject binding.' },
        beneficiary: { type: 'string', description: 'Payment beneficiary, recorded on the authorization.' },
        amount: { type: 'number', description: 'Payment amount to compare against delegation limits.' },
        currency: { type: 'string', description: 'Asset code; must match the delegation asset scope.' },
        action: { type: 'string', description: 'Delegated action to check; defaults to PAYREQ.' },
        task_id: {
          type: 'string',
          description: 'Optional task identifier; when given, the root delegation issuer must be the task requester.',
        },
      },
      async (client, args, _exec, options) => {
        const delegationId = text(args.delegation_id)
        if (delegationId === '') {
          return failed({ code: 'TRUST_INVALID_ARGUMENT', message: 'delegation_id is required' })
        }
        const { data: delegation } = await client.request('delegationGet', undefined, {
          ...options,
          path: { delegation_id: delegationId },
        })
        let taskRequester
        const taskId = optionalText(args.task_id)
        if (taskId !== undefined) {
          const { data: task } = await client.request('taskGet', undefined, { ...options, path: { task_id: taskId } })
          taskRequester = task?.requester_did
        }
        const evaluation = evaluateDelegationAuthorization({
          delegation,
          request: taskId === undefined ? args : { ...args, task_id: taskId },
          task_requester: taskRequester,
        })
        const authorization = {
          id: uniqueId('auth'),
          delegation_id: text(delegation?.id) || delegationId,
          task_id: optionalText(delegation?.task_id) ?? null,
          did: text(delegation?.subject_did),
          beneficiary: optionalText(args.beneficiary) ?? null,
          amount: finiteNumber(args.amount),
          asset_id: text(delegation?.asset_id) || null,
          currency: (optionalText(args.currency) ?? optionalText(delegation?.asset_id) ?? '').toUpperCase(),
          action: evaluation.checks?.action ?? 'PAYREQ',
          decision: evaluation.decision,
          reasons: evaluation.reasons,
          policy_version: evaluation.policy_version ?? optionalText(delegation?.policy_version) ?? null,
          evaluated_at: evaluation.evaluated_at,
          source: CONTROL_PLANE_SOURCE,
          authoritative: true,
        }
        authorizations.set(authorization.id, authorization)
        if (evaluation.decision !== 'ALLOW') {
          return failed({
            code: evaluation.decision === 'DENY' ? 'TRUST_AUTHORIZATION_DENIED' : 'TRUST_AUTHORIZATION_DEFERRED',
            message: evaluation.reasons.join('; '),
            decision: evaluation.decision,
            authorization,
            source: CONTROL_PLANE_SOURCE,
          })
        }
        return succeeded({ authorization, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'create_payment_task',
      'Create a payment task on the control plane after a control-plane ALLOW authorization. ' +
        'This records an intent to pay; it never moves funds or settles value.',
      {
        authorization_id: {
          type: 'string',
          required: true,
          description: 'Authorization returned by check_authorization in this session.',
        },
        purpose: { type: 'string', description: 'Business purpose stored in task metadata.' },
        domain_id: { type: 'string', description: 'Domain override; derived from the authorization DID by default.' },
        policy_version: { type: 'string', description: 'Policy version override.' },
        metadata: {
          type: 'object',
          additionalProperties: true,
          description: 'Additional JSON metadata merged into the task.',
        },
      },
      async (client, args, _exec, options) => {
        const authorizationId = text(args.authorization_id)
        const authorization = authorizations.get(authorizationId)
        if (!authorization || authorization.decision !== 'ALLOW') {
          return failed({
            code: 'TRUST_AUTHORIZATION_REQUIRED',
            message:
              'create_payment_task requires an ALLOW authorization produced by check_authorization in this session',
            decision: 'DENY',
          })
        }
        const domainId = text(args.domain_id) || domainFromDid(authorization.did)
        if (domainId === '') {
          return failed({
            code: 'TRUST_DOMAIN_REQUIRED',
            message: 'cannot derive a domain from the authorized DID; pass domain_id explicitly',
            decision: 'DEFER',
          })
        }
        const beneficiary = text(authorization.beneficiary) || text(args.beneficiary)
        if (beneficiary.length < 2) {
          return failed({
            code: 'TRUST_BENEFICIARY_REQUIRED',
            message: 'a beneficiary with at least two characters is required on the authorization or task',
            decision: 'DEFER',
          })
        }
        const actorDid = optionalText(config.actorDid) ?? ''
        if (actorDid !== '' && !actorDid.startsWith('system:') && actorDid !== authorization.did) {
          return failed({
            code: 'ACTOR_MISMATCH',
            message: `configured actorDid ${actorDid} does not match the authorized payer ${authorization.did}`,
            decision: 'DENY',
          })
        }
        const payload = {
          domain_id: domainId,
          requester_did: authorization.did,
          asset_id: authorization.asset_id ?? authorization.currency,
          amount: authorization.amount,
          beneficiary,
        }
        const policyVersion = optionalText(args.policy_version) ?? optionalText(authorization.policy_version)
        if (policyVersion !== undefined) payload.policy_version = policyVersion
        const metadata = { ...(plainObject(args.metadata) ?? {}) }
        const purpose = optionalText(args.purpose)
        if (purpose !== undefined) metadata.purpose = purpose
        metadata.authorization_id = authorization.id
        metadata.delegation_id = authorization.delegation_id
        payload.metadata = metadata
        const { data } = await client.request('taskCreate', payload, options)
        if (plainObject(data) && typeof data.id === 'string') tasks.set(data.id, data)
        return succeeded({ task: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'submit_operation_event',
      'Submit an operation event for a payment task to the control plane. ' +
        'Events are observed records; they are not proof of settlement and may fail verification.',
      {
        task_id: { type: 'string', required: true, description: 'Payment task identifier.' },
        event_type: {
          type: 'string',
          required: true,
          description: `Operation event type: ${EVENT_TYPES.join(', ')}.`,
        },
        source_ref: { type: 'string', required: true, description: 'External reference of the observed operation (2-250 characters).' },
        actor_did: { type: 'string', description: 'Actor that emits the event; defaults to the task requester.' },
        payload: {
          type: 'object',
          additionalProperties: true,
          description: 'Event payload JSON object.',
        },
        finality: { type: 'string', description: `Finality: ${FINALITIES.join(', ')}; defaults to OBSERVED.` },
        trace_id: { type: 'string', description: 'Optional trace identifier shared across events.' },
        counterparty_did: { type: 'string', description: 'Optional counterparty DID.' },
      },
      async (client, args, _exec, options) => {
        const taskId = text(args.task_id)
        const eventType = text(args.event_type).toUpperCase()
        const sourceRef = text(args.source_ref)
        if (taskId === '' || sourceRef.length < 2) {
          return failed({ code: 'TRUST_INVALID_ARGUMENT', message: 'task_id and source_ref (2+ characters) are required' })
        }
        if (!EVENT_TYPES.includes(eventType)) {
          return failed({
            code: 'TRUST_INVALID_ARGUMENT',
            message: `event_type must be one of ${EVENT_TYPES.join(', ')}`,
          })
        }
        const task = tasks.get(taskId)
        const actorDid = optionalText(args.actor_did) ?? optionalText(task?.requester_did) ?? optionalText(config.actorDid)
        if (actorDid === undefined) {
          return failed({
            code: 'TRUST_ACTOR_REQUIRED',
            message: 'actor_did is required: pass it, or create the task through this plugin first',
            decision: 'DEFER',
          })
        }
        const payload = {
          task_id: taskId,
          event_type: eventType,
          actor_did: actorDid,
          source_ref: sourceRef,
          payload: plainObject(args.payload) ?? {},
        }
        const finality = optionalText(args.finality)
        if (finality !== undefined) {
          const normalized = finality.toUpperCase()
          if (!FINALITIES.includes(normalized)) {
            return failed({ code: 'TRUST_INVALID_ARGUMENT', message: `finality must be one of ${FINALITIES.join(', ')}` })
          }
          payload.finality = normalized
        }
        const traceId = optionalText(args.trace_id)
        if (traceId !== undefined) payload.trace_id = traceId
        const counterpartyDid = optionalText(args.counterparty_did)
        if (counterpartyDid !== undefined) payload.counterparty_did = counterpartyDid
        const { data } = await client.request('eventCreate', payload, options)
        return succeeded({ event: data, source: CONTROL_PLANE_SOURCE, authoritative: true })
      },
    ),

    tool(
      'get_risk_decision',
      'Evaluate risk for a payment task. The risk decision never authorizes payment and never replaces ' +
        'check_authorization; it only informs it.',
      {
        task_id: { type: 'string', required: true, description: 'Payment task identifier.' },
        subject_did: { type: 'string', description: 'Subject DID to score; defaults to the task requester.' },
        event_id: { type: 'string', description: 'Optional operation event that belongs to the task.' },
        features: {
          type: 'object',
          additionalProperties: true,
          description: 'Risk features: velocity, amount_deviation, new_counterparty, cross_chain_hops, identity_unknown.',
        },
        policy_version: { type: 'string', description: 'Optional policy version override.' },
        model_version: { type: 'string', description: 'Optional model version override.' },
      },
      async (client, args, _exec, options) => {
        const taskId = text(args.task_id)
        if (taskId === '') return failed({ code: 'TRUST_INVALID_ARGUMENT', message: 'task_id is required' })
        let subjectDid = optionalText(args.subject_did)
        if (subjectDid === undefined) {
          const task = tasks.get(taskId)
          if (task && typeof task.requester_did === 'string') {
            subjectDid = task.requester_did
          } else {
            try {
              const { data } = await client.request('taskGet', undefined, { ...options, path: { task_id: taskId } })
              subjectDid = optionalText(data?.requester_did)
              if (plainObject(data) && typeof data.id === 'string') tasks.set(data.id, data)
            } catch {
              subjectDid = undefined
            }
          }
        }
        if (subjectDid === undefined) subjectDid = optionalText(config.actorDid)
        if (subjectDid === undefined) {
          return failed({
            code: 'TRUST_SUBJECT_REQUIRED',
            message: 'subject_did is required: pass it, or create the task through this plugin first',
            decision: 'DEFER',
          })
        }
        const payload = { task_id: taskId, subject_did: subjectDid }
        const eventId = optionalText(args.event_id)
        if (eventId !== undefined) payload.event_id = eventId
        payload.features = plainObject(args.features) ?? {}
        const policyVersion = optionalText(args.policy_version)
        if (policyVersion !== undefined) payload.policy_version = policyVersion
        const modelVersion = optionalText(args.model_version)
        if (modelVersion !== undefined) payload.model_version = modelVersion
        const { data } = await client.request('riskEvaluate', payload, options)
        return succeeded({
          decision: data?.decision ?? null,
          evaluation_status: data?.evaluation_status ?? null,
          score: data?.score ?? null,
          trust_score: data?.trust_score ?? null,
          reasons: Array.isArray(data?.reasons) ? data.reasons : [],
          evidence_refs: data?.evidence_id ? [data.evidence_id] : [],
          model_version: data?.model_version ?? null,
          risk: data,
          authorization_effect: 'NONE',
          source: CONTROL_PLANE_SOURCE,
          authoritative: true,
          note: 'Risk informs authorization; it never authorizes payment.',
        })
      },
    ),

    tool(
      'request_step_up',
      'Create a real STEP_UP intervention decision on the control plane. ' +
        'The effective action may be downgraded by the service; only STEP_UP satisfies the request.',
      {
        task_id: { type: 'string', required: true, description: 'Payment task identifier.' },
        reason: { type: 'string', required: true, description: 'Why stronger verification is required.' },
        event_id: { type: 'string', description: 'Optional operation event that triggered the request.' },
        rationale: {
          type: 'object',
          additionalProperties: true,
          description: 'Additional rationale fields merged into the intervention rationale object.',
        },
        policy_version: { type: 'string', description: 'Optional policy version override.' },
      },
      async (client, args, _exec, options) => {
        const taskId = text(args.task_id)
        const reason = text(args.reason)
        if (taskId === '' || reason === '') {
          return failed({ code: 'TRUST_INVALID_ARGUMENT', message: 'task_id and reason are required' })
        }
        const payload = {
          task_id: taskId,
          action: 'STEP_UP',
          rationale: { ...(plainObject(args.rationale) ?? {}), reason },
        }
        const eventId = optionalText(args.event_id)
        if (eventId !== undefined) payload.event_id = eventId
        const policyVersion = optionalText(args.policy_version)
        if (policyVersion !== undefined) payload.policy_version = policyVersion
        const { data } = await client.request('interventionDecide', payload, options)
        const effectiveAction = text(data?.action).toUpperCase()
        const status = effectiveAction === 'STEP_UP' ? 'REQUIRED' : 'NOT_GRANTED'
        return succeeded({
          step_up: {
            decision_id: data?.id ?? null,
            task_id: data?.task_id ?? taskId,
            effective_action: effectiveAction || null,
            status,
            rationale: data?.rationale ?? payload.rationale,
            policy_version: data?.policy_version ?? null,
            created_at: data?.created_at ?? null,
          },
          status,
          source: CONTROL_PLANE_SOURCE,
          authoritative: true,
          note: status === 'REQUIRED' ? 'Step-up verification is required.' : 'The service accepted the request with a different action.',
        })
      },
    ),

    tool(
      'get_execution_receipt',
      'Report the execution receipt for a payment task. ' +
        'The control plane has no receipt read endpoint, so this tool never claims settlement.',
      {
        task_id: { type: 'string', required: true, description: 'Payment task identifier.' },
      },
      async (_client, args) => {
        const taskId = text(args.task_id)
        if (taskId === '') return failed({ code: 'TRUST_INVALID_ARGUMENT', message: 'task_id is required' })
        return succeeded({
          receipt: null,
          status: 'NOT_SUPPORTED',
          task_id: taskId,
          source: CONTROL_PLANE_SOURCE,
          authoritative: true,
          message:
            'the control plane exposes no execution-receipt read endpoint; settlement is not observable through this plugin',
        })
      },
    ),
  ]

  if (allowInterventionExecution) {
    definitions.push(
      tool(
        'execute_intervention',
        'Execute an intervention decision and return the real execution receipt. ' +
          'This may reserve quota and move the payment task state; it never transfers funds.',
        {
          decision_id: { type: 'string', required: true, description: 'Intervention decision identifier to execute.' },
        },
        async (client, args, _exec, options) => {
          const decisionId = text(args.decision_id)
          if (decisionId === '') return failed({ code: 'TRUST_INVALID_ARGUMENT', message: 'decision_id is required' })
          const { data } = await client.request('interventionExecute', {}, {
            ...options,
            path: { decision_id: decisionId },
          })
          return succeeded({
            receipt: data,
            status: text(data?.status) || 'UNKNOWN',
            source: CONTROL_PLANE_SOURCE,
            authoritative: true,
          })
        },
      ),
    )
  }

  return definitions
}
