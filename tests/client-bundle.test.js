/**
 * Offline contract tests for the trust-platform browser half.
 *
 * The build runs first so the assertions always describe the artifact that
 * ships. The bundle is executed in a `node:vm` sandbox that captures the
 * `window.__ModuleLoader__` handoff and supplies stubbed baseline modules, which
 * keeps the check free of a browser, a DOM, and any network access.
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import { before, test } from 'node:test'
import { dirname, resolve } from 'node:path'
import vm from 'node:vm'

import {
  COUNT_KEYS,
  PLUGIN_ID,
  decisionTone,
  formatTime,
  hasCopy,
  matchesPlugin,
  normalizeOverviewBody,
  parsePayload,
  rawPayload,
  resultSummary,
  toolDecision,
  toolState
} from '../src/client/format.js'
import { NS, en, zh } from '../src/client/locales.js'
import {
  MAX_AMOUNT,
  POLICY_NUMBER_FIELDS,
  buildSettingsPatch,
  createDraft,
  defaultExportFilename,
  describeDetails,
  exportFilenameFromDisposition,
  formatByteSize,
  isDraftDirty,
  normalizeCounts,
  normalizeHealthPayload,
  normalizeSettingsPayload,
  normalizeStoragePayload,
  requestExport,
  requestHealth,
  requestSettings,
  requestStorage,
  resetEngineData,
  saveSettings,
  totalCount,
  validateDraft
} from '../src/client/settings-data.js'

const ROOT = resolve(import.meta.dirname, '..')
const BUNDLE = resolve(ROOT, 'lib/client.js')

/** Module requests the DSH shell seeds; anything else would fail in the page. */
const BASELINE = new Set([
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  'zod',
  '@tanstack/react-virtual',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-dockkit'
])

const TOOL_KEYS = [
  'register_identity',
  'get_identity_status',
  'verify_credential',
  'check_authorization',
  'create_payment_task',
  'get_risk_decision',
  'verify_operation_event',
  'get_execution_receipt'
]

/** Head of the lazy-CJS handoff the client module system expects. */
const EXPECTED_HEAD = 'window.__ModuleLoader__.load({\n'
  + `\tid: ${JSON.stringify(PLUGIN_ID)},\n`
  + '\tfactory: (require) => {\n'
  + '\t\tvar module = { exports: {} };\n'
  + '\t\tvar exports = module.exports;'

/** Tail of the same envelope; the module exports leave through it. */
const EXPECTED_TAIL = '\t\treturn module.exports;\n\t}\n});\n'

/** One complete embedded-engine settings snapshot. */
const SAVED_SETTINGS = {
  actorDid: 'did:trust:operator',
  allowInterventionExecution: false,
  policy: {
    policyVersion: 'policy-2026-10-25-001',
    singleAmountLimit: 1000000,
    dailyAmountLimit: 5000000,
    riskBlockThreshold: 0.8,
    riskDeferThreshold: 0.6,
    riskThrottleThreshold: 0.4,
    defaultTrustScore: 0.95
  }
}

/** Build the artifact once; every test reads the same bytes. */
let bundleText
before(() => {
  const stdout = execFileSync(process.execPath, ['scripts/build-client.mjs'], { cwd: ROOT, encoding: 'utf8' })
  assert.match(stdout, /lib\/client\.js · [\d,]+ bytes/)
  bundleText = readFileSync(BUNDLE, 'utf8')
})

/** Minimal baseline stubs; JSX calls still build a tree for marker assertions. */
const reactStub = {
  Fragment: Symbol('react.fragment'),
  createElement: (type, props) => ({ type, props: props || {} }),
  useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
  useEffect: () => {},
  useCallback: (callback) => callback,
  useRef: (value) => ({ current: value }),
  useMemo: (factory) => factory(),
  createContext: (defaultValue) => ({ defaultValue, Provider: Symbol("react.provider"), Consumer: Symbol("react.consumer") }),
  useContext: () => null,
  useSyncExternalStore: (subscribe, getSnapshot) => getSnapshot(),
  useLayoutEffect: () => {}
}

const jsxRuntimeStub = {
  Fragment: Symbol('jsx.fragment'),
  jsx: (type, props) => ({ type, props: props || {} }),
  jsxs: (type, props) => ({ type, props: props || {} }),
  jsxDEV: (type, props) => ({ type, props: props || {} })
}

function requireStub(specifier) {
  switch (specifier) {
    case 'react':
      return reactStub
    case 'react/jsx-runtime':
      return jsxRuntimeStub
    case 'react-dom':
    case 'react-dom/client':
    case '@deepseek-ai/dsh-client-ui-primitives':
      return {}
    default:
      throw new Error(`unexpected require in the browser bundle: ${specifier}`)
  }
}

/**
 * Execute the built bundle in a sandbox, returning the captured handoff and the
 * exports its factory materializes.
 */
function loadBundle() {
  const handoff = { id: null, factory: null }
  const sandbox = {
    window: {
      __ModuleLoader__: {
        load(registration) {
          handoff.id = registration.id
          handoff.factory = registration.factory
        }
      }
    }
  }
  vm.runInNewContext(bundleText, sandbox, { filename: 'lib/client.js' })
  assert.equal(typeof handoff.factory, 'function', 'the bundle must register a factory')
  return { handoff, exports: handoff.factory(requireStub) }
}

