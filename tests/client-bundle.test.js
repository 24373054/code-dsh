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

/** Build the artifact once; every test reads the same bytes. */
let bundleText
before(() => {
  const stdout = execFileSync(process.execPath, ['scripts/build-client.mjs'], { cwd: ROOT, encoding: 'utf8' })
  assert.match(stdout, /lib\/client\.js · [\d,]+ bytes/)
  bundleText = readFileSync(BUNDLE, 'utf8')
})

/** Minimal baseline stubs; components are never rendered by these tests. */
const reactStub = {
  Fragment: Symbol('react.fragment'),
  createElement: () => null,
  useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
  useEffect: () => {},
  useCallback: (callback) => callback,
  useRef: (value) => ({ current: value }),
  useMemo: (factory) => factory()
}

const jsxRuntimeStub = {
  Fragment: Symbol('jsx.fragment'),
  jsx: () => null,
  jsxs: () => null,
  jsxDEV: () => null
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
  return { context, registrations, dictionaries, effects }
}

test('build emits the lazy-CJS handoff envelope', () => {
  assert.ok(bundleText.startsWith(EXPECTED_HEAD), 'bundle header must match the client module handoff')
  assert.ok(bundleText.endsWith(EXPECTED_TAIL), 'bundle tail must return module.exports')
  assert.equal(bundleText.includes('sourceMappingURL'), false, 'no source map trailer for a shipped half')
  assert.equal(bundleText.includes('send_money'), false, 'no payment-sending vocabulary exists in any mode')
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
  assert.deepEqual(Array.from(exports.inject), ['slots', 'locale'])
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

  assert.equal(registrations.length, 10)
})

test('overview entries ignore other packages', () => {
  const { exports } = loadBundle()
  const { context, registrations } = createClientContext()
  exports.apply(context)

  const section = registrations.find((entry) => entry.options.name === 'plugins.detail.section').component
  const badge = registrations.find((entry) => entry.options.name === 'plugins.detail.badge').component
  const otherSubject = { kind: 'bundle', pkg: { name: '@00ccf/some-other-plugin', version: '1.0.0' } }
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

test('locales cover the tool titles and shared vocabulary', () => {
  for (const key of TOOL_KEYS) assert.ok(hasCopy(`tool.${key}`), `missing English title for ${key}`)
  for (const key of ['status.ok', 'status.failed', 'status.running', 'result.waiting', 'card.raw.show']) {
    assert.ok(hasCopy(key), `missing English copy for ${key}`)
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
  const snapshot = { plugin: { name: PLUGIN_ID, mode: 'in-memory' }, counts: { identities: 3 } }
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
  assert.ok(bytes < 128 * 1024, `bundle is ${bytes} bytes, expected under 128 KiB`)
})
