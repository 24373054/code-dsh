/**
 * Editable settings page for the embedded trust plane.
 *
 * The page is a `settings.section` list entry: a single page under Settings that
 * reads the engine's runtime settings and lets the operator change the actor
 * DID, the intervention-execution gate and the risk policy limits. Saving sends
 * only the changed fields; the host validates the patch and a rejected change
 * renders its message (and details) instead of discarding the form.
 *
 * Below the form, a data-management block shows the state-file storage card,
 * exports the engine state as a JSON download and resets every engine record
 * behind a typed`RESET` confirmation. Every action renders localized loading,
 * success and error states.
 *
 * The page polls the same-origin settings, health and storage routes every ten
 * seconds, keeps the last good snapshot across failed refreshes, and leaves a
 * dirty draft untouched while the operator edits. All visible copy comes from
 * the locale dictionaries.
 */
import { useEffect, useState } from 'react'
import { Badge } from './badge.jsx'
import { formatTime, hasCopy, translate } from './format.js'
import { describeError } from './overview-data.js'
import {
  MAX_AMOUNT,
  POLICY_NUMBER_FIELDS,
  buildSettingsPatch,
  createDraft,
  describeDetails,
  formatByteSize,
  requestExport,
  resetEngineData,
  saveSettings,
  totalCount,
  validateDraft
} from './settings-data.js'
import { useSettings } from './settings-store.js'
import * as styles from './styles.js'

/** Poll cadence while the settings page is mounted. */
const POLL_INTERVAL_MS = 10000

/** Policy fields the engine treats as money amounts instead of ratios. */
const AMOUNT_FIELDS = new Set(['singleAmountLimit', 'dailyAmountLimit'])

/** Status tone for a mode value reported by the host. */
function modeTone(mode) {
  if (mode === 'embedded') return 'ok'
  if (mode === 'sandbox' || mode === 'in-memory') return 'info'
  return 'neutral'
}

/** Whether a non-policy control may be edited. */
function canEdit(editable, field) {
  return !editable || editable[field] !== false
}

/** Whether a policy control may be edited. */
function canEditPolicy(editable, field) {
  return !editable || !editable.policy || editable.policy[field] !== false
}

/** Merge a base style with the disabled look when a control is locked. */
function controlStyle(base, locked) {
  return locked ? { ...base, ...styles.inputDisabled } : base
}

/** Merge a base style with the disabled look when an action is unavailable. */
function actionStyle(base, disabled) {
  return disabled ? { ...base, ...styles.buttonDisabled } : base
}

/**
 * Trigger a browser download for one exported state snapshot.
 *
 * The helper is defensive on purpose: the settings page must keep working when
 * the browser globals it needs are unavailable (for example in a unit test).
 *
 * @param {string} filename suggested download name.
 * @param {string} text JSON payload.
 * @returns {boolean} whether a download was started.
 */
function saveDownload(filename, text) {
  try {
    if (typeof document === 'undefined' || typeof Blob !== 'function') return false
    // In browsers `URL` is a constructor (`typeof URL === 'function'`), while
    // test doubles may expose it as an object; both shapes are accepted and the
    // capability check below is what actually gates the download.
    const api = URL && (typeof URL === 'function' || typeof URL === 'object') ? URL : null
    if (!api || typeof api.createObjectURL !== 'function') return false
    const blob = new Blob([text], { type: 'application/json' })
    const href = api.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = filename
    anchor.rel = 'noopener'
    if (document.body && typeof document.body.appendChild === 'function') document.body.appendChild(anchor)
    anchor.click()
    if (typeof anchor.remove === 'function') anchor.remove()
    setTimeout(() => api.revokeObjectURL(href), 0)
    return true
  } catch {
    return false
  }
}

/**
 * `settings.section` entry: the trust-platform settings page.
 *
 * @param {{
 *   t?: (key: string, params?: Record<string, unknown>) => string,
 *   close?: () => void,
 * }} props framework-bound translate seat; `close` is unused (the page is not modal).
 */
