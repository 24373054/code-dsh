![Trust Platform · the agent payment workspace](preview.svg)

# A trustworthy workspace for your AI agents

Every day your agents pay invoices, reconcile ledgers and settle with vendors. Trust Platform lets you run them
like a team: give each agent a budget and clear boundaries, let it work inside them, and only step in for the
things that fall outside.

## Why you need it

An AI agent that can spend money is not a chatbot. It can misread an invoice, be tricked by a fake email, or
quietly use its budget where it should not. The usual answer — an API key and a company card — gives it unlimited
authority. Trust Platform takes a different route: **write down what each agent may do, and keep a record of
everything it does.**

- Every agent has a job description and a payment budget.
- Unusual amounts, unfamiliar payees or over-budget payments stop and wait for you.
- Every payment keeps a checkable trail from authorization to settlement.

## What is inside

Trust Platform runs as a DSH plugin. One click on the workspace button in a conversation docks the console beside
the chat, so you can keep talking to your agent while clearing approvals.

| Page | What you do there |
| --- | --- |
| Overview | Today's items that need you, monthly volume, delegation health, 7-day trend and risk mix |
| Approvals | Clear the exceptions flagged by policy; approvals resume the task, rejections stop it with a record |
| Payment tasks | Follow each payment's progress, risk decision, executing agent and audit trail |
| Agents | Meet your agent team: duties, trust score, limits, success rate and recent activity |
| Delegations | Set each agent's single-payment cap, daily cap, validity window and allowed actions |
| Governance | Tune the block / escalate / throttle risk thresholds and publish new policy versions |
| Audit | Review escalated cases, evidence coverage and generate reports for finance and compliance |
| Settings | Workspace info, notification preferences, data export and reset |

## A typical day

1. **Start with the overview.** Three items are already ranked: an overdue review, a blocked payment, an escalated case.
2. **Clear the exceptions.** Open the review, check the risk score and the agent involved, then approve — the task resumes on its own.
3. **Check the boundaries.** Confirm each agent's caps in Delegations; expiring limits are flagged ahead of time.
4. **Deliver the audit.** Close the case in Audit and export the report for finance or compliance.

## Safety boundaries

- **Narrowing delegations.** Authority flows down like approval limits in a company: each level can only narrow the
  one above it, never widen it. Revoking or expiring a parent removes the child's authority immediately.
- **Exceptions only.** Low-risk payments go through, medium-risk ones are throttled, high-risk ones wait for a human,
  and clear anomalies are blocked. You only handle what policy flags.
- **Full audit trail.** Every authorization, approval and settlement writes an audit record with time, agent, amount
  and evidence.
- **Funds stay safe.** Trust Platform never moves money, never holds it and never stores a payment channel's keys:
  it decides *whether, by whom and with what evidence* a payment can happen, and the transfer itself is made by the
  payment channel you connect.
- **Data stays local.** Workspace data lives on this computer; nothing is uploaded.

## Data and privacy

- **Local first** — workspace data is stored on this machine; the product does not use any cloud service.
- **No telemetry** — the product never uploads workspace data or shares payment details with third parties.
- **Exportable** — download a full snapshot at any time for review, archiving or migration.
- **Recoverable** — restore the sample workspace with one click; records created while experimenting are cleared.

## Release notes

### 0.9.2 · Brand and details

- New brand mark: a solid suspension bridge for 星桥, consistent across the plugin card, the console header and the sidebar.
- Interface detail pass: consistent light/dark contrast for buttons, tags and status colors; no unfinished placeholder copy.
- The detail page and in-product explanations use final product language and only describe what the product does today.

### 0.9.0 · Product experience

- Product language across the workspace — fewer technical terms, words operations and finance teams already use.
- A three-step first-run guide plus a clearer 体验模式 note: data lives on this machine only.
- *Data and backup* supports exporting a workspace snapshot and restoring the sample workspace.

### 0.8.2 · Dark mode and readability

- Dark-mode contrast fixes: buttons, tags and status colors are readable in dark theme.
- Status tags get darker text in light theme so they no longer wash out.

### 0.8.0 · Dockable workspace

- The workspace docks beside the conversation, so you can approve and chat at the same time.
- Eight pages cover the loop from delegation, risk and payment to approval, audit and reporting.
- The sample workspace is fully interactive: approve/reject reviews, create payments, settle, revoke delegations,
  publish policies and export data.

### 0.7.0 · Multi-level delegations and signed settlement

- Delegation chains where every level can only narrow caps and actions.
- Signed settlement credentials and execution receipts make settlement results verifiable.
- Policy versions and risk-model versions can be published from the workspace.

## FAQ

**Where is my data stored?**
On this machine, in the plugin's data folder. See *Settings → Data and backup* to inspect the location or export a snapshot.

**Can I use real payments?**
The product never moves money, never holds it and never stores a payment channel's keys. It decides *whether, by whom
and with what evidence* a payment can happen and keeps a checkable record; the transfer itself is made by the payment
channel you connect.

**Does it upload my data?**
No. There is no telemetry and no cloud service; every request stays on this machine.

**Can a team use it together?**
This workspace is built for a single local deployment: data lives on this machine and the console starts with DSH.

---

Trust Platform is an auditable governance layer for agent payments: clear boundaries, exceptions handled by people,
and every payment on the record.
