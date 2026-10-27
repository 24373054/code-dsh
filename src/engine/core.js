/**
 * Shared primitives for the embedded trust plane.
 *
 * The trust plane used to live in a separate Python control plane. It now runs
 * inside the DSH plugin process: this module owns identifiers, canonical JSON,
 * hashing, Ed25519 proofs, deterministic errors, persistence and the mutable
 * state container that every engine module shares.
 */
import { createHash, createPrivateKey, createPublicKey, randomBytes, sign as edSign, verify as edVerify } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'

export const POLICY_VERSION = 'policy-2026-10-25-001'
export const SCHEMA_VERSION = 1
export const ACTIVITY_LIMIT = 200
export const PLUGIN_NAME = '@sealwax/dsh-trust-platform'

export const DEFAULT_POLICY = Object.freeze({
  policyVersion: POLICY_VERSION,
  singleAmountLimit: 1000000,
  dailyAmountLimit: 5000000,
  riskBlockThreshold: 0.8,
  riskDeferThreshold: 0.6,
  riskThrottleThreshold: 0.4,
  defaultTrustScore: 0.95,
})

export const DEFAULT_SETTINGS = Object.freeze({
  actorDid: 'system:dsh-web',
  allowInterventionExecution: false,
  policy: DEFAULT_POLICY,
})

export class ServiceError extends Error {
  constructor(code, message, options = {}) {
    super(message)
    this.name = 'ServiceError'
    this.code = code
    this.status = options.status ?? 400
    this.retryable = options.retryable ?? false
    this.evidenceRefs = options.evidenceRefs ?? []
    this.policyVersion = options.policyVersion ?? POLICY_VERSION
    this.details = options.details
  }

  toJSON() {
    return {
      error_code: this.code,
      message: this.message,
      status: this.status,
      retryable: this.retryable,
      evidence_refs: this.evidenceRefs,
      policy_version: this.policyVersion,
      ...(this.details === undefined ? {} : { details: this.details }),
    }
  }
}

export function fail(code, message, options) {
  throw new ServiceError(code, message, options)
}

/* ------------------------------------------------------------------ */
/* identifiers                                                         */
/* ------------------------------------------------------------------ */

export function uuid7(nowMs = Date.now()) {
  const tsHex = nowMs.toString(16).padStart(12, '0').slice(-12)
  const rand = randomBytes(10).toString('hex')
  const variant = (8 + (parseInt(rand[0], 16) & 3)).toString(16)
  return `${tsHex.slice(0, 8)}-${tsHex.slice(8, 12)}-7${rand.slice(0, 3)}-${variant}${rand.slice(3, 6)}-${rand.slice(6, 18)}`
}

export function newId(prefix) {
  return `${prefix}_${uuid7()}`
}

export function isUuid7(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value)
}

/* ------------------------------------------------------------------ */
/* time                                                                */
/* ------------------------------------------------------------------ */

export function nowDate() {
  return new Date()
}

export function nowIso() {
  return new Date().toISOString()
}

/** Python `datetime.isoformat()` style naive UTC timestamp. */
export function naiveIso(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  return date.toISOString().slice(0, 19)
}