/** Fake client context recording every registration the browser half makes. */
function createClientContext() {
  const registrations = []
  const dictionaries = []
  const effects = []
  const tabs = []
  const openedTabs = []
  const context = {
    effect(callback, label) {
      effects.push(label)
      const disposer = callback()
      if (typeof disposer !== 'function') throw new Error('a locale registration must return a disposer')
      return disposer
    },
    locale: {
      register(namespace, dicts) {
        dictionaries.push({ namespace, dicts })
        return () => {}
      },
      bind() {
        return (key) => key
      }
    },
    sidebarRightTabs: {
      register(definition) {
        tabs.push(definition)
        return () => {}
      }
    },
    sidebarRight: {
      openTab(kind, options) {
        openedTabs.push({ kind, options })
        return 'tab'
      }
    },
    slots: {
      inject(slotName, callback) {
        const disposer = callback()
        return typeof disposer === 'function' ? disposer : () => {}
      },
      register(options, component) {
        registrations.push({ options, component })
        return () => {}
      }
    }
  }
  return { context, registrations, dictionaries, effects, tabs, openedTabs }
}

/** Replace the global fetch for one test and always restore it. */
async function withFakeFetch(handler, run) {
  const original = globalThis.fetch
  globalThis.fetch = handler
  try {
    return await run()
  } finally {
    globalThis.fetch = original
  }
}

/** Minimal Response stand-in for the same-origin JSON routes. */
function jsonResponse(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body
  }
}

/** Collect every JSX tree node depth-first. */
function collectNodes(node, collected) {
  if (!node || typeof node !== 'object') return collected
  if (Array.isArray(node)) {
    for (const child of node) collectNodes(child, collected)
    return collected
  }
  collected.push(node)
  if (node.props) collectNodes(node.props.children, collected)
  return collected
}

test('build emits the lazy-CJS handoff envelope', () => {
  assert.ok(bundleText.startsWith(EXPECTED_HEAD), 'bundle header must match the client module handoff')
  assert.ok(bundleText.endsWith(EXPECTED_TAIL), 'bundle tail must return module.exports')
  assert.equal(bundleText.includes('sourceMappingURL'), false, 'no source map trailer for a shipped half')
  assert.equal(bundleText.includes('send_money'), false, 'no payment-sending vocabulary exists in any mode')
})

test('the bundle keeps a browser-safe URL guard for state export downloads', () => {
  // Browsers expose `URL` as a constructor (`typeof URL === 'function'`); an
  // object-only guard silently disabled the JSON export button in 0.7.0.
  assert.ok(
    bundleText.includes('typeof URL === "function"'),
    'export downloads must accept the constructor-shaped URL global'
  )
  assert.equal(
    bundleText.includes('typeof URL === "object" && URL !== null ? URL : null'),
    false,
    'the object-only URL guard always fails in browsers and must not come back'
  )
})