export function SettingsPanel(props) {
  const { t } = props || {}
  const [snapshot, reload] = useSettings(POLL_INTERVAL_MS)
  const { data, health, storage, error, storageError, refreshedAt } = snapshot

  const server = data ? data.settings : null
  const defaults = data ? data.defaults : null
  const editable = data ? data.editable : null

  const [editor, setEditor] = useState(null)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [resetConfirm, setResetConfirm] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [actionError, setActionError] = useState(null)

  const draft = editor ? editor.draft : server ? createDraft(server) : null
  const dirty = Boolean(editor && editor.dirty)

  // A poll that observes new saved settings replaces a clean draft, but never
  // clobbers fields the operator is editing.
  useEffect(() => {
    if (!server) return
    setEditor((current) => (current && current.dirty ? current : null))
  }, [server])

  const clearMessages = () => {
    setFeedback(null)
    setActionError(null)
  }

  const updateField = (field, value) => {
    setEditor((current) => {
      const base = current ? current.draft : createDraft(server)
      if (!base) return current
      return { draft: { ...base, [field]: value }, dirty: true }
    })
    clearMessages()
  }

  const cancelEdits = () => {
    setEditor(null)
    clearMessages()
  }

  const applyDefaults = () => {
    const base = createDraft(defaults)
    if (!base) return
    setEditor({ draft: base, dirty: true })
    setActionError(null)
    setFeedback({ tone: 'info', text: translate(t, 'settings.feedback.defaultsApplied') })
  }

  const save = () => {
    if (!server || !draft || saving || resetting) return
    const errors = validateDraft(draft)
    if (errors.length > 0) {
      const first = errors[0]
      setFeedback(null)
      setActionError({ text: translate(t, first.key, first.params), details: null })
      return
    }
    const patch = buildSettingsPatch(draft, server)
    if (!patch) {
      setActionError(null)
      setFeedback({ tone: 'info', text: translate(t, 'settings.feedback.noChanges') })
      return
    }
    setSaving(true)
    clearMessages()
    saveSettings(patch).then((outcome) => {
      setSaving(false)
      if (outcome.data) {
        setEditor(null)
        setFeedback({
          tone: 'ok',
          text: translate(t, 'settings.feedback.saved', { time: formatTime(outcome.data.savedAt) || '—' })
        })
        reload()
      } else if (outcome.error) {
        setActionError({
          text: describeError(outcome.error, t, 'settings'),
          details: describeDetails(outcome.error.details)
        })
      }
    })
  }

  const reset = () => {
    if (saving || resetting || resetConfirm.trim() !== 'RESET') return
    setResetting(true)
    clearMessages()
    resetEngineData().then((outcome) => {
      setResetting(false)
      if (outcome.data) {
        setEditor(null)
        setResetConfirm('')
        setFeedback({
          tone: 'ok',
          text: translate(t, 'settings.feedback.reset', { count: totalCount(outcome.data.counts) })
        })
        reload()
      } else if (outcome.error) {
        setActionError({
          text: describeError(outcome.error, t, 'settings'),
          details: describeDetails(outcome.error.details)
        })
      }
    })
  }

  const exportData = () => {
    if (exporting) return
    setExporting(true)
    clearMessages()
    requestExport().then((outcome) => {
      setExporting(false)
      if (outcome.data) {
        const downloaded = saveDownload(outcome.data.filename, outcome.data.text)
        setFeedback({
          tone: downloaded ? 'ok' : 'info',
          text: translate(t, downloaded ? 'settings.feedback.exported' : 'settings.error.export', {
            filename: outcome.data.filename
          })
        })
      } else if (outcome.error) {
        setActionError({
          text: describeError(outcome.error, t, 'settings'),
          details: describeDetails(outcome.error.details)
        })
      }
    })
  }

  const mode = data ? data.mode : null
  const modeLabel = mode && hasCopy(`settings.mode.${mode}`)
    ? translate(t, `settings.mode.${mode}`)
    : translate(t, 'settings.mode.unknown')
  const authoritative = mode === 'embedded'
  const healthLabel = health && health.status ? health.status : translate(t, 'settings.health.unknown')
  const errorText = error ? describeError(error, t, 'settings') : null
  const storageErrorText = storageError ? describeError(storageError, t, 'settings') : null
  const refreshedText = refreshedAt ? formatTime(refreshedAt) : null
  const busy = saving || resetting
  const resetReady = resetConfirm.trim() === 'RESET'
  const storageState = storage ? 'ready' : storageErrorText ? 'error' : 'loading'
  const stateName = saving
    ? 'saving'
    : resetting
      ? 'resetting'
      : actionError
        ? 'error'
        : feedback
          ? 'saved'
          : data
            ? 'ready'
            : errorText
              ? 'error'
              : 'loading'

  const policyVersionLocked = !canEditPolicy(editable, 'policyVersion')
  const actorDidLocked = !canEdit(editable, 'actorDid')
  const interventionLocked = !canEdit(editable, 'allowInterventionExecution')

  return (
    <section
      style={styles.section}
      data-trust-settings="trust-platform"
      data-trust-state={stateName}
    >
      <div style={styles.sectionHead}>
        <span style={styles.sectionTitle}>{translate(t, 'settings.title')}</span>
        {data ? <Badge tone={modeTone(mode)}>{modeLabel}</Badge> : null}
        {data ? (
          authoritative
            ? <Badge tone="ok">{translate(t, 'settings.authoritative')}</Badge>
            : <Badge tone="warn">{translate(t, 'settings.nonAuthoritative')}</Badge>
        ) : null}
        {refreshedText ? (
          <span style={styles.meta}>{translate(t, 'settings.updated', { time: refreshedText })}</span>
        ) : null}
        <span style={styles.actions}>
          <button
            type="button"
            onClick={reload}
            disabled={busy || snapshot.loading}
            style={actionStyle(styles.actionButton, busy || snapshot.loading)}
          >
            {translate(t, errorText ? 'settings.retry' : 'settings.refresh')}
          </button>
        </span>
      </div>

      {errorText && !data ? (
        <div style={styles.errorBox}>
          <span>{errorText}</span>
          <button type="button" onClick={reload} disabled={busy} style={actionStyle(styles.actionButton, busy)}>
            {translate(t, 'settings.retry')}
          </button>
        </div>
      ) : null}
      {!data && !errorText ? (
        <div style={styles.muted}>{translate(t, 'settings.loading')}</div>
      ) : null}

      {data ? (
        <>
          <div style={styles.metaRow}>
            <span>{translate(t, 'settings.mode')}: {modeLabel}</span>
            {data.dataDir ? (
              <span style={styles.mono} title={data.dataDir}>
                {translate(t, 'settings.dataDir')}: {data.dataDir}
              </span>
            ) : null}
            <span>{translate(t, 'settings.health')}: {healthLabel}</span>
            {health && health.schemaRevision ? (
              <span style={styles.mono}>
                {translate(t, 'settings.schemaRevision')}: {health.schemaRevision}
              </span>
            ) : null}
            {health && health.startedAt ? (
              <span>{translate(t, 'settings.startedAt')}: {formatTime(health.startedAt) || health.startedAt}</span>
            ) : null}
          </div>

          {errorText ? (
            <div style={styles.staleBox}>{translate(t, 'settings.error.stale', { message: errorText })}</div>
          ) : null}

          <div style={styles.subTitle}>{translate(t, 'settings.form.title')}</div>
          <div style={styles.note}>{translate(t, 'settings.form.hint')}</div>

          {draft ? (
            <div style={styles.form} data-trust-form="settings">
              <div style={styles.formRow}>
                <label style={styles.formLabel} htmlFor="trust-platform-actor-did">
                  {translate(t, 'settings.field.actorDid')}
                </label>
                <div style={styles.formControl}>
                  <input
                    id="trust-platform-actor-did"
                    type="text"
                    value={draft.actorDid}
                    maxLength={200}
                    disabled={actorDidLocked || busy}
                    onChange={(event) => updateField('actorDid', event.target.value)}
                    data-trust-field="actorDid"
                    style={controlStyle(styles.input, actorDidLocked || busy)}
                  />
                  <span style={styles.hint}>{translate(t, 'settings.hint.actorDid')}</span>
                </div>
              </div>

              <div style={styles.formRow}>
                <label style={styles.formLabel} htmlFor="trust-platform-allow-intervention">
                  {translate(t, 'settings.field.allowInterventionExecution')}
                </label>
                <div style={styles.formControl}>
                  <input
                    id="trust-platform-allow-intervention"
                    type="checkbox"
                    checked={draft.allowInterventionExecution}
                    disabled={interventionLocked || busy}
                    onChange={(event) => updateField('allowInterventionExecution', event.target.checked)}
                    data-trust-field="allowInterventionExecution"
                    style={styles.checkbox}
                  />
                  <span style={styles.hint}>{translate(t, 'settings.hint.intervention')}</span>
                </div>
              </div>

              <div style={styles.formRow}>
                <label style={styles.formLabel} htmlFor="trust-platform-policy-version">
                  {translate(t, 'settings.field.policyVersion')}
                </label>
                <div style={styles.formControl}>
                  <input
                    id="trust-platform-policy-version"
                    type="text"
                    value={draft.policyVersion}
                    maxLength={120}
                    disabled={policyVersionLocked || busy}
                    onChange={(event) => updateField('policyVersion', event.target.value)}
                    data-trust-field="policyVersion"
                    data-trust-policy="policyVersion"
                    style={controlStyle(styles.input, policyVersionLocked || busy)}
                  />
                </div>
              </div>

              {POLICY_NUMBER_FIELDS.map((field) => {
                const amount = AMOUNT_FIELDS.has(field)
                const locked = !canEditPolicy(editable, field) || busy
                return (
                  <div key={field} style={styles.formRow}>
                    <label style={styles.formLabel} htmlFor={`trust-platform-policy-${field}`}>
                      {translate(t, `settings.field.${field}`)}
                    </label>
                    <div style={styles.formControl}>
                      <input
                        id={`trust-platform-policy-${field}`}
                        type="number"
                        inputMode="decimal"
                        value={draft[field]}
                        min={amount ? 1 : 0}
                        max={amount ? MAX_AMOUNT : 1}
                        step={amount ? 1 : 0.01}
                        disabled={locked}
                        onChange={(event) => updateField(field, event.target.value)}
                        data-trust-policy={field}
                        style={controlStyle(styles.inputNumber, locked)}
                      />
                      <span style={styles.hint}>
                        {amount
                          ? translate(t, 'settings.hint.amount', { max: MAX_AMOUNT })
                          : translate(t, 'settings.hint.ratio')}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div style={styles.note}>{translate(t, 'settings.hint.thresholds')}</div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={save}
                  disabled={busy || !dirty}
                  data-trust-action="save"
                  style={actionStyle(styles.primaryButton, busy || !dirty)}
                >
                  {translate(t, saving ? 'settings.action.saving' : 'settings.action.save')}
                </button>
                <button
                  type="button"
                  onClick={cancelEdits}
                  disabled={busy || !dirty}
                  data-trust-action="cancel"
                  style={actionStyle(styles.actionButton, busy || !dirty)}
                >
                  {translate(t, 'settings.action.cancel')}
                </button>
                <button
                  type="button"
                  onClick={applyDefaults}
                  disabled={busy || !defaults}
                  data-trust-action="apply-defaults"
                  style={actionStyle(styles.actionButton, busy || !defaults)}
                >
                  {translate(t, 'settings.action.applyDefaults')}
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <div style={styles.subTitle}>{translate(t, 'settings.storage.title')}</div>
      <div style={styles.note}>{translate(t, 'settings.storage.description')}</div>
      <div style={styles.formActions}>
        <button
          type="button"
          onClick={reload}
          disabled={busy || snapshot.loading}
          data-trust-action="refresh-storage"
          style={actionStyle(styles.actionButton, busy || snapshot.loading)}
        >
          {translate(t, 'settings.storage.refresh')}
        </button>
        <button
          type="button"
          onClick={exportData}
          disabled={exporting || busy}
          data-trust-action="export-data"
          style={actionStyle(styles.actionButton, exporting || busy)}
        >
          {translate(t, exporting ? 'settings.action.exporting' : 'settings.action.export')}
        </button>
      </div>

      <div
        style={styles.storageCard}
        data-trust-storage="card"
        data-trust-storage-state={storageState}
      >
        {storageState === 'error' ? (
          <div style={styles.errorBox}>
            <span>{storageErrorText}</span>
            <button type="button" onClick={reload} disabled={busy} style={actionStyle(styles.actionButton, busy)}>
              {translate(t, 'settings.retry')}
            </button>
          </div>
        ) : storage ? (
          <>
            <div style={styles.storageRow}>
              <span style={styles.storageLabel}>{translate(t, 'settings.storage.dataDir')}</span>
              <span style={styles.mono}>{storage.dataDir || '—'}</span>
            </div>
            <div style={styles.storageRow}>
              <span style={styles.storageLabel}>{translate(t, 'settings.storage.stateFile')}</span>
              <span style={styles.mono}>{storage.stateFile || '—'}</span>
            </div>
            <div style={styles.storageRow}>
              <span style={styles.storageLabel}>{translate(t, 'settings.storage.fileSize')}</span>
              <span>{formatByteSize(storage.fileSizeBytes) || '—'}</span>
            </div>
            <div style={styles.storageRow}>
              <span style={styles.storageLabel}>{translate(t, 'settings.storage.exists')}</span>
              <span>{translate(t, storage.exists === false ? 'settings.storage.missing' : 'settings.storage.exists')}</span>
            </div>
            {storage.lastSavedAt ? (
              <div style={styles.storageRow}>
                <span style={styles.storageLabel}>{translate(t, 'settings.storage.lastSavedAt')}</span>
                <span>{formatTime(storage.lastSavedAt) || storage.lastSavedAt}</span>
              </div>
            ) : null}
            {storage.schemaVersion ? (
              <div style={styles.storageRow}>
                <span style={styles.storageLabel}>{translate(t, 'settings.storage.schemaVersion')}</span>
                <span style={styles.mono}>{storage.schemaVersion}</span>
              </div>
            ) : null}
            <div style={styles.storageRow}>
              <span style={styles.storageLabel}>{translate(t, 'settings.storage.recovery')}</span>
              <span>
                {storage.recovery
                  ? [
                      storage.recovery.kind || translate(t, 'settings.storage.recoveryDetected'),
                      storage.recovery.occurredAt
                        ? formatTime(storage.recovery.occurredAt) || storage.recovery.occurredAt
                        : null
                    ].filter(Boolean).join(' · ')
                  : translate(t, 'settings.storage.recoveryClean')}
              </span>
            </div>
            {storage.recovery && storage.recovery.backupPath ? (
              <div style={styles.storageRow}>
                <span style={styles.storageLabel}>{translate(t, 'settings.storage.backupPath')}</span>
                <span style={styles.mono}>{storage.recovery.backupPath}</span>
              </div>
            ) : null}
            {storage.writeError ? (
              <div style={styles.confirmBox} data-trust-storage-warning="write_error">
                {translate(t, 'settings.storage.writeError', {
                  message: storage.writeError.message || storage.writeError.code || ''
                })}
                {storage.writeError.at
                  ? ` · ${formatTime(storage.writeError.at) || storage.writeError.at}`
                  : ''}
              </div>
            ) : null}
          </>
        ) : (
          <div style={styles.muted}>{translate(t, 'settings.storage.loading')}</div>
        )}
      </div>

      <div style={styles.subTitle}>{translate(t, 'settings.reset.title')}</div>
      <div style={styles.note}>{translate(t, 'settings.reset.description')}</div>
      <div style={styles.formActions} data-trust-confirm="reset">
        <input
          type="text"
          value={resetConfirm}
          placeholder="RESET"
          aria-label={translate(t, 'settings.reset.confirmInput')}
          disabled={busy}
          onChange={(event) => setResetConfirm(event.target.value)}
          data-trust-reset-input="confirm"
          style={controlStyle(styles.input, busy)}
        />
        <span style={styles.hint}>{translate(t, 'settings.reset.confirmInput')}</span>
        <button
          type="button"
          onClick={reset}
          disabled={busy || !resetReady}
          data-trust-action="reset"
          style={actionStyle(styles.dangerButton, busy || !resetReady)}
        >
          {translate(t, resetting ? 'settings.action.resetting' : 'settings.action.reset')}
        </button>
      </div>

      {feedback ? (
        <div
          style={feedback.tone === 'ok' ? styles.feedbackOk : styles.note}
          data-trust-feedback={feedback.tone}
        >
          {feedback.text}
        </div>
      ) : null}
      {actionError ? (
        <div style={styles.errorBox} data-trust-feedback="error">
          <span>{actionError.text}</span>
          {actionError.details ? (
            <span style={styles.mono}>
              {translate(t, 'settings.error.details', { details: actionError.details })}
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