export function isoOrNull(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/* ------------------------------------------------------------------ */
/* canonical JSON + hashing                                            */
/* ------------------------------------------------------------------ */

function sortedValue(value) {
  if (Array.isArray(value)) return value.map(sortedValue)
  if (value && typeof value === 'object') {
    const out = {}
    for (const key of Object.keys(value).sort()) {
      if (value[key] !== undefined) out[key] = sortedValue(value[key])
    }
    return out
  }
  return value
}

export function canonicalJson(value) {
  return Buffer.from(JSON.stringify(sortedValue(value)), 'utf8')
}

export function sha256Hex(value) {
  const payload = Buffer.isBuffer(value) || value instanceof Uint8Array ? Buffer.from(value) : canonicalJson(value)
  return createHash('sha256').update(payload).digest('hex')
}

const SM3_IV = [0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600, 0xa96f30bc, 0x163138aa, 0xe38dee4d, 0xb0fb0e4e]

function rotl32(value, bits) {
  return ((value << bits) | (value >>> (32 - bits))) >>> 0
}

function sm3P0(value) {
  return (value ^ rotl32(value, 9) ^ rotl32(value, 17)) >>> 0
}

function sm3P1(value) {
  return (value ^ rotl32(value, 15) ^ rotl32(value, 23)) >>> 0
}

/** GB/T 32905-2016 SM3. Kept dependency free so evidence hashes stay local. */
export function sm3Hex(value) {
  const payload = Buffer.isBuffer(value) || value instanceof Uint8Array ? Buffer.from(value) : canonicalJson(value)
  const bitLength = BigInt(payload.length) * 8n
  const padded = Buffer.alloc(Math.ceil((payload.length + 9) / 64) * 64)
  payload.copy(padded)
  padded[payload.length] = 0x80
  padded.writeBigUInt64BE(bitLength, padded.length - 8)
  const state = SM3_IV.slice()
  const words = new Array(68).fill(0)
  const wordsPrime = new Array(64).fill(0)
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let index = 0; index < 16; index += 1) words[index] = padded.readUInt32BE(offset + index * 4)
    for (let index = 16; index < 68; index += 1) {
      words[index] = (sm3P1(words[index - 16] ^ words[index - 9] ^ rotl32(words[index - 3], 15)) ^ rotl32(words[index - 13], 7) ^ words[index - 6]) >>> 0
    }
    for (let index = 0; index < 64; index += 1) wordsPrime[index] = (words[index] ^ words[index + 4]) >>> 0
    let [a, b, c, d, e, f, g, h] = state
    for (let index = 0; index < 64; index += 1) {
      const ss1 = rotl32((rotl32(a, 12) + e + rotl32(index <= 15 ? 0x79cc4519 : 0x7a879d8a, index % 32)) >>> 0, 7)
      const ss2 = (ss1 ^ rotl32(a, 12)) >>> 0
      const ff = index <= 15 ? (a ^ b ^ c) : ((a & b) | (a & c) | (b & c))
      const gg = index <= 15 ? (e ^ f ^ g) : ((e & f) | (~e & g))
      const tt1 = (((ff >>> 0) + d + ss2 + wordsPrime[index]) >>> 0)
      const tt2 = (((gg >>> 0) + h + ss1 + words[index]) >>> 0)
      d = c
      c = rotl32(b, 9)
      b = a
      a = tt1
      h = g
      g = rotl32(f, 19)
      f = e
      e = sm3P0(tt2)
    }
    state[0] = (state[0] ^ a) >>> 0
    state[1] = (state[1] ^ b) >>> 0
    state[2] = (state[2] ^ c) >>> 0
    state[3] = (state[3] ^ d) >>> 0
    state[4] = (state[4] ^ e) >>> 0
    state[5] = (state[5] ^ f) >>> 0
    state[6] = (state[6] ^ g) >>> 0
    state[7] = (state[7] ^ h) >>> 0
  }
  return state.map((word) => word.toString(16).padStart(8, '0')).join('')
}

export function b64url(value) {
  return Buffer.from(value).toString('base64url')
}

export function unb64url(value) {
  return Buffer.from(String(value), 'base64url')
}

/* ------------------------------------------------------------------ */
/* Ed25519 proofs (raw 32-byte keys, same envelope as the old service) */
/* ------------------------------------------------------------------ */

const PKCS8_PREFIX = Buffer.from('302e020100300506032b657004220420', 'hex')
const SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex')

function privateKeyObject(rawBase64) {
  return createPrivateKey({ key: Buffer.concat([PKCS8_PREFIX, unb64url(rawBase64)]), format: 'der', type: 'pkcs8' })
}

function publicKeyObject(rawBase64) {
  return createPublicKey({ key: Buffer.concat([SPKI_PREFIX, unb64url(rawBase64)]), format: 'der', type: 'spki' })
}

export function generateKeyPair() {
  const raw = randomBytes(32)
  const privateKey = b64url(raw)
  const publicJwk = createPublicKey(privateKeyObject(privateKey)).export({ format: 'jwk' })
  return { privateKey, publicKey: publicJwk.x }
}

export function publicFromPrivate(privateKey) {
  return createPublicKey(privateKeyObject(privateKey)).export({ format: 'jwk' }).x
}

export function signPayload(privateKey, payload) {
  return edSign(null, canonicalJson(payload), privateKeyObject(privateKey)).toString('base64url')
}