test('the bundle requests only shell baseline modules', () => {
  const requests = [...bundleText.matchAll(/\brequire\("([^"]+)"\)/g)].map((match) => match[1])
  assert.ok(requests.length > 0, 'the bundle imports the React runtime')
  for (const request of requests) {
    assert.ok(BASELINE.has(request), `unexpected bare require: ${request}`)
  }
  assert.deepEqual(Array.from(new Set(requests)).sort(), ['react', 'react/jsx-runtime'])
})

test('the factory hands off apply and inject', () => {
  const { handoff, exports } = loadBundle()
  assert.equal(handoff.id, PLUGIN_ID)
  assert.equal(typeof exports.apply, 'function')
  assert.ok(Array.isArray(exports.inject))
  assert.deepEqual(Array.from(exports.inject), ['slots', 'locale', 'sidebarRightTabs', 'sidebarRight'])
  assert.ok(Object.keys(exports).includes('apply'))
  assert.ok(Object.keys(exports).includes('inject'))
})

test('apply registers the eight keyed tool-call renderers', () => {
  const { exports } = loadBundle()
  const { context, registrations } = createClientContext()
  exports.apply(context)

  const toolviews = registrations.filter((entry) => entry.options.name === 'tool.call.toolview')
  assert.deepEqual(
    toolviews.map((entry) => entry.options.key).sort(),
    TOOL_KEYS.slice().sort()
  )
  for (const entry of toolviews) {
    assert.equal(entry.options.locale, NS)
    assert.equal(typeof entry.component, 'function')
  }
  assert.equal(toolviews.length, 8)
})

test('apply registers the plugin-manager overview entries', () => {
  const { exports } = loadBundle()
  const { context, registrations } = createClientContext()
  exports.apply(context)

  const section = registrations.find((entry) => entry.options.name === 'plugins.detail.section')
  assert.ok(section, 'the overview section must register')
  assert.equal(section.options.id, 'trust-platform-overview')
  assert.equal(section.options.locale, NS)
  assert.equal(typeof section.component, 'function')

  const badge = registrations.find((entry) => entry.options.name === 'plugins.detail.badge')
  assert.ok(badge, 'the package badge must register')
  assert.equal(badge.options.id, 'trust-platform-badge')
  assert.equal(badge.options.locale, NS)

  assert.equal(
    registrations.some((entry) => entry.options.name === 'main'),
    false,
    'the console must not take over the centre conversation area'
  )
  assert.equal(
    registrations.some((entry) => entry.options.name === 'sidebar.panellist'),
    false,
    'the console opens from the Session header, not the sidebar rail'
  )

  const consoleTab = registrations.find((entry) => entry.options.name === 'sidebar.right.pane.tab')
  assert.ok(consoleTab, 'the console must register a docked right-column tab body')
  assert.equal(consoleTab.options.key, PLUGIN_ID)
  assert.equal(consoleTab.options.locale, NS)
  assert.equal(typeof consoleTab.component, 'function')

  const launcher = registrations.find((entry) => entry.options.name === 'conversation.session.header.utilities')
  assert.ok(launcher, 'a Session-header entry must open the docked console')
  assert.equal(launcher.options.id, 'trust-platform-console')
  assert.equal(launcher.options.order, 20)
  assert.equal(launcher.options.locale, NS)
  assert.equal(typeof launcher.component, 'function')

  assert.equal(registrations.length, 13)
})

test('the docked console registers one right-column tab type', () => {
  const { exports } = loadBundle()
  const { context, tabs } = createClientContext()
  exports.apply(context)

  assert.equal(tabs.length, 1, 'exactly one sidebar-right tab type is registered')
  const definition = tabs[0]
  assert.equal(definition.id, PLUGIN_ID)
  assert.equal(definition.kind, 'trust-console')
  assert.equal(definition.priority, 'builtin')
  assert.equal(definition.title(), en['panel.tab'])
  assert.equal(definition.guide[0].description(), en['panel.guide'])
})

test('the Session-header launcher opens the docked console tab', () => {
  const { exports } = loadBundle()
  const { context, registrations, openedTabs } = createClientContext()
  exports.apply(context)

  const launcher = registrations.find((entry) => entry.options.name === 'conversation.session.header.utilities')
  const injected = launcher.options.inject()
  assert.equal(typeof injected.openConsole, 'function')
  injected.openConsole()
  assert.deepEqual(openedTabs, [{ kind: 'trust-console', options: undefined }])
})

test('apply registers the editable settings section', () => {
  const { exports } = loadBundle()
  const { context, registrations } = createClientContext()
  exports.apply(context)

  const entry = registrations.find((item) => item.options.name === 'settings.section')
  assert.ok(entry, 'the settings section must register')
  assert.equal(entry.options.id, 'trust-platform')
  assert.equal(entry.options.order, 55)
  assert.equal(entry.options.locale, NS)
  assert.equal(typeof entry.options.label, 'function')
  assert.equal(entry.options.label(), en['settings.nav'])
  assert.equal(typeof entry.options.inject, 'function')
  // The injected props are a fresh object from the bundle's realm; compare keys.
  assert.deepEqual(Object.keys(entry.options.inject()), [])
  assert.equal(typeof entry.component, 'function')

  // The page only needs the framework-bound `t`; rendering it offline must not throw.
  assert.doesNotThrow(() => entry.component({ t: (key) => key, close: () => {} }))
})

test('overview entries ignore other packages', () => {
  const { exports } = loadBundle()
  const { context, registrations } = createClientContext()
  exports.apply(context)

  const section = registrations.find((entry) => entry.options.name === 'plugins.detail.section').component
  const badge = registrations.find((entry) => entry.options.name === 'plugins.detail.badge').component
  const otherSubject = { kind: 'bundle', pkg: { name: '@sealwax/some-other-plugin', version: '1.0.0' } }
  assert.equal(section({ t: (key) => key, subject: otherSubject }), null)
  assert.equal(badge({ t: (key) => key, subject: otherSubject }), null)
})

test('apply registers both dictionaries under the trust-platform namespace', () => {
  const { exports } = loadBundle()
  const { context, dictionaries, effects } = createClientContext()
  exports.apply(context)

  assert.equal(dictionaries.length, 1)
  assert.equal(dictionaries[0].namespace, NS)
  assert.ok(effects.some((label) => typeof label === 'string' && label.includes('trust-platform')))
  assert.deepEqual(
    Array.from(Object.keys(dictionaries[0].dicts.en)).sort(),
    Array.from(Object.keys(dictionaries[0].dicts.zh)).sort()
  )
  assert.equal(dictionaries[0].dicts.en['overview.title'], en['overview.title'])
  assert.equal(dictionaries[0].dicts.zh['overview.title'], zh['overview.title'])
})

test('locales cover the tool titles and settings vocabulary', () => {
  for (const key of TOOL_KEYS) assert.ok(hasCopy(`tool.${key}`), `missing English title for ${key}`)
  for (const key of [
    'status.ok',
    'status.failed',
    'status.running',
    'result.waiting',
    'card.raw.show',
    'overview.mode.embedded',
    'overview.mode.sandbox',
    'settings.nav',
    'settings.title',
    'settings.mode.embedded',
    'settings.mode.sandbox',
    'settings.dataDir',
    'settings.form.title',
    'settings.field.actorDid',
    'settings.field.allowInterventionExecution',
    'settings.field.policyVersion',
    'settings.hint.amount',
    'settings.hint.ratio',
    'settings.action.save',
    'settings.action.cancel',
    'settings.action.applyDefaults',
    'settings.action.reset',
    'settings.action.confirmReset',
    'settings.reset.title',
    'settings.reset.confirm',
    'settings.feedback.saved',
    'settings.feedback.reset',
    'settings.error.actorDid',
    'settings.error.amount',
    'settings.error.ratio',
    'settings.error.thresholds',
    'settings.error.validation',
    'settings.error.stale',
    'settings.storage.title',
    'settings.storage.description',
    'settings.storage.dataDir',
    'settings.storage.stateFile',
    'settings.storage.fileSize',
    'settings.storage.exists',
    'settings.storage.lastSavedAt',
    'settings.storage.schemaVersion',
    'settings.storage.recovery',
    'settings.storage.recoveryClean',
    'settings.storage.recoveryDetected',
    'settings.storage.backupPath',
    'settings.storage.writeError',
    'settings.storage.loading',
    'settings.storage.refresh',
    'settings.action.export',
    'settings.action.exporting',
    'settings.reset.confirmInput',
    'settings.feedback.exported',
    'settings.error.export'
  ]) {
    assert.ok(hasCopy(key), `missing English copy for ${key}`)
  }
  for (const field of POLICY_NUMBER_FIELDS) {
    assert.ok(hasCopy(`settings.field.${field}`), `missing English label for ${field}`)
  }
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zh).sort(), 'zh and en must stay key-identical')
  for (const [key, value] of Object.entries(zh)) {
    assert.equal(typeof value, 'string', `zh[${key}] must be a string`)
    assert.ok(value.length > 0, `zh[${key}] must not be empty`)
  }
})

