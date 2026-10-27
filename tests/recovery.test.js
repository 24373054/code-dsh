/**
 * Persistence recovery for the embedded trust plane.
 *
 * A crashed writer, a truncated file or a state file written by a newer schema
 * must never prevent the plugin from starting. The store backs up the damaged
 * payload, exposes what happened through `describe()` and the engine continues
 * with a fresh state that can be written normally.
 */
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { after, test } from 'node:test'

import { Engine, FileStore, MemoryStore } from '../src/engine/core.js'
import { createTrustPlane } from '../src/engine/index.js'

const TMP_BASE = fileURLToPath(new URL('../../tmp', import.meta.url))
const DIRS = []

function tempDir() {
  mkdirSync(TMP_BASE, { recursive: true })
  const dir = mkdtempSync(join(TMP_BASE, 'recovery-'))
  DIRS.push(dir)
  return dir
}

function statePath(dir) {
  return join(dir, 'state.json')
}

function writeState(dir, payload) {
  writeFileSync(statePath(dir), typeof payload === 'string' ? payload : JSON.stringify(payload), 'utf8')
}

function startPlane(dir, settings = {}) {
  return createTrustPlane({ settings, store: new FileStore(dir), logger: null })
}

after(() => {
  for (const dir of DIRS) rmSync(dir, { recursive: true, force: true })
})

test('corrupted JSON is backed up and the engine still starts with empty state', () => {
  const dir = tempDir()
  const damaged = '{ "schema_version": 1, "identities": {'
  writeState(dir, damaged)

  const store = new FileStore(dir)
  const engine = new Engine({ store, logger: null })

  assert.equal(store.recovery.kind, 'corrupt')
  assert.ok(store.recovery.backupPath, 'corrupt file must be backed up')
  assert.ok(store.recovery.backupPath.startsWith(`${statePath(dir)}.corrupt-`))
  assert.equal(readFileSync(store.recovery.backupPath, 'utf8'), damaged)
  assert.equal(typeof store.recovery.occurred_at, 'string')
  assert.ok(!Number.isNaN(Date.parse(store.recovery.occurred_at)))

  assert.equal(engine.state.schema_version, 1)
  assert.deepEqual(engine.state.identities, {})
  assert.deepEqual(engine.state.idempotency, {})
  assert.deepEqual(engine.state.counters, {})
  assert.deepEqual(engine.state.activity, [])
  assert.equal(engine.counts().identities, 0)
  assert.equal(engine.settings.actorDid, 'system:dsh-web')

  // The engine is still writable: the next save replaces the damaged file.
  engine.save()
  assert.equal(engine.flush(), true)
  assert.equal(store.write_error, null)
  assert.equal(JSON.parse(readFileSync(statePath(dir), 'utf8')).schema_version, 1)

  const reloaded = new Engine({ store: new FileStore(dir), logger: null })
  assert.equal(reloaded.state.schema_version, 1)
  assert.deepEqual(reloaded.state.identities, {})
  assert.equal(store.describe().recovery.kind, 'corrupt')
})

test('a future schema version is backed up, ignored and replaced on the next save', () => {
  const dir = tempDir()
  const future = { schema_version: 999, settings: { actorDid: 'system:future' }, identities: { 'did:trust:x:y': { did: 'did:trust:x:y' } } }
  writeState(dir, future)

  const store = new FileStore(dir)
  const plane = createTrustPlane({ store, logger: null })

  assert.equal(store.recovery.kind, 'future-schema')
  assert.ok(existsSync(store.recovery.backupPath))
  assert.deepEqual(JSON.parse(readFileSync(store.recovery.backupPath, 'utf8')), future)
  assert.equal(plane.engine.state.schema_version, 1)
  assert.equal(plane.counts().identities, 0)
  assert.equal(plane.engine.settings.actorDid, 'system:dsh-web')

  const registered = plane.identity.registerDid({ domain_id: 'alpha', subject_id: 'after-future', display_name: 'After Future' })
  assert.match(registered.did, /^did:trust:alpha:/)
  assert.equal(plane.engine.flush(), true)

  const reloaded = createTrustPlane({ store: new FileStore(dir), logger: null })
  assert.equal(reloaded.engine.state.identities[registered.did].status, 'ACTIVE')
  assert.equal(reloaded.engine.state.schema_version, 1)
})

test('invalid top-level shapes recover instead of crashing startup', () => {
  const cases = [
    ['JSON array payload', '[]'],
    ['JSON null payload', 'null'],
    ['JSON scalar payload', '42'],
    ['string schema version', { schema_version: '1' }],
    ['missing schema version', { settings: {} }],
    ['collection persisted as an array', { schema_version: 1, identities: [] }],
    ['activity persisted as an object', { schema_version: 1, activity: {} }],
    ['settings persisted as an array', { schema_version: 1, settings: [] }],
  ]

  for (const [label, payload] of cases) {
    const dir = tempDir()
    writeState(dir, payload)
    const plane = startPlane(dir)

    assert.equal(plane.engine.store.recovery.kind, 'invalid-shape', label)
    assert.ok(existsSync(plane.engine.store.recovery.backupPath), label)
    assert.equal(plane.engine.state.schema_version, 1, label)
    assert.equal(plane.counts().identities, 0, label)
    assert.equal(plane.engine.settings.actorDid, 'system:dsh-web', label)
  }
})