export function verifySignature(publicKey, signature, payload) {
  try {
    return edVerify(null, canonicalJson(payload), publicKeyObject(publicKey), unb64url(signature))
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ */
/* DID + verifiable credentials                                        */
/* ------------------------------------------------------------------ */

export function createDid(domainId, subjectId) {
  return `did:trust:${domainId}:${subjectId}`
}

export function domainFromDid(did) {
  const parts = String(did || '').split(':')
  return parts.length >= 4 && parts[0] === 'did' && parts[1] === 'trust' ? parts[2] : null
}

export function subjectFromDid(did) {
  const parts = String(did || '').split(':')
  return parts.length >= 4 && parts[0] === 'did' && parts[1] === 'trust' ? parts.slice(3).join(':') : null
}

export function didDocument(did, publicKey, domainId) {
  const keyId = `${did}#key-1`
  return {
    id: did,
    controller: did,
    verificationMethod: [{ id: keyId, type: 'Ed25519VerificationKey2020', controller: did, publicKeyMultibase: publicKey }],
    authentication: [keyId],
    assertionMethod: [keyId],
    service: [{ id: `${did}#api`, type: 'TrustPlatformApi', serviceEndpoint: 'dsh-plugin://trust-platform/api' }],
    domain_id: domainId,
    updated_at: nowIso(),
  }
}

export function credentialTime(value = new Date()) {
  return naiveIso(value)
}

export function issueCredential({ credentialId, credentialType, issuerDid, subjectDid, claims, issuerPrivateKey, validFrom, validTo }) {
  const unsigned = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id: credentialId,
    type: ['VerifiableCredential', credentialType],
    issuer: issuerDid,
    issuanceDate: credentialTime(validFrom),
    expirationDate: credentialTime(validTo),
    credentialSubject: { id: subjectDid, ...claims },
  }
  return { ...unsigned, proof: { type: 'Ed25519Signature2020', proofValue: signPayload(issuerPrivateKey, unsigned) } }
}

export function verifyCredentialProof(credential, publicKey) {
  if (!credential || typeof credential !== 'object') return false
  const { proof, ...unsigned } = credential
  if (!proof || proof.type !== 'Ed25519Signature2020' || typeof proof.proofValue !== 'string') return false
  return verifySignature(publicKey, proof.proofValue, unsigned)
}

/* ------------------------------------------------------------------ */
/* persistence                                                         */
/* ------------------------------------------------------------------ */

export function defaultDataDir() {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh')
  return join(home, 'plugin-data', 'dsh-trust-platform')
}

export class FileStore {
  constructor(dataDir) {
    this.dataDir = dataDir
    this.file = join(dataDir, 'state.json')
    this.timer = null
    this.pending = null
  }

  load() {
    try {
      if (!existsSync(this.file)) return null
      const parsed = JSON.parse(readFileSync(this.file, 'utf8'))
      return parsed && typeof parsed === 'object' ? parsed : null
    } catch {
      return null
    }
  }

  save(state) {
    this.pending = state
    if (this.timer) return
    this.timer = setTimeout(() => this.flush(), 120)
    if (typeof this.timer.unref === 'function') this.timer.unref()
  }

  flush() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (!this.pending) return
    const state = this.pending
    this.pending = null
    try {
      mkdirSync(dirname(this.file), { recursive: true })
      const temporary = `${this.file}.${process.pid}.tmp`
      writeFileSync(temporary, JSON.stringify(state), 'utf8')
      renameSync(temporary, this.file)
    } catch {
      // Persistence is best effort: a failed write must never break a tool call.
    }
  }
}

export class MemoryStore {
  constructor() {
    this.state = null
  }

  load() {
    return this.state
  }

  save(state) {
    this.state = state
  }

  flush() {}
}

/* ------------------------------------------------------------------ */
/* state                                                               */
/* ------------------------------------------------------------------ */

export function createInitialState(settings = {}) {
  return {
    schema_version: SCHEMA_VERSION,
    created_at: nowIso(),
    updated_at: nowIso(),
    settings: settings.settings ? clone(settings.settings) : {},
    event_seq: 0,
    audit_seq: 0,
    identities: {},
    identity_keys: {},
    credentials: {},
    credential_status: {},
    delegations: {},
    tasks: {},
    events: {},
    verifications: {},
    risk_evidence: {},
    interventions: {},
    receipts: {},
    evidence: {},
    anchors: {},
    cases: {},
    case_snapshots: {},
    reports: {},
    knowledge: {},
    knowledge_chunks: {},
    feedback: {},
    policies: {},
    models: {},
    idempotency: {},
    counters: {},
    activity: [],
  }
}

export function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value))
}

export class Engine {
  constructor({ settings = {}, store = null, logger = null, startedAt = nowIso() } = {}) {
    this.logger = logger
    this.startedAt = startedAt
    this.store = store
    const loaded = store ? store.load() : null
    this.state = loaded && loaded.schema_version === SCHEMA_VERSION ? loaded : createInitialState()
    // Keep startup settings authoritative for keys that are deployment scoped,
    // while previously persisted UI overrides remain in force for policy.
    this.startupSettings = normalizeSettings(settings)
    this.savePending = false
  }