test('format helpers interpret the canonical result envelope', () => {
  const okBlock = {
    content: [{ type: 'text', text: JSON.stringify({ ok: true, decision: 'ALLOW', code: 'TRUST_OK', message: 'Identity admitted' }) }],
    isError: false
  }
  const failedBlock = {
    content: [{ type: 'text', text: JSON.stringify({ ok: false, code: 'TRUST_NOT_FOUND', message: 'No identity', decision: 'DEFER' }) }],
    isError: false
  }
  const textBlock = { content: [{ type: 'text', text: 'upstream exploded' }], isError: false }

  assert.equal(toolState('preparing', null), 'running')
  assert.equal(toolState('result', okBlock), 'ok')
  assert.equal(toolState('result', failedBlock), 'failed')
  assert.equal(toolState('result', { content: [], isError: true }), 'failed')

  assert.equal(toolDecision(okBlock), 'ALLOW')
  assert.equal(toolDecision(textBlock), null)
  assert.equal(decisionTone('ALLOW'), 'ok')
  assert.equal(decisionTone('DENY'), 'failed')
  assert.equal(decisionTone('STEP_UP'), 'warn')
  assert.equal(decisionTone('WHATEVER'), 'neutral')

  assert.equal(resultSummary(okBlock, (key) => key), 'TRUST_OK · Identity admitted')
  assert.equal(resultSummary(failedBlock, (key) => key), 'TRUST_NOT_FOUND · No identity')
  assert.equal(resultSummary(textBlock, (key) => key), 'upstream exploded')
  assert.equal(resultSummary({ content: [], isError: false }, (key) => key), 'No result payload.')

  const parsed = parsePayload(okBlock)
  assert.equal(parsed.parsed, true)
  assert.equal(parsed.value.decision, 'ALLOW')
  assert.equal(parsePayload(textBlock).parsed, false)
  assert.match(rawPayload(okBlock), /"decision": "ALLOW"/)

  assert.equal(formatTime('not-a-date'), 'not-a-date')
  assert.equal(formatTime(undefined), null)
  assert.equal(typeof formatTime(Date.now()), 'string')
})

test('settings payload normalizers tolerate partial host data', () => {
  const normalized = normalizeSettingsPayload({
    ok: true,
    mode: 'embedded',
    dataDir: 'C:/trust-data',
    settings: SAVED_SETTINGS,
    defaults: SAVED_SETTINGS,
    editable: { actorDid: true, allowInterventionExecution: false, policy: { singleAmountLimit: true } }
  })
  assert.equal(normalized.mode, 'embedded')
  assert.equal(normalized.dataDir, 'C:/trust-data')
  assert.deepEqual(normalized.settings, SAVED_SETTINGS)
  assert.deepEqual(normalized.defaults, SAVED_SETTINGS)
  assert.equal(normalized.editable.actorDid, true)
  assert.equal(normalized.editable.allowInterventionExecution, false)
  assert.equal(normalized.editable.policy.singleAmountLimit, true)
  // Anything the Host did not lock stays editable by default.
  assert.equal(normalized.editable.policy.dailyAmountLimit, true)
  assert.equal(normalized.editable.policy.policyVersion, true)

  assert.equal(normalizeSettingsPayload(null), null)
  assert.equal(normalizeSettingsPayload('status'), null)
  const empty = normalizeSettingsPayload({})
  assert.equal(empty.mode, null)
  assert.equal(empty.settings.actorDid, null)
  assert.equal(empty.settings.policy.singleAmountLimit, null)

  assert.deepEqual(normalizeHealthPayload({
    ok: true,
    status: 'ok',
    mode: 'embedded',
    engine: 'embedded',
    schema_revision: 'embedded-1',
    started_at: '2026-10-27T00:00:00.000Z'
  }), {
    status: 'ok',
    mode: 'embedded',
    engine: 'embedded',
    schemaRevision: 'embedded-1',
    startedAt: '2026-10-27T00:00:00.000Z'
  })
  assert.deepEqual(normalizeHealthPayload({}), {
    status: null,
    mode: null,
    engine: null,
    schemaRevision: null,
    startedAt: null
  })

  assert.deepEqual(normalizeCounts({ identities: 2, credentials: 3 }), {
    identities: 2,
    credentials: 3,
    authorizations: null,
    tasks: null,
    events: null,
    receipts: null
  })
})

