/**
 * Product stylesheet for the trust-platform console (`main` panel).
 *
 * The console renders inside the DSH shell, so every colour resolves from the
 * shell's `--dsw-alias-*` theme tokens with neutral fallbacks; the sheet never
 * assumes a light or dark palette. Class names are prefixed `tp-` so the sheet
 * cannot collide with shell styles.
 *
 * The sheet is injected once per page (`ensureProductStyles`) and removed with
 * the plugin's page lifetime only in development; DSH keeps plugin styles for
 * the session, which is the same contract the shell's own styles follow.
 */

const STYLE_ID = 'dsh-trust-platform-product-styles'

const CSS = `
.tp-root,
.tp-panel-root {
  --tp-bg: var(--dsw-alias-bg-base, #f5f5f7);
  --tp-surface: var(--dsw-alias-bg-layer-1, #ffffff);
  --tp-surface-2: var(--dsw-alias-bg-layer-2, #fbfbfd);
  --tp-surface-3: var(--dsw-alias-bg-layer-3, #f2f2f7);
  --tp-text: var(--dsw-alias-label-primary, #1d1d1f);
  --tp-text-2: var(--dsw-alias-label-secondary, #6e6e73);
  --tp-text-3: color-mix(in srgb, var(--dsw-alias-label-tertiary, #8e8e93) 72%, var(--dsw-alias-label-primary, #1d1d1f));
  --tp-border: var(--dsw-alias-border-l2, rgba(60, 60, 67, 0.12));
  --tp-border-soft: var(--dsw-alias-border-l1, rgba(60, 60, 67, 0.08));
  --tp-accent: var(--dsw-alias-brand-primary, #0a6cff);
  --tp-accent-fill: var(--dsw-alias-button-primary-fill, var(--tp-accent));
  --tp-accent-fill-hover: var(--dsw-alias-button-primary-hover, #0a5bd9);
  --tp-on-accent: var(--dsw-alias-label-primary-foreground, #ffffff);
  --tp-accent-soft: rgba(10, 108, 255, 0.10);
  --tp-hover: var(--dsw-alias-interactive-bg-hover, rgba(120, 120, 128, 0.08));
  --tp-success: var(--dsw-alias-state-success-primary, #1f9d63);
  --tp-success-soft: color-mix(in srgb, var(--tp-success) 12%, transparent);
  --tp-warn: var(--dsw-alias-state-warn-primary, #b36b00);
  --tp-warn-soft: color-mix(in srgb, var(--tp-warn) 14%, transparent);
  --tp-danger: var(--dsw-alias-state-error-primary, #d92d20);
  --tp-danger-soft: color-mix(in srgb, var(--tp-danger) 10%, transparent);
  --tp-info: var(--dsw-alias-state-business-primary, #0a6cff);
  --tp-info-soft: color-mix(in srgb, var(--tp-info) 10%, transparent);
  /* Tag text tones: darker in light theme so small labels stay readable on tinted chips. */
  --tp-tag-success: color-mix(in srgb, var(--tp-success) 58%, #10131a);
  --tp-tag-warn: color-mix(in srgb, var(--tp-warn) 70%, #10131a);
  --tp-tag-danger: color-mix(in srgb, var(--tp-danger) 68%, #10131a);
  --tp-tag-info: color-mix(in srgb, var(--tp-info) 60%, #10131a);
  --tp-radius-xl: 18px;
  --tp-radius-lg: 14px;
  --tp-radius-md: 10px;
  --tp-radius-sm: 7px;
  --tp-shadow-card: 0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.04);
  --tp-shadow-pop: 0 12px 40px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.08);
  --tp-font: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", sans-serif);
}

.tp-root,
.tp-panel-root {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--tp-bg);
  color: var(--tp-text);
  font-family: var(--tp-font);
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.tp-root { position: absolute; inset: 0; }

/* The docked console fills whatever width DSH gives its right column; the
   container query below compacts the chrome on narrow columns. */
.tp-panel-root {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  container-type: inline-size;
}
.tp-panel-root .tp-shell { flex: 1; min-height: 0; }
.tp-root, .tp-panel-root { color-scheme: light }
body[data-ds-dark-theme] .tp-root, body[data-ds-dark-theme] .tp-panel-root { color-scheme: dark }

.tp-root *, .tp-root *::before, .tp-root *::after,
.tp-panel-root *, .tp-panel-root *::before, .tp-panel-root *::after { box-sizing: border-box; }

/* ---------- shell ---------- */
.tp-shell { flex: 1; display: flex; min-height: 0; }
.tp-nav {
  width: 224px;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px 10px 12px;
  border-right: 1px solid var(--tp-border-soft);
  background: color-mix(in srgb, var(--tp-surface-2) 72%, transparent);
  overflow-y: auto;
}
.tp-nav-brand { display: flex; align-items: center; gap: 10px; padding: 4px 10px 14px; }
.tp-nav-brand-mark {
  width: 28px; height: 28px; border-radius: 9px;
  display: grid; place-items: center;
  color: #fff;
  background: linear-gradient(135deg, #0a6cff, #7b5cff);
  box-shadow: 0 4px 12px rgba(10, 108, 255, 0.3);
}
.tp-nav-brand-name { font-size: 14px; font-weight: 700; letter-spacing: 0.2px; }
.tp-nav-brand-sub { font-size: 11px; color: var(--tp-text-3); font-weight: 500; }
.tp-nav-group { padding: 12px 10px 6px; font-size: 11px; font-weight: 600; color: var(--tp-text-3); letter-spacing: 0.4px; }
.tp-nav-item {
  display: flex; align-items: center; gap: 10px;
  height: 34px; padding: 0 10px;
  border: 0; border-radius: var(--tp-radius-md);
  background: transparent; color: var(--tp-text-2);
  font: inherit; font-size: 13px; font-weight: 500; text-align: left;
  cursor: pointer; width: 100%;
}
.tp-nav-item:hover { background: var(--tp-hover); color: var(--tp-text); }
.tp-nav-item[aria-current="page"] { background: var(--tp-accent-soft); color: var(--tp-accent); font-weight: 600; }
.tp-nav-item .tp-nav-badge {
  margin-left: auto; min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 9px; font-size: 11px; font-weight: 600; line-height: 18px;
  text-align: center; color: #fff; background: var(--tp-danger);
}
.tp-nav-item .tp-nav-count { margin-left: auto; font-size: 12px; color: var(--tp-text-3); font-variant-numeric: tabular-nums; }
.tp-nav-foot { margin-top: auto; padding: 10px 4px 0; border-top: 1px solid var(--tp-border-soft); }
.tp-nav-mode { display: flex; align-items: center; gap: 6px; padding: 6px 10px; font-size: 11px; color: var(--tp-text-3); }
.tp-nav-mode-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--tp-success); }

.tp-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.tp-topbar {
  position: relative; z-index: 20;
  height: 58px; flex: none;
  display: flex; align-items: center; gap: 12px;
  padding: 0 22px;
  border-bottom: 1px solid var(--tp-border-soft);
  background: color-mix(in srgb, var(--tp-surface) 86%, transparent);
  backdrop-filter: saturate(180%) blur(16px);
}
.tp-topbar-title { font-size: 16px; font-weight: 700; letter-spacing: -0.2px; }
.tp-topbar-sub { font-size: 12px; color: var(--tp-text-3); margin-left: 2px; }
.tp-topbar-spacer { flex: 1; }
.tp-content { flex: 1; overflow-y: auto; padding: 22px 24px 44px; }
.tp-page { max-width: 1180px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }

/* ---------- primitives ---------- */
.tp-page-head { display: flex; align-items: flex-end; gap: 14px; }
.tp-page-head-text { flex: 1; min-width: 0; }
.tp-page-title { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.4px; }
.tp-page-desc { margin: 4px 0 0; font-size: 12.5px; color: var(--tp-text-2); }
.tp-page-actions { display: flex; align-items: center; gap: 8px; }

.tp-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 32px; padding: 0 14px;
  border: 1px solid var(--tp-border); border-radius: 999px;
  background: var(--tp-surface); color: var(--tp-text);
  font: inherit; font-size: 12.5px; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  transition: background 0.12s ease, border-color 0.12s ease, opacity 0.12s ease;
}
.tp-btn:hover { background: var(--tp-hover); }
.tp-btn:active { opacity: 0.75; }
.tp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.tp-btn-primary { background: var(--tp-accent-fill); border-color: transparent; color: var(--tp-on-accent); }
.tp-btn-primary:hover { background: var(--tp-accent-fill-hover); }
.tp-btn-danger { background: var(--tp-danger); border-color: transparent; color: #fff; }
.tp-btn-danger:hover { background: color-mix(in srgb, var(--tp-danger) 88%, #000); }
.tp-btn-ghost { background: transparent; border-color: transparent; color: var(--tp-text-2); }
.tp-btn-ghost:hover { background: var(--tp-hover); color: var(--tp-text); }
.tp-btn-sm { height: 26px; padding: 0 10px; font-size: 12px; }
.tp-btn-lg { height: 40px; padding: 0 20px; font-size: 14px; }

.tp-icon-btn {
  width: 30px; height: 30px; display: grid; place-items: center;
  border: 0; border-radius: 8px; background: transparent; color: var(--tp-text-2);
  cursor: pointer;
}
.tp-icon-btn:hover { background: var(--tp-hover); color: var(--tp-text); }

.tp-card {
  background: var(--tp-surface);
  border: 1px solid var(--tp-border-soft);
  border-radius: var(--tp-radius-xl);
  box-shadow: var(--tp-shadow-card);
  padding: 18px;
}
.tp-card-flat { box-shadow: none; }
.tp-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.tp-card-title { font-size: 14px; font-weight: 650; letter-spacing: -0.1px; }
.tp-card-desc { font-size: 12px; color: var(--tp-text-3); }
.tp-card-actions { margin-left: auto; display: flex; align-items: center; gap: 6px; }

.tp-grid { display: grid; gap: 14px; }
.tp-grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.tp-grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.tp-grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.tp-span-2 { grid-column: span 2; }

.tp-stat { display: flex; flex-direction: column; gap: 6px; }
.tp-stat-label { font-size: 12px; font-weight: 600; color: var(--tp-text-3); }
.tp-stat-value { font-size: 26px; font-weight: 720; letter-spacing: -0.8px; font-variant-numeric: tabular-nums; }
.tp-stat-unit { font-size: 13px; font-weight: 600; color: var(--tp-text-3); margin-left: 4px; }
.tp-stat-delta { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; }
.tp-stat-delta.up { color: var(--tp-success); }
.tp-stat-delta.down { color: var(--tp-danger); }
.tp-stat-foot { font-size: 12px; color: var(--tp-text-3); }

.tp-tag {
  display: inline-flex; align-items: center; gap: 4px;
  height: 22px; padding: 0 8px;
  border-radius: 999px; font-size: 11.5px; font-weight: 600;
  background: var(--tp-surface-3); color: var(--tp-text-2); white-space: nowrap;
}
.tp-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.tp-tag.success { background: var(--tp-success-soft); color: var(--tp-tag-success); }
.tp-tag.warn { background: var(--tp-warn-soft); color: var(--tp-tag-warn); }
.tp-tag.danger { background: var(--tp-danger-soft); color: var(--tp-tag-danger); }
.tp-tag.info { background: var(--tp-info-soft); color: var(--tp-tag-info); }
.tp-tag.neutral { background: var(--tp-surface-3); color: var(--tp-text-2); }

/* Dark theme keeps the original, lighter state tones: the mix above would darken them. */
body[data-ds-dark-theme] .tp-panel-root,
body[data-ds-dark-theme] .tp-root {
  --tp-tag-success: var(--tp-success);
  --tp-tag-warn: var(--tp-warn);
  --tp-tag-danger: var(--tp-danger);
  --tp-tag-info: var(--tp-info);
}

.tp-avatar {
  width: 34px; height: 34px; flex: none;
  border-radius: 10px;
  display: grid; place-items: center;
  font-size: 12px; font-weight: 700; color: #fff;
  letter-spacing: 0.2px;
}
.tp-avatar-sm { width: 26px; height: 26px; border-radius: 8px; font-size: 10.5px; }
.tp-avatar-lg { width: 44px; height: 44px; border-radius: 12px; font-size: 14px; }

.tp-mono { font-family: var(--dsw-font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace); font-size: 11.5px; }
.tp-muted { color: var(--tp-text-2); }
.tp-faint { color: var(--tp-text-3); }
.tp-strong { font-weight: 650; }
.tp-num { font-variant-numeric: tabular-nums; }
.tp-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.tp-table-wrap { overflow: auto; border-radius: var(--tp-radius-lg); }
.tp-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12.5px; }
.tp-table th {
  position: sticky; top: 0; z-index: 1;
  text-align: left; font-size: 11.5px; font-weight: 600; color: var(--tp-text-2);
  padding: 9px 12px; background: var(--tp-surface-2);
  border-bottom: 1px solid var(--tp-border-soft);
  white-space: nowrap;
}
.tp-table td { padding: 12px; border-bottom: 1px solid var(--tp-border-soft); vertical-align: middle; }
.tp-table tbody tr:last-child td { border-bottom: 0; }
.tp-table tbody tr { transition: background 0.1s ease; }
.tp-table tbody tr:hover { background: var(--tp-hover); }
.tp-table .tp-cell-actions { text-align: right; white-space: nowrap; }
.tp-clickable { cursor: pointer; }

.tp-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.tp-search {
  display: flex; align-items: center; gap: 7px;
  height: 32px; padding: 0 12px;
  border: 1px solid var(--tp-border); border-radius: 999px;
  background: var(--tp-surface); min-width: 220px; color: var(--tp-text-3);
}
.tp-search input {
  flex: 1; min-width: 0; border: 0; outline: 0; background: transparent;
  color: var(--tp-text); font: inherit; font-size: 12.5px;
}
.tp-select {
  height: 32px; padding: 0 28px 0 12px;
  border: 1px solid var(--tp-border); border-radius: 999px;
  background: var(--tp-surface) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%238e8e93' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") no-repeat right 12px center;
  color: var(--tp-text); font: inherit; font-size: 12.5px; appearance: none; cursor: pointer;
}
.tp-seg {
  display: inline-flex; padding: 3px; gap: 2px;
  background: var(--tp-surface-3); border-radius: 999px;
}
.tp-seg button {
  height: 26px; padding: 0 12px; border: 0; border-radius: 999px;
  background: transparent; color: var(--tp-text-2); font: inherit; font-size: 12px; font-weight: 600;
  cursor: pointer; white-space: nowrap;
}
.tp-seg button[aria-pressed="true"] { background: var(--tp-surface); color: var(--tp-text); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

.tp-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 54px 20px; text-align: center; color: var(--tp-text-3); }
.tp-empty-icon { width: 46px; height: 46px; border-radius: 16px; display: grid; place-items: center; background: var(--tp-surface-3); color: var(--tp-text-3); }
.tp-empty-title { font-size: 13.5px; font-weight: 600; color: var(--tp-text-2); }
.tp-empty-desc { font-size: 12px; max-width: 320px; }

.tp-drawer-mask { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,0.28); animation: tp-fade 0.15s ease; }
.tp-drawer {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 61;
  width: min(520px, 94vw);
  display: flex; flex-direction: column;
  background: var(--tp-bg); box-shadow: var(--tp-shadow-pop);
  animation: tp-slide-in 0.22s cubic-bezier(0.2, 0.9, 0.3, 1);
}
.tp-modal-mask { position: fixed; inset: 0; z-index: 60; display: grid; place-items: center; padding: 24px; background: rgba(0,0,0,0.3); animation: tp-fade 0.15s ease; }
.tp-modal {
  width: min(560px, 100%); max-height: 82vh; overflow: auto;
  background: var(--tp-bg); border-radius: var(--tp-radius-xl);
  box-shadow: var(--tp-shadow-pop); animation: tp-pop 0.2s cubic-bezier(0.2, 0.9, 0.3, 1);
}
.tp-drawer-head, .tp-modal-head {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 20px; border-bottom: 1px solid var(--tp-border-soft);
  background: var(--tp-surface);
}
.tp-drawer-body, .tp-modal-body { flex: 1; overflow-y: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 16px; }
.tp-drawer-foot, .tp-modal-foot {
  display: flex; align-items: center; gap: 8px; justify-content: flex-end;
  padding: 13px 20px; border-top: 1px solid var(--tp-border-soft); background: var(--tp-surface);
}

@keyframes tp-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes tp-slide-in { from { transform: translateX(24px); opacity: 0.4; } to { transform: none; opacity: 1; } }
@keyframes tp-pop { from { transform: scale(0.98) translateY(6px); opacity: 0.5; } to { transform: none; opacity: 1; } }

.tp-field { display: flex; flex-direction: column; gap: 6px; }
.tp-field-label { font-size: 12px; font-weight: 600; color: var(--tp-text-2); }
.tp-input, .tp-textarea {
  min-height: 34px; padding: 7px 11px;
  border: 1px solid var(--tp-border); border-radius: var(--tp-radius-md);
  background: var(--tp-surface); color: var(--tp-text); font: inherit; font-size: 13px; outline: none;
  width: 100%;
}
.tp-input:focus, .tp-textarea:focus { border-color: var(--tp-accent); }
.tp-textarea { min-height: 78px; resize: vertical; }
.tp-field-hint { font-size: 11.5px; color: var(--tp-text-3); }
.tp-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 16px; }
.tp-form-grid .tp-field:last-child { grid-column: 1 / -1; }

.tp-kv { display: grid; grid-template-columns: 118px 1fr; gap: 9px 14px; font-size: 12.5px; align-items: baseline; }
.tp-kv dt { color: var(--tp-text-3); }
.tp-kv dd { margin: 0; color: var(--tp-text); word-break: break-word; }

.tp-timeline { display: flex; flex-direction: column; }
.tp-timeline-item { position: relative; display: flex; gap: 12px; padding-bottom: 16px; }
.tp-timeline-item::before { content: ""; position: absolute; left: 10px; top: 24px; bottom: 0; width: 1px; background: var(--tp-border); }
.tp-timeline-item:last-child::before { display: none; }
.tp-timeline-node {
  width: 21px; height: 21px; flex: none; border-radius: 50%;
  display: grid; place-items: center; background: var(--tp-surface-3); color: var(--tp-text-2);
  border: 2px solid var(--tp-surface);
  box-shadow: 0 0 0 1px var(--tp-border);
}
.tp-timeline-node.success { background: var(--tp-success-soft); color: var(--tp-success); }
.tp-timeline-node.warn { background: var(--tp-warn-soft); color: var(--tp-warn); }
.tp-timeline-node.danger { background: var(--tp-danger-soft); color: var(--tp-danger); }
.tp-timeline-main { flex: 1; min-width: 0; }
.tp-timeline-title { font-size: 12.5px; font-weight: 600; }
.tp-timeline-meta { font-size: 11.5px; color: var(--tp-text-3); margin-top: 1px; }
.tp-timeline-body { margin-top: 5px; font-size: 12px; color: var(--tp-text-2); }

.tp-progress { height: 6px; border-radius: 999px; background: var(--tp-surface-3); overflow: hidden; }
.tp-progress-fill { height: 100%; border-radius: 999px; background: var(--tp-accent); transition: width 0.3s ease; }
.tp-progress-fill.success { background: var(--tp-success); }
.tp-progress-fill.warn { background: var(--tp-warn); }
.tp-progress-fill.danger { background: var(--tp-danger); }

.tp-bars { display: flex; align-items: flex-end; gap: 6px; height: 84px; }
.tp-bars-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 0; }
.tp-bars-bar { width: 100%; max-width: 26px; border-radius: 6px 6px 3px 3px; background: var(--tp-accent); transition: height 0.3s ease; }
.tp-bars-bar.success { background: var(--tp-success); }
.tp-bars-bar.warn { background: var(--tp-warn); }
.tp-bars-bar.danger { background: var(--tp-danger); }
.tp-bars-label { font-size: 10.5px; color: var(--tp-text-3); white-space: nowrap; }

.tp-list { display: flex; flex-direction: column; }
.tp-list-row {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 2px; border-bottom: 1px solid var(--tp-border-soft);
  min-width: 0;
}
.tp-list-row:last-child { border-bottom: 0; }
.tp-list-main { flex: 1; min-width: 0; }
.tp-list-title { font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.tp-list-sub { font-size: 11.5px; color: var(--tp-text-3); margin-top: 1px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.tp-list-side { display: flex; align-items: center; gap: 10px; flex: none; }

.tp-threshold-row { display: grid; grid-template-columns: 86px 1fr 72px; align-items: center; gap: 12px; }
.tp-threshold-row input[type="range"] { width: 100%; accent-color: var(--tp-accent); }
.tp-slider-value { font-size: 12.5px; font-weight: 650; text-align: right; font-variant-numeric: tabular-nums; }

.tp-chain { display: flex; align-items: center; gap: 0; flex-wrap: wrap; }
.tp-chain-node { display: flex; flex-direction: column; gap: 2px; padding: 7px 12px; border: 1px solid var(--tp-border); border-radius: var(--tp-radius-md); background: var(--tp-surface); }
.tp-chain-node.root { border-color: color-mix(in srgb, var(--tp-accent) 45%, transparent); }
.tp-chain-arrow { width: 22px; height: 1.5px; background: var(--tp-border); position: relative; margin: 0 2px; }
.tp-chain-arrow::after { content: ""; position: absolute; right: -1px; top: -3.5px; border: 4px solid transparent; border-left-color: var(--tp-border); }

.tp-hero {
  display: flex; align-items: center; gap: 18px;
  padding: 20px 22px;
  border-radius: var(--tp-radius-xl);
  color: #fff;
  background: linear-gradient(120deg, #0a5cd6 0%, #0a84ff 45%, #6a5cff 100%);
  box-shadow: 0 10px 30px rgba(10, 92, 214, 0.22);
}
.tp-hero-title { font-size: 18px; font-weight: 700; letter-spacing: -0.2px; }
.tp-hero-desc { font-size: 12.5px; opacity: 0.85; margin-top: 3px; }
.tp-hero-metrics { margin-left: auto; display: flex; gap: 26px; }
.tp-hero-metric { text-align: right; }
.tp-hero-metric-value { font-size: 19px; font-weight: 700; font-variant-numeric: tabular-nums; }
.tp-hero-metric-label { font-size: 11px; opacity: 0.75; }

.tp-risk-gauge { display: flex; align-items: center; gap: 12px; }
.tp-risk-score { font-size: 24px; font-weight: 720; font-variant-numeric: tabular-nums; letter-spacing: -0.5px; }

.tp-claims { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 18px; }

.tp-divider { height: 1px; background: var(--tp-border-soft); margin: 2px 0; }

.tp-toast-stack { position: fixed; right: 22px; bottom: 22px; z-index: 80; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
.tp-toast {
  display: flex; align-items: center; gap: 9px;
  padding: 10px 14px; border-radius: var(--tp-radius-md);
  background: var(--tp-surface); color: var(--tp-text);
  box-shadow: var(--tp-shadow-pop); border: 1px solid var(--tp-border-soft);
  font-size: 12.5px; font-weight: 500; animation: tp-pop 0.18s ease;
  max-width: 360px;
}
.tp-toast.success .tp-toast-icon { color: var(--tp-success); }
.tp-toast.error .tp-toast-icon { color: var(--tp-danger); }
.tp-toast-icon { display: grid; place-items: center; }

.tp-skeleton { border-radius: 8px; background: linear-gradient(90deg, var(--tp-surface-3), var(--tp-surface-2), var(--tp-surface-3)); background-size: 200% 100%; animation: tp-shimmer 1.2s infinite; }
@keyframes tp-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

@media (max-width: 1080px) {
  .tp-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tp-grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 760px) {
  .tp-nav { width: 64px; padding: 14px 8px; }
  .tp-nav-brand-name, .tp-nav-brand-sub, .tp-nav-group, .tp-nav-item span, .tp-nav-foot { display: none; }
  .tp-nav-item { justify-content: center; padding: 0; }
  .tp-grid-4, .tp-grid-3, .tp-grid-2 { grid-template-columns: minmax(0, 1fr); }
  .tp-span-2 { grid-column: auto; }
}
/* ---------- console layout (shared by only-one mount point) ---------- */
.tp-root { min-height: 0; }
.tp-shell { flex: 1; display: flex; flex-direction: column; min-height: 0; min-width: 0; }
.tp-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.tp-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.tp-brand-mark {
  width: 30px; height: 30px; flex: none; border-radius: 9px;
  display: grid; place-items: center; color: #fff;
  background: linear-gradient(135deg, #0a6cff, #7b5cff);
  box-shadow: 0 4px 12px rgba(10, 108, 255, 0.28);
}
.tp-brand-text { min-width: 0; }
.tp-brand-name { font-size: 13.5px; font-weight: 700; letter-spacing: -0.1px; white-space: nowrap; }
.tp-brand-sub { font-size: 11px; color: var(--tp-text-3); font-weight: 500; white-space: nowrap; }

.tp-tabs {
  flex: none; display: flex; align-items: center; gap: 2px;
  padding: 0 20px; height: 46px;
  border-bottom: 1px solid var(--tp-border-soft);
  background: color-mix(in srgb, var(--tp-surface) 65%, transparent);
  overflow-x: auto;
}
.tp-tab {
  display: inline-flex; align-items: center; gap: 7px;
  height: 30px; padding: 0 11px; border: 0; border-radius: 9px;
  background: transparent; color: var(--tp-text-2);
  font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; white-space: nowrap;
}
.tp-tab:hover { background: var(--tp-hover); color: var(--tp-text); }
.tp-tab.active { background: var(--tp-accent-soft); color: var(--tp-accent); }
.tp-tab-badge {
  min-width: 17px; height: 17px; padding: 0 5px; border-radius: 999px;
  font-size: 10.5px; font-weight: 700; line-height: 17px; text-align: center;
  color: #fff; background: var(--tp-danger);
}
.tp-main {
  flex: 1; min-width: 0; min-height: 0; overflow-y: auto;
  display: flex; flex-direction: column;
  padding: 22px 24px 44px;
  background: var(--tp-bg);
}
.tp-breadcrumb { max-width: 1180px; width: 100%; margin: 0 auto 12px; }
.tp-back {
  display: inline-flex; align-items: center; gap: 5px;
  height: 28px; padding: 0 11px; border: 1px solid var(--tp-border); border-radius: 999px;
  background: var(--tp-surface); color: var(--tp-text-2);
  font: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
}
.tp-back:hover { background: var(--tp-hover); color: var(--tp-text); }

/* ---------- topbar widgets ---------- */
.tp-global-search { position: relative; }
.tp-global-search { position: relative; display: flex; align-items: center; }
.tp-search-trigger {
  display: flex; align-items: center; gap: 7px;
  height: 30px; padding: 0 11px; min-width: 216px;
  border: 1px solid var(--tp-border); border-radius: 999px;
  background: var(--tp-surface); color: var(--tp-text-3);
  font: inherit; font-size: 12px; cursor: pointer; text-align: left;
}
.tp-search-trigger:hover { border-color: var(--tp-border); background: var(--tp-surface-2); }
.tp-search-trigger kbd {
  margin-left: auto; padding: 1px 5px; border-radius: 5px;
  border: 1px solid var(--tp-border); background: var(--tp-surface-3);
  font: inherit; font-size: 10.5px; color: var(--tp-text-3);
}
.tp-pop-anchor { position: relative; }
.tp-bell-dot {
  position: absolute; top: 1px; right: 1px; min-width: 15px; height: 15px;
  padding: 0 4px; border-radius: 999px; font-size: 9.5px; font-weight: 700;
  line-height: 15px; text-align: center; color: #fff; background: var(--tp-danger);
  box-shadow: 0 0 0 2px var(--tp-surface);
}
.tp-popover {
  position: absolute; top: calc(100% + 8px); right: 0; z-index: 50;
  min-width: 300px; max-width: 380px;
  background: var(--tp-surface); border: 1px solid var(--tp-border-soft);
  border-radius: var(--tp-radius-lg); box-shadow: var(--tp-shadow-pop);
  overflow: hidden; animation: tp-pop 0.16s cubic-bezier(0.2, 0.9, 0.3, 1);
}
.tp-popover-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 14px; border-bottom: 1px solid var(--tp-border-soft);
  font-size: 12.5px;
}
.tp-search-pop { min-width: 380px; }
.tp-search-input {
  width: 100%; height: 40px; padding: 0 14px; border: 0; outline: 0;
  border-bottom: 1px solid var(--tp-border-soft);
  background: transparent; color: var(--tp-text); font: inherit; font-size: 13px;
}
.tp-search-results { max-height: 330px; overflow-y: auto; padding: 6px; }
.tp-search-empty { padding: 26px 12px; text-align: center; font-size: 12px; color: var(--tp-text-3); }
.tp-search-hit {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 8px 10px; border: 0; border-radius: 9px;
  background: transparent; color: var(--tp-text); font: inherit; text-align: left; cursor: pointer;
}
.tp-search-hit:hover { background: var(--tp-hover); }
.tp-search-hit-icon {
  width: 28px; height: 28px; flex: none; border-radius: 8px;
  display: grid; place-items: center;
  background: var(--tp-surface-3); color: var(--tp-text-2);
}
.tp-search-hit-main { min-width: 0; }
.tp-search-hit-title { display: block; font-size: 12.5px; font-weight: 600; }
.tp-search-hit-detail { display: block; font-size: 11px; color: var(--tp-text-3); }
.tp-link-btn {
  border: 0; background: transparent; color: var(--tp-accent);
  font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0;
}
.tp-notify-list { max-height: 360px; overflow-y: auto; }
.tp-notify-item {
  display: flex; align-items: flex-start; gap: 10px; width: 100%;
  padding: 11px 14px; border: 0; border-bottom: 1px solid var(--tp-border-soft);
  background: transparent; color: var(--tp-text); font: inherit; text-align: left; cursor: pointer;
}
.tp-notify-item:last-child { border-bottom: 0; }
.tp-notify-item:hover { background: var(--tp-hover); }
.tp-notify-item.unread { background: color-mix(in srgb, var(--tp-accent-soft) 55%, transparent); }
.tp-notify-icon {
  width: 26px; height: 26px; flex: none; border-radius: 8px;
  display: grid; place-items: center;
  background: var(--tp-surface-3); color: var(--tp-text-2);
}
.tp-notify-icon.success { background: var(--tp-success-soft); color: var(--tp-success); }
.tp-notify-icon.warn { background: var(--tp-warn-soft); color: var(--tp-warn); }
.tp-notify-icon.danger { background: var(--tp-danger-soft); color: var(--tp-danger); }
.tp-notify-icon.info { background: var(--tp-info-soft); color: var(--tp-info); }
.tp-notify-main { flex: 1; min-width: 0; }
.tp-notify-title { display: block; font-size: 12.5px; font-weight: 600; }
.tp-notify-body { display: block; font-size: 11.5px; color: var(--tp-text-2); margin-top: 1px; }
.tp-notify-time { font-size: 10.5px; color: var(--tp-text-3); white-space: nowrap; margin-top: 2px; }
.tp-account {
  display: flex; align-items: center; gap: 8px;
  height: 36px; padding: 0 8px; border: 0; border-radius: 999px;
  background: transparent; color: var(--tp-text); font: inherit; cursor: pointer;
}
.tp-account:hover { background: var(--tp-hover); }
.tp-account-text { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2; }
.tp-account-name { font-size: 12px; font-weight: 600; }
.tp-account-role { font-size: 10.5px; color: var(--tp-text-3); }
.tp-account-pop { min-width: 280px; }
.tp-account-pop-head { display: flex; align-items: center; gap: 11px; padding: 14px; border-bottom: 1px solid var(--tp-border-soft); }
.tp-account-pop-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 14px; font-size: 12px; color: var(--tp-text-2);
  border-bottom: 1px solid var(--tp-border-soft);
}
.tp-account-pop-action {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 11px 14px; border: 0; background: transparent;
  color: var(--tp-text); font: inherit; font-size: 12.5px; font-weight: 600;
  text-align: left; cursor: pointer;
}
.tp-account-pop-action:hover { background: var(--tp-hover); }

/* ---------- approvals ---------- */
.tp-sla-strip {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;
  padding: 14px 16px; border-radius: var(--tp-radius-lg);
  background: var(--tp-surface); border: 1px solid var(--tp-border-soft);
  box-shadow: var(--tp-shadow-card);
}
.tp-sla-item { display: flex; flex-direction: column; gap: 3px; font-size: 13px; }
.tp-approval-list { display: flex; flex-direction: column; gap: 12px; }
.tp-approval-card { padding: 16px 18px; }
.tp-approval-card.overdue { border-color: color-mix(in srgb, var(--tp-danger) 45%, transparent); }
.tp-approval-head { display: flex; align-items: center; gap: 12px; }
.tp-approval-icon {
  width: 34px; height: 34px; flex: none; border-radius: 10px;
  display: grid; place-items: center;
  background: var(--tp-surface-3); color: var(--tp-text-2);
}
.tp-approval-icon.warn { background: var(--tp-warn-soft); color: var(--tp-warn); }
.tp-approval-icon.danger { background: var(--tp-danger-soft); color: var(--tp-danger); }
.tp-approval-icon.success { background: var(--tp-success-soft); color: var(--tp-success); }
.tp-approval-title-block { flex: 1; min-width: 0; }
.tp-approval-title { font-size: 13.5px; font-weight: 650; }
.tp-approval-sub { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; font-size: 12px; color: var(--tp-text-3); margin-top: 2px; }
.tp-approval-status { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex: none; }
.tp-approval-reason {
  display: flex; align-items: flex-start; gap: 7px;
  margin: 11px 0; padding: 9px 11px;
  border-radius: var(--tp-radius-md);
  background: var(--tp-surface-2); color: var(--tp-text-2); font-size: 12.5px;
}
.tp-approval-reason svg { flex: none; margin-top: 2px; }
.tp-approval-grid {
  display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 16px;
  padding: 12px 0; border-top: 1px solid var(--tp-border-soft);
  border-bottom: 1px solid var(--tp-border-soft); margin-bottom: 12px;
}
.tp-approval-actions { display: flex; align-items: center; gap: 8px; }
.tp-approval-actions .tp-btn:first-child { margin-right: auto; }
.tp-risk-row { display: flex; align-items: center; gap: 9px; margin-top: 5px; }
.tp-risk-row .tp-progress { flex: 1; min-width: 60px; }
.tp-label { font-size: 11.5px; font-weight: 600; color: var(--tp-text-3); }
.tp-small { font-size: 11.5px; }
.tp-stack { display: flex; flex-direction: column; gap: 14px; }
.tp-dot-sep { width: 3px; height: 3px; flex: none; border-radius: 50%; background: var(--tp-text-3); }
.tp-danger-text { color: var(--tp-danger); }
.tp-warn-text { color: var(--tp-warn); }
.tp-success-text { color: var(--tp-success); }
.tp-drawer-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; width: 100%; }

/* ---------- callouts ---------- */
.tp-callout {
  padding: 12px 14px; border-radius: var(--tp-radius-md);
  background: var(--tp-surface-2); border: 1px solid var(--tp-border-soft);
  display: flex; flex-direction: column; gap: 4px;
}
.tp-callout.info { background: var(--tp-info-soft); border-color: transparent; }
.tp-callout.success { background: var(--tp-success-soft); border-color: transparent; }
.tp-callout.warn { background: var(--tp-warn-soft); border-color: transparent; }
.tp-callout.danger { background: var(--tp-danger-soft); border-color: transparent; }
.tp-callout-title { display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 650; }
.tp-callout-body { font-size: 12.5px; color: var(--tp-text); }
.tp-callout-detail { font-size: 11.5px; color: var(--tp-text-2); }

/* ---------- dashboard lists ---------- */
.tp-attention { display: flex; flex-direction: column; }
.tp-attention-row {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 10px 2px; border: 0; border-bottom: 1px solid var(--tp-border-soft);
  background: transparent; color: var(--tp-text); font: inherit; text-align: left; cursor: pointer;
}
.tp-attention-row:last-child { border-bottom: 0; }
.tp-attention-row:hover { background: var(--tp-hover); }
.tp-attention-icon {
  width: 28px; height: 28px; flex: none; border-radius: 8px;
  display: grid; place-items: center; background: var(--tp-surface-3); color: var(--tp-text-2);
}
.tp-attention-icon.danger { background: var(--tp-danger-soft); color: var(--tp-danger); }
.tp-attention-icon.warn { background: var(--tp-warn-soft); color: var(--tp-warn); }
.tp-attention-icon.info { background: var(--tp-info-soft); color: var(--tp-info); }
.tp-attention-main { flex: 1; min-width: 0; }
.tp-attention-title { font-size: 12.5px; font-weight: 600; }
.tp-attention-detail { font-size: 11.5px; color: var(--tp-text-3); }
.tp-activity { display: flex; flex-direction: column; }
.tp-activity-row { display: flex; gap: 11px; padding: 9px 0; }
.tp-activity-node {
  width: 8px; height: 8px; flex: none; margin-top: 6px; border-radius: 50%;
  background: var(--tp-text-3); box-shadow: 0 0 0 4px var(--tp-surface-3);
}
.tp-activity-node.success { background: var(--tp-success); box-shadow: 0 0 0 4px var(--tp-success-soft); }
.tp-activity-node.warn { background: var(--tp-warn); box-shadow: 0 0 0 4px var(--tp-warn-soft); }
.tp-activity-node.danger { background: var(--tp-danger); box-shadow: 0 0 0 4px var(--tp-danger-soft); }
.tp-activity-main { flex: 1; min-width: 0; }
.tp-activity-title { font-size: 12.5px; }
.tp-activity-body { font-size: 11.5px; color: var(--tp-text-2); margin-top: 1px; }
.tp-activity-time { font-size: 10.5px; color: var(--tp-text-3); white-space: nowrap; }
.tp-leader-list { display: flex; flex-direction: column; }
.tp-leader-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 0; border: 0; border-bottom: 1px solid var(--tp-border-soft); background: transparent; color: var(--tp-text); font: inherit; text-align: left; cursor: pointer; }
.tp-leader-item:hover { background: var(--tp-hover); }
.tp-leader-item:last-child { border-bottom: 0; }
.tp-leader-main { flex: 1; min-width: 0; }
.tp-leader-name { font-size: 12.5px; font-weight: 600; }
.tp-leader-meta { font-size: 11px; color: var(--tp-text-3); }
.tp-mini-list { display: flex; flex-direction: column; gap: 2px; }
.tp-mini-item { display: flex; align-items: center; gap: 9px; width: 100%; padding: 7px 0; border: 0; background: transparent; color: var(--tp-text); font: inherit; text-align: left; cursor: pointer; border-radius: 8px; }
.tp-mini-item:hover { background: var(--tp-hover); }
.tp-mini-main { flex: 1; min-width: 0; }
.tp-mini-title { font-size: 12px; font-weight: 600; }
.tp-mini-sub { font-size: 11px; color: var(--tp-text-3); }
.tp-mini-meta { font-size: 11px; color: var(--tp-text-3); font-variant-numeric: tabular-nums; }
.tp-chart-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 10px; font-size: 11.5px; color: var(--tp-text-3); }
.tp-donut-row { display: flex; align-items: center; gap: 18px; }
.tp-donut-value { font-size: 20px; font-weight: 720; font-variant-numeric: tabular-nums; }
.tp-stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.tp-grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }
.tp-card-note { font-size: 11.5px; color: var(--tp-text-3); margin-top: 10px; }
.tp-footer-note { max-width: 1180px; width: 100%; margin: 0 auto; font-size: 11px; color: var(--tp-text-3); text-align: center; }
.tp-evidence-list { display: flex; flex-direction: column; }
.tp-evidence-row { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--tp-border-soft); font-size: 12px; }
.tp-evidence-row:last-child { border-bottom: 0; }
.tp-chain-line { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; }
.tp-chain-avatar { display: flex; }
.tp-chain-name { font-size: 12.5px; }
.tp-chain-detail { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 11.5px; color: var(--tp-text-3); margin-top: 3px; }

/* ---------- generic page helpers ---------- */
.tp-section-title { font-size: 13px; font-weight: 650; letter-spacing: -0.1px; margin: 0; }
.tp-hint { font-size: 11.5px; color: var(--tp-text-3); }
.tp-inline { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.tp-grow { flex: 1; min-width: 0; }
.tp-wrap { flex-wrap: wrap; }
.tp-chart { width: 100%; min-width: 0; }
.tp-list-clickable .tp-list-row { cursor: pointer; border-radius: var(--tp-radius-sm); }
.tp-list-clickable .tp-list-row:hover { background: var(--tp-hover); }
.tp-toolbar-end { margin-left: auto; }
.tp-tag-lg { height: 26px; padding: 0 10px; font-size: 12px; }
.tp-progress-row { display: flex; align-items: center; gap: 10px; }
.tp-progress-row .tp-progress { flex: 1; min-width: 60px; }
.tp-table .tp-th-right { text-align: right; }
.tp-table .tp-td-right { text-align: right; }
.tp-scroll-y { overflow-y: auto; }

@media (max-width: 980px) {
  .tp-sla-strip, .tp-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tp-grid-2-1 { grid-template-columns: minmax(0, 1fr); }
  .tp-approval-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .tp-main { padding: 16px 14px 32px; }
  .tp-tabs { padding: 0 12px; }
  .tp-sla-strip, .tp-stat-grid, .tp-approval-grid { grid-template-columns: minmax(0, 1fr); }
}


/* ---------- docked right-column console ---------- */
.tp-launcher {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; padding: 0; border: 1px solid transparent;
  border-radius: 9px; background: transparent; cursor: pointer;
  color: var(--dsw-alias-label-secondary, var(--tp-text-2, #6e6e73));
  transition: background 0.15s ease, color 0.15s ease;
}
.tp-launcher:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(120, 120, 128, 0.12));
  color: var(--dsw-alias-label-primary, var(--tp-text, #1d1d1f));
}
.tp-launcher:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #0a6cff);
  outline-offset: 1px;
}

.tp-panel-root .tp-topbar {
  height: auto; min-height: 48px; flex-wrap: wrap;
  padding: 8px 10px; gap: 6px 8px;
}
.tp-panel-root .tp-brand { gap: 8px; }
.tp-panel-root .tp-brand-mark { width: 26px; height: 26px; border-radius: 8px; }
.tp-panel-root .tp-brand-name { font-size: 12.5px; }
.tp-panel-root .tp-brand-sub { display: none; }
.tp-panel-root .tp-topbar-right { gap: 4px; }
.tp-panel-root .tp-search-trigger { min-width: 0; width: 30px; padding: 0; justify-content: center; }
.tp-panel-root .tp-search-trigger span,
.tp-panel-root .tp-search-trigger kbd { display: none; }
.tp-panel-root .tp-search-pop {
  min-width: 0;
  width: min(360px, calc(100vw - 40px));
  right: 0;
}
.tp-panel-root .tp-account { padding: 0 4px; }
.tp-panel-root .tp-account-text,
.tp-panel-root .tp-account > .tp-icon { display: none; }
.tp-panel-root .tp-popover {
  min-width: 0;
  width: min(340px, calc(100vw - 40px));
  max-width: none;
}

.tp-panel-root .tp-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 2px; height: auto; padding: 6px 8px;
  overflow: visible;
}
.tp-panel-root .tp-tab {
  justify-content: center; gap: 5px;
  height: 40px; padding: 0 4px;
  flex-direction: column; font-size: 11px; line-height: 1.1;
}
.tp-panel-root .tp-tab span {
  max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.tp-panel-root .tp-tab-badge {
  position: absolute; top: 2px; right: 8px;
}
.tp-panel-root .tp-tab { position: relative; }

@container (min-width: 560px) {
  .tp-panel-root .tp-tabs { grid-template-columns: repeat(8, minmax(0, 1fr)); }
  .tp-panel-root .tp-tab { flex-direction: row; height: 30px; padding: 0 2px; font-size: 11.5px; }
}

@container (min-width: 760px) {
  .tp-panel-root .tp-tab { padding: 0 4px; font-size: 12px; }
}

/* Narrow docked column: drop the two secondary task columns; the task detail keeps them. */
@container (max-width: 759px) {
  .tp-panel-root .tp-tasks-table th:nth-child(7),
  .tp-panel-root .tp-tasks-table td:nth-child(7),
  .tp-panel-root .tp-tasks-table th:nth-child(8),
  .tp-panel-root .tp-tasks-table td:nth-child(8) { display: none; }
  .tp-panel-root .tp-audit-table th:nth-child(4),
  .tp-panel-root .tp-audit-table td:nth-child(4),
  .tp-panel-root .tp-audit-table th:nth-child(6),
  .tp-panel-root .tp-audit-table td:nth-child(6) { display: none; }
}

.tp-panel-root .tp-main { padding: 14px 12px 30px; }
.tp-panel-root .tp-page { gap: 13px; max-width: none; min-width: 0; margin: 0; }
.tp-panel-root .tp-page > * { min-width: 0; }
.tp-panel-root .tp-page-head { flex-wrap: wrap; align-items: flex-start; }
.tp-panel-root .tp-page-title { font-size: 18px; letter-spacing: -0.2px; }
.tp-panel-root .tp-page-desc { font-size: 12px; }
.tp-panel-root .tp-page-actions { width: 100%; justify-content: flex-start; }

.tp-panel-root .tp-grid-4,
.tp-panel-root .tp-grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.tp-panel-root .tp-grid-2,
.tp-panel-root .tp-grid-2-1,
.tp-panel-root .tp-span-2 { grid-template-columns: minmax(0, 1fr); grid-column: auto; }
.tp-panel-root .tp-approval-grid { grid-template-columns: 1.2fr 1fr 1fr; }
.tp-panel-root .tp-sla-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.tp-panel-root .tp-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.tp-panel-root .tp-hero { flex-wrap: wrap; }
.tp-panel-root .tp-hero-metrics { margin-left: 0; width: 100%; gap: 18px; }
.tp-panel-root .tp-hero-title { font-size: 16px; }

.tp-panel-root .tp-table-wrap { overflow-x: auto; }
.tp-panel-root .tp-table { min-width: 560px; }
.tp-panel-root .tp-card { padding: 14px 14px; }
.tp-panel-root .tp-toolbar { flex-wrap: wrap; }
.tp-panel-root .tp-modal-mask { position: absolute; inset: 0; padding: 16px; }
.tp-panel-root .tp-drawer-mask { position: absolute; inset: 0; padding: 0 }
.tp-panel-root .tp-drawer { position: absolute; top: 0; right: 0; bottom: 0; width: min(520px, calc(100% - 24px)); }
.tp-panel-root .tp-modal { width: min(520px, calc(100% - 24px)); max-height: 100%; }

/* ---- 体验模式说明 ---- */
.tp-mode-anchor { position: relative; display: inline-flex; align-items: center; }
.tp-mode-chip {
  display: inline-flex; align-items: center; gap: 6px;
  margin-left: 10px; padding: 3px 9px;
  border-radius: 999px; border: 1px solid var(--tp-border);
  background: var(--tp-surface-2); color: var(--tp-text-2);
  font-size: 11.5px; font-weight: 600; cursor: pointer;
}
.tp-mode-chip:hover { border-color: var(--tp-accent); color: var(--tp-text); }
.tp-mode-chip:focus-visible { outline: 2px solid var(--tp-accent); outline-offset: 1px; }
.tp-mode-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--tp-success); }
.tp-mode-pop {
  position: absolute; top: calc(100% + 8px); left: 0; z-index: 40;
  width: 296px; padding: 12px 14px; text-align: left;
  border-radius: 12px; border: 1px solid var(--tp-border);
  background: var(--tp-surface); box-shadow: var(--tp-shadow-lg);
}
.tp-mode-text { margin: 6px 0 0; font-size: 12px; line-height: 1.75; color: var(--tp-text-2); }

/* ---- 新手指引 ---- */
.tp-onboarding {
  margin-bottom: 14px; padding: 14px 16px;
  border: 1px solid var(--tp-border); border-radius: 14px;
  background: var(--tp-surface);
}
.tp-onboarding-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.tp-onboarding-title { font-size: 14px; font-weight: 700; }
.tp-onboarding-sub { margin-top: 3px; font-size: 12px; color: var(--tp-text-2); }
.tp-onboarding-close {
  flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 6px;
  border: 1px solid transparent; background: transparent; color: var(--tp-text-3); cursor: pointer;
}
.tp-onboarding-close:hover { background: var(--tp-surface-2); color: var(--tp-text); }
.tp-onboarding-steps {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 18px; margin: 12px 0 0; padding: 0; list-style: none;
}
.tp-onboarding-steps li { display: flex; gap: 8px; font-size: 12px; line-height: 1.7; color: var(--tp-text-2); }
.tp-onboarding-steps b { color: var(--tp-text); font-weight: 600; }
.tp-onboarding-index {
  flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; margin-top: 1px; border-radius: 50%;
  background: var(--tp-accent-soft); color: var(--tp-accent);
  font-size: 11px; font-weight: 700;
}
.tp-onboarding-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
@container (max-width: 560px) {
  .tp-onboarding-steps { grid-template-columns: 1fr; }
}

`

let injected = false

/**
 * Inject the product stylesheet into the document once.
 * @returns {void}
 */
export function ensureProductStyles() {
  if (injected || typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) {
    injected = true
    return
  }
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.dataset.dshTrustPlatform = ''
  style.textContent = CSS
  document.head.appendChild(style)
  injected = true
}