  get settings() {
    const persisted = this.state && this.state.settings ? this.state.settings : {}
    return normalizeSettings({
      ...this.startupSettings,
      ...persisted,
      policy: { ...this.startupSettings.policy, ...(persisted.policy || {}) },
    })
  }

  get policy() {
    return this.settings.policy
  }

  updateSettings(patch) {
    const next = normalizeSettings({ ...this.settings, ...(patch || {}), policy: { ...this.settings.policy, ...((patch && patch.policy) || {}) } })
    this.state.settings = next
    this.state.updated_at = nowIso()
    this.save()
    return next
  }

  save() {
    this.state.updated_at = nowIso()
    this.state.event_seq = this.state.event_seq || 0
    if (this.store) this.store.save(this.state)
  }

  flush() {
    if (this.store) this.store.flush()
  }

  now() {
    return new Date()
  }

  iso(value = new Date()) {
    return naiveIso(value)
  }

  id(prefix) {
    return newId(prefix)
  }

  hash(payload, context = undefined) {
    return sha256Hex(context === undefined ? payload : { payload, context })
  }

  nextSeq(name) {
    this.state.counters = this.state.counters || {}
    this.state.counters[name] = (this.state.counters[name] || 0) + 1
    return this.state.counters[name]
  }

  collection(name) {
    if (!this.state[name] || typeof this.state[name] !== 'object') this.state[name] = {}
    return this.state[name]
  }

  require(collection, id, code, message, status = 404) {
    const record = this.collection(collection)[id]
    if (!record) fail(code, message, { status })
    return record
  }

  audit(action, actor, resourceType, resourceId, details = {}) {
    this.state.audit_seq = (this.state.audit_seq || 0) + 1
    const entry = {
      id: `audit_${this.state.audit_seq}`,
      action,
      actor: actor || this.defaultActor(),
      resource_type: resourceType,
      resource_id: resourceId,
      details: details || {},
      created_at: nowIso(),
    }
    const activity = Array.isArray(this.state.activity) ? this.state.activity : []
    activity.push(entry)
    while (activity.length > ACTIVITY_LIMIT) activity.shift()
    this.state.activity = activity
    return entry
  }

  activity(limit = 10) {
    const activity = Array.isArray(this.state.activity) ? this.state.activity : []
    return activity.slice(-Math.max(1, Math.min(limit, ACTIVITY_LIMIT))).reverse()
  }

  defaultActor() {
    return this.settings.actorDid || 'system:dsh-web'
  }

  /**
   * Idempotency recorded as `{ hash, response }`. A retry with the same body
   * replays the recorded response; a different body with the same key is a
   * conflict. GET/read routes never call this.
   */
  idempotent(key, payload, compute) {
    if (!key) return compute()
    const context = this.settings.actorDid || 'system:dsh-web'
    const hash = this.hash(payload, { actor: context })
    const store = this.collection('idempotency')
    const recorded = store[key]
    if (recorded) {
      if (recorded.hash !== hash) fail('IDEMPOTENCY_CONFLICT', 'the idempotency key was reused with a different request body', { status: 409 })
      return clone(recorded.response)
    }
    const response = compute()
    store[key] = { hash, response: clone(response), created_at: nowIso() }
    return response
  }

  counts() {
    const size = (name) => {
      const value = this.state[name]
      return value && typeof value === 'object' ? Object.keys(value).length : 0
    }
    return {
      identities: size('identities'),
      credentials: size('credentials'),
      authorizations: size('delegations'),
      tasks: size('tasks'),
      events: size('events'),
      receipts: size('receipts'),
    }
  }

  resetData() {
    const settings = clone(this.state.settings || {})
    const next = createInitialState({})
    next.settings = settings
    this.state = next
    this.save()
    return this.counts()
  }
}

/* ------------------------------------------------------------------ */
/* settings normalization / validation                                 */
/* ------------------------------------------------------------------ */

function finiteOr(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function nonEmptyString(value, fallback) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback
}