test('storage normalizers and export helpers are display-safe', () => {
  const normalized = normalizeStoragePayload({
    ok: true,
    mode: 'embedded',
    storage: {
      data_dir: 'C:/trust-data',
      state_file: 'C:/trust-data/state.json',
      exists: true,
      file_size_bytes: 2048,
      last_saved_at: '2026-10-27T00:00:00.000Z',
      schema_version: 'embedded-1',
      recovery: {
        kind: 'restored',
        backupPath: 'C:/trust-data/state.json.bak',
        occurred_at: '2026-10-27T00:00:01.000Z'
      },
      write_error: { code: 'ENOSPC', message: 'disk full', at: '2026-10-27T00:00:02.000Z' }
    }
  })
  assert.equal(normalized.dataDir, 'C:/trust-data')
  assert.equal(normalized.stateFile, 'C:/trust-data/state.json')
  assert.equal(normalized.exists, true)
  assert.equal(normalized.fileSizeBytes, 2048)
  assert.equal(normalized.recovery.kind, 'restored')
  assert.equal(normalized.recovery.backupPath, 'C:/trust-data/state.json.bak')
  assert.equal(normalized.recovery.occurredAt, '2026-10-27T00:00:01.000Z')
  assert.equal(normalized.writeError.code, 'ENOSPC')
  assert.equal(normalized.writeError.message, 'disk full')
  assert.equal(normalized.writeError.at, '2026-10-27T00:00:02.000Z')
  assert.equal(normalizeStoragePayload(null), null)
  assert.equal(normalizeStoragePayload('state'), null)
  assert.equal(normalizeStoragePayload({ file_size_bytes: -1, data_dir: 7 }).fileSizeBytes, null)
  assert.equal(normalizeStoragePayload({}).exists, null)
  assert.equal(normalizeStoragePayload({ storage: { recovery: null, write_error: null } }).recovery, null)
  assert.equal(normalizeStoragePayload({ data_dir: 'flat-shape' }).dataDir, 'flat-shape')

  assert.equal(formatByteSize(512), '512 B')
  assert.equal(formatByteSize(2048), '2.0 KiB')
  assert.equal(formatByteSize(1024 * 1024), '1.0 MiB')
  assert.equal(formatByteSize(1024 * 1024 * 1024), '1.00 GiB')
  assert.equal(formatByteSize(-1), null)
  assert.equal(formatByteSize('nope'), null)

  assert.equal(
    exportFilenameFromDisposition('attachment; filename="trust-platform-state-20261027-000000.json"'),
    'trust-platform-state-20261027-000000.json'
  )
  assert.equal(exportFilenameFromDisposition('attachment; filename=state.json'), 'state.json')
  assert.equal(exportFilenameFromDisposition('attachment'), null)
  assert.equal(exportFilenameFromDisposition(null), null)
  assert.equal(
    defaultExportFilename(new Date('2026-10-27T00:00:00.000Z')),
    'trust-platform-state-20261027-000000.json'
  )
})

test('storage and export transports map every outcome onto typed errors', async () => {
  const calls = []
  const storageOutcome = await withFakeFetch(async (url, init) => {
    calls.push({ url, init })
    return jsonResponse(200, {
      ok: true,
      mode: 'embedded',
      storage: {
        data_dir: 'C:/trust-data',
        state_file: 'state.json',
        exists: false,
        file_size_bytes: 0,
        schema_version: 'embedded-1'
      }
    })
  }, () => requestStorage())
  assert.equal(calls[0].url, '/trust-platform/api/storage')
  assert.equal(calls[0].init.method, 'GET')
  assert.equal(calls[0].init.credentials, 'same-origin')
  assert.equal(storageOutcome.data.dataDir, 'C:/trust-data')
  assert.equal(storageOutcome.data.exists, false)

  const missingStorage = await withFakeFetch(async () => jsonResponse(503, {}), () => requestStorage())
  assert.equal(missingStorage.error.kind, 'http')
  assert.equal(missingStorage.error.status, 503)

  const exportCalls = []
  const exportOutcome = await withFakeFetch(async (url, init) => {
    exportCalls.push({ url, init })
    return {
      status: 200,
      ok: true,
      headers: {
        get(name) {
          return name === 'content-disposition'
            ? 'attachment; filename="trust-platform-state-2026-10-27.json"'
            : null
        }
      },
      text: async () => JSON.stringify({
        ok: true,
        exported_at: '2026-10-27T00:00:00.000Z',
        version: 1,
        schema_version: 'embedded-1',
        state: { identities: [] }
      })
    }
  }, () => requestExport())
  assert.equal(exportCalls[0].url, '/trust-platform/api/export')
  assert.equal(exportCalls[0].init.method, 'GET')
  assert.equal(exportCalls[0].init.credentials, 'same-origin')
  assert.equal(exportOutcome.data.filename, 'trust-platform-state-2026-10-27.json')
  assert.match(exportOutcome.data.text, /"version":1/)
  assert.match(exportOutcome.data.text, /"ok":true/)

  const unavailableExport = await withFakeFetch(async () => jsonResponse(404, {}), () => requestExport())
  assert.equal(unavailableExport.error.kind, 'unavailable')
  const cappedExport = await withFakeFetch(async () => jsonResponse(413, {}), () => requestExport())
  assert.equal(cappedExport.error.kind, 'http')
  assert.equal(cappedExport.error.status, 413)
  const malformedExport = await withFakeFetch(async () => ({
    status: 200,
    ok: true,
    headers: { get: () => null },
    text: async () => '<html>not json</html>'
  }), () => requestExport())
  assert.equal(malformedExport.error.kind, 'invalid')
  const unwrappedExport = await withFakeFetch(async () => ({
    status: 200,
    ok: true,
    headers: { get: () => null },
    text: async () => JSON.stringify({ version: 1, state: {} })
  }), () => requestExport())
  assert.equal(unwrappedExport.error.kind, 'invalid')
  const emptyExport = await withFakeFetch(async () => ({
    status: 200,
    ok: true,
    headers: { get: () => null },
    text: async () => ''
  }), () => requestExport())
  assert.equal(emptyExport.error.kind, 'invalid')

  const original = globalThis.fetch
  globalThis.fetch = undefined
  try {
    const noFetchStorage = await requestStorage()
    assert.equal(noFetchStorage.error.kind, 'unavailable')
    const noFetchExport = await requestExport()
    assert.equal(noFetchExport.error.kind, 'unavailable')
  } finally {
    globalThis.fetch = original
  }
})

