#!/usr/bin/env node
/**
 * Build the trust-platform browser half into `lib/client.js`.
 *
 * The DSH client module system serves a package's `./client` export as a
 * lazy-CJS artifact: executing the file only registers a factory under
 * `window.__ModuleLoader__`, and the factory materializes the module on first
 * use. esbuild emits the CommonJS body; this script wraps it in that handoff
 * envelope, rejects any bare `require` outside the shell's shared-module
 * baseline, and prints the artifact size.
 *
 * Usage: `node scripts/build-client.mjs` (also runs before `pack:check`).
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ENTRY = resolve(ROOT, 'src/client/index.jsx')
const OUTFILE = resolve(ROOT, 'lib/client.js')
const PLUGIN_ID = '@sealwax/dsh-trust-platform'
const PACKAGE_VERSION = JSON.parse(
  await (await import('node:fs/promises')).readFile(resolve(ROOT, 'package.json'), 'utf8')
).version

/**
 * Module requests the shell seeds into every plugin's loader. Anything not in
 * this table or bundled into the artifact is a runtime error in the page, so
 * the build fails instead of shipping it.
 */
const BASELINE = [
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
]

/** Refuse to ship an artifact that clearly pulled in a dependency by mistake. */
// Phase-1 product console: the bundle now ships the full in-DSH workspace
// (shell, dashboard, pages, demo data) as well as the original cards/settings UI.
const SIZE_BUDGET = 512 * 1024

const result = await build({
  entryPoints: [ENTRY],
  outfile: OUTFILE,
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  external: BASELINE,
  define: { __PLUGIN_VERSION__: JSON.stringify(PACKAGE_VERSION) },
  write: false,
  logLevel: 'silent',
  sourcemap: false,
  legalComments: 'none',
  charset: 'utf8'
})

const output = result.outputFiles && result.outputFiles[0]
if (!output) throw new Error('[build:client] esbuild produced no output file')

const body = output.text.replace(/\r\n?/g, '\n').replace(/\s+$/, '')
const allowed = new Set(BASELINE)
for (const match of body.matchAll(/\brequire\("([^"]+)"\)/g)) {
  const request = match[1]
  if (!allowed.has(request)) {
    throw new Error(
      `[build:client] unsupported bare require "${request}" in the browser half; `
      + 'bundle it or add it to the shell baseline deliberately'
    )
  }
}

/** Indent the generated body inside the factory closure. */
function indent(text) {
  return text.split('\n').map((line) => (line ? `\t\t${line}` : line)).join('\n')
}

const wrapped = [
  'window.__ModuleLoader__.load({',
  `\tid: ${JSON.stringify(PLUGIN_ID)},`,
  '\tfactory: (require) => {',
  '\t\tvar module = { exports: {} };',
  '\t\tvar exports = module.exports;',
  indent(body),
  '\t\treturn module.exports;',
  '\t}',
  '});',
  ''
].join('\n')

const bytes = Buffer.byteLength(wrapped, 'utf8')
if (bytes > SIZE_BUDGET) {
  throw new Error(`[build:client] artifact is ${bytes} bytes, above the ${SIZE_BUDGET}-byte budget`)
}

await mkdir(dirname(OUTFILE), { recursive: true })
await writeFile(OUTFILE, wrapped, 'utf8')

console.log(
  `[build:client] ${relative(ROOT, OUTFILE).replaceAll('\\', '/')} · `
  + `${bytes.toLocaleString('en-US')} bytes · ${BASELINE.length} baseline externals · plugin ${PLUGIN_ID}`
)