export function normalizeSettings(input = {}) {
  const policy = input.policy && typeof input.policy === 'object' ? input.policy : {}
  return {
    actorDid: nonEmptyString(input.actorDid ?? input.actor_did, DEFAULT_SETTINGS.actorDid),
    allowInterventionExecution: Boolean(input.allowInterventionExecution ?? input.allow_intervention_execution ?? DEFAULT_SETTINGS.allowInterventionExecution),
    policy: {
      policyVersion: nonEmptyString(policy.policyVersion ?? policy.policy_version, DEFAULT_POLICY.policyVersion),
      singleAmountLimit: finiteOr(policy.singleAmountLimit ?? policy.single_amount_limit, DEFAULT_POLICY.singleAmountLimit),
      dailyAmountLimit: finiteOr(policy.dailyAmountLimit ?? policy.daily_amount_limit, DEFAULT_POLICY.dailyAmountLimit),
      riskBlockThreshold: finiteOr(policy.riskBlockThreshold ?? policy.risk_block_threshold, DEFAULT_POLICY.riskBlockThreshold),
      riskDeferThreshold: finiteOr(policy.riskDeferThreshold ?? policy.risk_defer_threshold, DEFAULT_POLICY.riskDeferThreshold),
      riskThrottleThreshold: finiteOr(policy.riskThrottleThreshold ?? policy.risk_throttle_threshold, DEFAULT_POLICY.riskThrottleThreshold),
      defaultTrustScore: finiteOr(policy.defaultTrustScore ?? policy.default_trust_score, DEFAULT_POLICY.defaultTrustScore),
    },
  }
}

/**
 * Validate a browser supplied settings patch before it is persisted.
 * Throws ServiceError with VALIDATION_ERROR (422) on bad input.
 */
export function validateSettingsPatch(patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) fail('VALIDATION_ERROR', 'settings must be an object', { status: 422 })
  const allowed = new Set(['actorDid', 'allowInterventionExecution', 'policy'])
  for (const key of Object.keys(patch)) {
    if (!allowed.has(key)) fail('VALIDATION_ERROR', `unknown settings field: ${key}`, { status: 422 })
  }
  if (patch.actorDid !== undefined && (typeof patch.actorDid !== 'string' || patch.actorDid.trim().length < 3 || patch.actorDid.length > 200)) {
    fail('VALIDATION_ERROR', 'actorDid must be a string of 3-200 characters', { status: 422 })
  }
  if (patch.allowInterventionExecution !== undefined && typeof patch.allowInterventionExecution !== 'boolean') {
    fail('VALIDATION_ERROR', 'allowInterventionExecution must be a boolean', { status: 422 })
  }
  if (patch.policy !== undefined) {
    if (!patch.policy || typeof patch.policy !== 'object' || Array.isArray(patch.policy)) fail('VALIDATION_ERROR', 'policy must be an object', { status: 422 })
    const policy = patch.policy
    for (const [key, value] of Object.entries(policy)) {
      if (key === 'policyVersion') {
        if (typeof value !== 'string' || value.trim().length < 3 || value.length > 120) fail('VALIDATION_ERROR', 'policy.policyVersion must be a string of 3-120 characters', { status: 422 })
        continue
      }
      if (typeof value !== 'number' || !Number.isFinite(value)) fail('VALIDATION_ERROR', `policy.${key} must be a finite number`, { status: 422 })
      if (key === 'singleAmountLimit' || key === 'dailyAmountLimit') {
        if (value <= 0 || value > 1e12) fail('VALIDATION_ERROR', `policy.${key} must be between 0 and 1e12`, { status: 422 })
      } else if (key === 'defaultTrustScore') {
        if (value < 0 || value > 1) fail('VALIDATION_ERROR', 'policy.defaultTrustScore must be between 0 and 1', { status: 422 })
      } else if (key.startsWith('risk')) {
        if (value < 0 || value > 1) fail('VALIDATION_ERROR', `policy.${key} must be between 0 and 1`, { status: 422 })
      } else {
        fail('VALIDATION_ERROR', `unknown policy field: ${key}`, { status: 422 })
      }
    }
    const merged = normalizeSettings({ policy: { ...DEFAULT_POLICY, ...policy } }).policy
    if (!(merged.riskBlockThreshold >= merged.riskDeferThreshold && merged.riskDeferThreshold >= merged.riskThrottleThreshold)) {
      fail('VALIDATION_ERROR', 'risk thresholds must satisfy block >= defer >= throttle', { status: 422 })
    }
  }
  return patch
}

export function publicSettings(engine, extra = {}) {
  const settings = engine.settings
  return {
    actorDid: settings.actorDid,
    allowInterventionExecution: settings.allowInterventionExecution,
    policy: settings.policy,
    ...extra,
  }
}