test('settings draft builds a minimal patch and validates engine ranges', () => {
  assert.equal(MAX_AMOUNT, 1000000000000)
  assert.deepEqual(Array.from(POLICY_NUMBER_FIELDS), [
    'singleAmountLimit',
    'dailyAmountLimit',
    'riskBlockThreshold',
    'riskDeferThreshold',
    'riskThrottleThreshold',
    'defaultTrustScore'
  ])

  const draft = createDraft(SAVED_SETTINGS)
  assert.equal(draft.actorDid, 'did:trust:operator')
  assert.equal(draft.allowInterventionExecution, false)
  assert.equal(draft.policyVersion, 'policy-2026-10-25-001')
  assert.equal(draft.singleAmountLimit, '1000000')
  assert.equal(draft.riskBlockThreshold, '0.8')
  assert.equal(createDraft(null), null)

  assert.equal(buildSettingsPatch(draft, SAVED_SETTINGS), null)
  assert.equal(isDraftDirty(draft, SAVED_SETTINGS), false)
  assert.deepEqual(validateDraft(draft), [])

  const changed = { ...draft, actorDid: 'did:trust:next-agent', riskBlockThreshold: '0.9' }
  assert.deepEqual(buildSettingsPatch(changed, SAVED_SETTINGS), {
    actorDid: 'did:trust:next-agent',
    policy: { riskBlockThreshold: 0.9 }
  })
  assert.equal(isDraftDirty(changed, SAVED_SETTINGS), true)
  assert.equal(buildSettingsPatch({ ...draft, singleAmountLimit: 'not-a-number' }, SAVED_SETTINGS), null)

  assert.deepEqual(validateDraft({ ...draft, actorDid: 'x' }), [{ key: 'settings.error.actorDid' }])
  assert.deepEqual(validateDraft({ ...draft, policyVersion: 'ab' }), [{ key: 'settings.error.policyVersion' }])
  assert.deepEqual(validateDraft({ ...draft, singleAmountLimit: '0' }), [
    { key: 'settings.error.amount', params: { field: 'singleAmountLimit' } }
  ])
  assert.deepEqual(validateDraft({ ...draft, riskBlockThreshold: '1.5' }), [
    { key: 'settings.error.ratio', params: { field: 'riskBlockThreshold' } }
  ])
  assert.deepEqual(validateDraft({ ...draft, defaultTrustScore: '' }), [
    { key: 'settings.error.number', params: { field: 'defaultTrustScore' } }
  ])
  assert.deepEqual(validateDraft({ ...draft, riskBlockThreshold: '0.3' }), [
    { key: 'settings.error.thresholds' }
  ])
  assert.deepEqual(validateDraft(null), [{ key: 'settings.error.invalidDraft' }])

  assert.equal(totalCount({ identities: 1, credentials: 2, authorizations: 3, tasks: 4, events: 5, receipts: 6 }), 21)
  assert.equal(totalCount({ identities: 2 }), 2)
  assert.equal(describeDetails(null), null)
  assert.equal(describeDetails('risk thresholds invalid'), 'risk thresholds invalid')
  assert.equal(describeDetails({ field: 'riskBlockThreshold' }), '{"field":"riskBlockThreshold"}')
  assert.ok(describeDetails({ reason: 'x'.repeat(300) }).length <= 200)
})

