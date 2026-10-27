import test from 'node:test'
import assert from 'node:assert/strict'
import { name, inject, apply } from '../src/index.js'

test('exports the DSH function-plugin contract', () => {
  assert.equal(name, 'dsh-trust-platform')
  assert.deepEqual(inject, ['tools'])
  assert.equal(typeof apply, 'function')
})

test('registers governance tools without a send_money capability', () => {
  const registered = []
  apply({ tools: { register(tool) { registered.push(tool); return () => {} } } })
  const names = registered.map((tool) => tool.name)
  assert.equal(names.length, 10)
  assert.ok(names.includes('create_payment_task'))
  assert.ok(names.includes('get_execution_receipt'))
  assert.equal(names.includes('send_money'), false)
})