test('describe() reports storage metadata without throwing', () => {
  const dir = tempDir()
  const store = new FileStore(dir)
  const engine = new Engine({ store, logger: null })

  const empty = store.describe()
  assert.equal(empty.data_dir, dir)
  assert.equal(empty.state_file, statePath(dir))
  assert.equal(empty.schema_version, 1)
  assert.equal(empty.exists, false)
  assert.equal(empty.file_size_bytes, 0)
  assert.equal(empty.last_saved_at, null)
  assert.equal(empty.recovery, null)
  assert.equal(empty.write_error, null)

  engine.save()
  assert.equal(engine.flush(), true)
  const saved = store.describe()
  assert.equal(saved.exists, true)
  assert.equal(saved.schema_version, 1)
  assert.equal(saved.file_size_bytes, statSync(statePath(dir)).size)
  assert.ok(saved.file_size_bytes > 0)
  assert.ok(!Number.isNaN(Date.parse(saved.last_saved_at)))
  assert.equal(saved.recovery, null)
  assert.equal(saved.write_error, null)

  // An absent nested data directory is reported, not thrown.
  const absent = new FileStore(join(dir, 'missing', 'nested'))
  const absentInfo = absent.describe()
  assert.equal(absentInfo.exists, false)
  assert.equal(absentInfo.data_dir, join(dir, 'missing', 'nested'))
  assert.equal(absentInfo.last_saved_at, null)

  // An in-memory store exposes the same metadata shape for the settings panel.
  const memory = new MemoryStore()
  assert.deepEqual(memory.describe(), {
    data_dir: null,
    state_file: null,
    schema_version: 1,
    exists: false,
    file_size_bytes: 0,
    last_saved_at: null,
    recovery: null,
    write_error: null,
  })

  // describe() keeps reporting a recovery after the file was replaced.
  const corruptDir = tempDir()
  writeState(corruptDir, 'definitely not json')
  const corruptStore = new FileStore(corruptDir)
  new Engine({ store: corruptStore, logger: null })
  const corruptInfo = corruptStore.describe()
  assert.equal(corruptInfo.exists, true)
  assert.equal(corruptInfo.recovery.kind, 'corrupt')
  assert.ok(corruptInfo.file_size_bytes > 0)
})

test('atomic write failure keeps the previous state file and records write_error', () => {
  const dir = tempDir()
  const store = new FileStore(dir)
  const engine = new Engine({ store, logger: null })

  engine.save()
  assert.equal(engine.flush(), true)
  const previous = readFileSync(statePath(dir), 'utf8')

  // Point the store at a file path whose parent is a regular file: the atomic
  // write cannot create the temp file or rename over the state file.
  const blocker = join(dir, 'blocker')
  writeFileSync(blocker, 'not a directory', 'utf8')
  const originalFile = store.file
  store.file = join(blocker, 'state.json')

  engine.save()
  assert.equal(store.flush(), false)
  assert.equal(store.write_error.code, 'STATE_WRITE_FAILED')
  assert.equal(typeof store.write_error.message, 'string')
  assert.ok(store.write_error.message.length > 0)
  assert.ok(!Number.isNaN(Date.parse(store.write_error.at)))
  assert.equal(store.pending, engine.state, 'failed writes keep the pending state for retry')
  assert.equal(readFileSync(originalFile, 'utf8'), previous, 'previous state file must be intact')
  assert.equal(store.describe().write_error.code, 'STATE_WRITE_FAILED')
  assert.equal(engine.state.schema_version, 1)
  assert.equal(engine.settings.actorDid, 'system:dsh-web')
  assert.equal(store.timer, null)

  // Restoring the path and flushing again retries the retained pending state.
  store.file = originalFile
  assert.equal(store.flush(), true)
  assert.equal(store.write_error, null)
  assert.equal(store.pending, null)
  assert.equal(store.timer, null)
  assert.ok(!Number.isNaN(Date.parse(store.lastSavedAt)))
  assert.equal(JSON.parse(readFileSync(statePath(dir), 'utf8')).schema_version, 1)
  assert.equal(store.describe().write_error, null)
})

test('flush() is safe when nothing is dirty and never leaves a timer behind', () => {
  const dir = tempDir()
  const store = new FileStore(dir)
  const engine = new Engine({ store, logger: null })

  assert.equal(engine.flush(), false)
  assert.equal(store.timer, null)

  engine.save()
  assert.equal(engine.flush(), true)
  assert.equal(store.timer, null)
  assert.equal(engine.flush(), false)
  assert.equal(store.timer, null)

  const persisted = JSON.parse(readFileSync(statePath(dir), 'utf8'))
  assert.equal(persisted.schema_version, 1)
  assert.ok(typeof persisted.updated_at === 'string')
})