test('settings transport maps every outcome onto typed errors', async () => {
  const calls = []
  const settingsOutcome = await withFakeFetch(async (url, init) => {
    calls.push({ url, init })
    return jsonResponse(200, {
      ok: true,
      mode: 'embedded',
      dataDir: 'C:/trust-data',
      settings: SAVED_SETTINGS,
      defaults: SAVED_SETTINGS,
      editable: {}
    })
  }, () => requestSettings())
  assert.equal(calls[0].url, '/trust-platform/api/settings')
  assert.equal(calls[0].init.method, 'GET')
  assert.equal(calls[0].init.credentials, 'same-origin')
  assert.equal(settingsOutcome.data.mode, 'embedded')
  assert.equal(settingsOutcome.data.settings.actorDid, 'did:trust:operator')

  const healthOutcome = await withFakeFetch(async () => jsonResponse(200, {
    ok: true,
    status: 'ok',
    mode: 'embedded',
    engine: 'embedded',
    schema_revision: 'embedded-1',
    started_at: '2026-10-27T00:00:00.000Z'
  }), () => requestHealth())
  assert.equal(healthOutcome.data.status, 'ok')
  assert.equal(healthOutcome.data.schemaRevision, 'embedded-1')

  const rejected = await withFakeFetch(async () => jsonResponse(422, {
    ok: false,
    error_code: 'VALIDATION_ERROR',
    message: 'risk thresholds must satisfy block >= defer >= throttle',
    details: { field: 'riskBlockThreshold' }
  }), () => saveSettings({ policy: { riskBlockThreshold: 0.9 } }))
  assert.equal(rejected.error.kind, 'validation')
  assert.equal(rejected.error.message, 'risk thresholds must satisfy block >= defer >= throttle')
  assert.deepEqual(rejected.error.details, { field: 'riskBlockThreshold' })

  const forbidden = await withFakeFetch(async () => jsonResponse(403, {}), () => requestSettings())
  assert.equal(forbidden.error.kind, 'forbidden')
  const missing = await withFakeFetch(async () => jsonResponse(404, {}), () => requestSettings())
  assert.equal(missing.error.kind, 'unavailable')
  const serverError = await withFakeFetch(async () => jsonResponse(500, {}), () => requestSettings())
  assert.equal(serverError.error.kind, 'http')
  assert.equal(serverError.error.status, 500)
  const offline = await withFakeFetch(async () => {
    throw new TypeError('network unreachable')
  }, () => requestSettings())
  assert.equal(offline.error.kind, 'network')
  assert.equal(offline.error.message, 'network unreachable')
  const aborted = await withFakeFetch(async () => {
    throw Object.assign(new Error('aborted'), { name: 'AbortError' })
  }, () => requestSettings())
  assert.equal(aborted.aborted, true)

  const sawBody = []
  const saved = await withFakeFetch(async (url, init) => {
    sawBody.push({ method: init.method, body: JSON.parse(init.body) })
    return jsonResponse(200, {
      ok: true,
      settings: SAVED_SETTINGS,
      saved_at: '2026-10-27T00:00:00.000Z'
    })
  }, () => saveSettings({ actorDid: 'did:trust:next-agent' }))
  assert.equal(sawBody[0].method, 'PUT')
  assert.deepEqual(sawBody[0].body, { actorDid: 'did:trust:next-agent' })
  assert.equal(saved.data.savedAt, '2026-10-27T00:00:00.000Z')

  const resetBodies = []
  const reset = await withFakeFetch(async (url, init) => {
    resetBodies.push({ url, method: init.method, body: JSON.parse(init.body) })
    return jsonResponse(200, { ok: true, counts: { identities: 1, credentials: 2 } })
  }, () => resetEngineData())
  assert.equal(resetBodies[0].url, '/trust-platform/api/reset')
  assert.equal(resetBodies[0].method, 'POST')
  assert.deepEqual(resetBodies[0].body, { confirm: true })
  assert.equal(reset.data.counts.identities, 1)

  const original = globalThis.fetch
  globalThis.fetch = undefined
  try {
    const noFetch = await requestSettings()
    assert.equal(noFetch.error.kind, 'unavailable')
  } finally {
    globalThis.fetch = original
  }
})

test('the settings page exposes screenshot-safe data markers', () => {
  const { exports } = loadBundle()
  const { context, registrations } = createClientContext()
  exports.apply(context)

  const component = registrations.find((entry) => entry.options.name === 'settings.section').component
  const tree = component({ t: (key) => key, close: () => {} })
  const nodes = collectNodes(tree, [])
  const root = nodes.find((node) => node.props && node.props['data-trust-settings'] === 'trust-platform')
  assert.ok(root, 'the settings page root must carry data-trust-settings')
  assert.equal(root.props['data-trust-state'], 'loading')

  const source = readFileSync(resolve(ROOT, 'src/client/settings.jsx'), 'utf8')
  for (const marker of [
    'data-trust-state={stateName}',
    'data-trust-form="settings"',
    'data-trust-field="actorDid"',
    'data-trust-field="allowInterventionExecution"',
    'data-trust-field="policyVersion"',
    'data-trust-policy="policyVersion"',
    'data-trust-policy={field}',
    'data-trust-action="save"',
    'data-trust-action="cancel"',
    'data-trust-action="apply-defaults"',
    'data-trust-action="refresh-storage"',
    'data-trust-action="export-data"',
    'data-trust-action="reset"',
    'data-trust-storage="card"',
    'data-trust-confirm="reset"',
    'data-trust-reset-input="confirm"',
    'data-trust-feedback='
  ]) {
    assert.ok(source.includes(marker), `missing settings marker: ${marker}`)
  }

  // The data-management card renders before the first storage refresh resolves,
  // so Playwright can wait on a stable loading marker.
  const storageCard = nodes.find((node) => node.props && node.props['data-trust-storage'] === 'card')
  assert.ok(storageCard, 'the storage card must render while the page loads')
  assert.equal(storageCard.props['data-trust-storage-state'], 'loading')
  assert.ok(source.includes('data-trust-storage-state={storageState}'), 'the card must publish its state')
})

test('the package ships localized plugin metadata', () => {
  const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'))
  assert.ok(pkg.exports['./locale/*.json'], 'package exports must expose the locale files')
  assert.ok(pkg.files.some((entry) => entry === 'locale/*.json' || entry === 'locale'), 'locale files must ship')

  const enMeta = JSON.parse(readFileSync(resolve(ROOT, 'locale/en.json'), 'utf8'))
  const zhMeta = JSON.parse(readFileSync(resolve(ROOT, 'locale/zh.json'), 'utf8'))
  assert.equal(enMeta.meta.detail, 'docs/DETAIL.md')
  assert.equal(zhMeta.meta.detail, 'docs/DETAIL.zh.md')
  assert.deepEqual(Object.keys(enMeta.meta).sort(), Object.keys(zhMeta.meta).sort())
  assert.ok(enMeta.meta.title.length > 0)
  assert.ok(zhMeta.meta.title.length > 0)
  assert.ok(enMeta.meta.description.length > 0)
  assert.match(enMeta.meta.description, /[.!?]$/)
  assert.match(zhMeta.meta.description, /[。！？]$/)
  assert.ok(statSync(resolve(ROOT, enMeta.meta.detail)).isFile(), 'the English detail page must exist')
  assert.ok(statSync(resolve(ROOT, zhMeta.meta.detail)).isFile(), 'the Chinese detail page must exist')
})

test('docs describe the embedded engine and start with a preview', () => {
  const readme = readFileSync(resolve(ROOT, 'README.md'), 'utf8')
  assert.match(readme, /embedded/i)
  const englishDetail = readFileSync(resolve(ROOT, 'docs/DETAIL.md'), 'utf8')
  const chineseDetail = readFileSync(resolve(ROOT, 'docs/DETAIL.zh.md'), 'utf8')
  const englishFirstLine = englishDetail.split(/\r?\n/, 1)[0]
  const chineseFirstLine = chineseDetail.split(/\r?\n/, 1)[0]
  assert.ok(englishFirstLine.startsWith('!['), 'DETAIL.md must start with the preview image')
  assert.ok(englishFirstLine.includes('preview.svg'), 'DETAIL.md preview must reference preview.svg')
  assert.ok(chineseFirstLine.startsWith('!['), 'DETAIL.zh.md must start with the preview image')
  assert.ok(chineseFirstLine.includes('preview.zh.svg'), 'DETAIL.zh.md preview must reference preview.zh.svg')
  assert.match(chineseDetail, /[\u4e00-\u9fff]/, 'DETAIL.zh.md must be written in Chinese')
  assert.match(readme, /## Release notes/, 'the README must carry a release-note section')
  assert.match(readme, /0\.7\.0/, 'the README must announce 0.7.0')
  assert.match(englishDetail, /0\.7\.0/, 'DETAIL.md must describe the 0.7.0 changes')
  assert.match(chineseDetail, /0\.7\.0/, 'DETAIL.zh.md must describe the 0.7.0 changes')
  assert.match(englishDetail, /Data (management|and backup)/i, 'DETAIL.md must document data management')
  assert.match(chineseDetail, /数据与备份|数据管理/, 'DETAIL.zh.md must document data management')
})

test('matchesPlugin recognizes every plugin-manager subject shape', () => {
  assert.equal(matchesPlugin({ kind: 'bundle', pkg: { name: PLUGIN_ID } }), true)
  assert.equal(matchesPlugin({ kind: 'row', pkg: { name: PLUGIN_ID }, row: { name: 'row' } }), true)
  assert.equal(matchesPlugin({ kind: 'item', id: PLUGIN_ID }), true)
  assert.equal(matchesPlugin({ kind: 'bundle', pkg: { name: 'dsh-better-sidebar' } }), false)
  assert.equal(matchesPlugin(undefined), false)
  assert.equal(matchesPlugin(null), false)
  assert.equal(COUNT_KEYS.length, 6)
})

test('overview responses are accepted flattened or wrapped', () => {
  const snapshot = { plugin: { name: PLUGIN_ID, mode: 'embedded' }, counts: { identities: 3 } }
  assert.equal(normalizeOverviewBody({ ok: true, overview: snapshot }), snapshot)
  const flat = normalizeOverviewBody({ ok: true, ...snapshot })
  assert.equal(flat.counts.identities, 3)
  assert.equal(flat.plugin.name, PLUGIN_ID)
  assert.equal(normalizeOverviewBody(null), null)
  assert.equal(normalizeOverviewBody('nope'), null)
})

test('the artifact respects the size budget', () => {
  const bytes = statSync(BUNDLE).size
  assert.ok(bytes > 0)
  assert.ok(bytes < 512 * 1024, `bundle is ${bytes} bytes, expected under 512 KiB`)
})
