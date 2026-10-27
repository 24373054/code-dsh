/**
 * Dashboard summary and Prometheus metrics for the embedded engine. The
 * summary is actor-scoped like the read routes: system actors see everything,
 * domain actors only see their own tasks and the records hanging off them.
 */
import { PLUGIN_NAME, SCHEMA_VERSION } from './core.js'

function actorDomain(actor) {
  if (!actor || actor.startsWith('system:')) return null
  const [type, namespace, domain] = String(actor).split(':')
  return type === 'did' && namespace === 'trust' && domain ? domain : null
}

export function createDashboardEngine(engine) {
  function tasksFor(domain) {
    const tasks = Object.values(engine.state.tasks || {})
    return domain === null ? tasks : tasks.filter((task) => (task.domain_id || task.domainId) === domain)
  }

  function summary(options = {}) {
    const actor = options.actor || engine.defaultActor()
    const domain = actorDomain(actor)
    const tasks = tasksFor(domain)
    const taskIds = new Set(tasks.map((task) => task.id))
    const concerns = (record) => taskIds.has(record.task_id || record.taskId)
    const events = Object.values(engine.state.events || {}).filter(concerns)
    const risks = Object.values(engine.state.risk_evidence || {}).filter(concerns)
    const interventions = Object.values(engine.state.interventions || {}).filter(concerns)
    const cases = Object.values(engine.state.cases || {}).filter(concerns)
    const caseIds = new Set(cases.map((record) => record.id))
    const snapshots = Object.values(engine.state.case_snapshots || {}).filter((snapshot) => caseIds.has(snapshot.case_id))

    const tasksByStatus = {}
    for (const task of tasks) {
      const status = task.status || 'UNKNOWN'
      tasksByStatus[status] = (tasksByStatus[status] || 0) + 1
    }
    const decisionsByAction = {}
    for (const intervention of interventions) {
      const action = intervention.action || 'UNKNOWN'
      decisionsByAction[action] = (decisionsByAction[action] || 0) + 1
    }
    const coverage =
      snapshots.length === 0
        ? 0
        : Math.round((snapshots.reduce((total, snapshot) => total + Number(snapshot.coverage || 0), 0) / snapshots.length) * 100) / 100
    const recentEvents = events
      .slice()
      .sort((left, right) => String(right.observed_at || right.created_at || '').localeCompare(String(left.observed_at || left.created_at || '')))
      .slice(0, 8)
      .map((event) => ({
        id: event.id,
        task_id: event.task_id || event.taskId || null,
        event_type: event.event_type || event.eventType || null,
        actor_did: event.actor_did || event.actorDid || null,
        observed_at: event.observed_at || null,
        finality: event.finality || 'OBSERVED',
      }))

    return {
      generated_at: engine.iso(),
      tasks_total: tasks.length,
      tasks_by_status: tasksByStatus,
      events_total: events.length,
      risks_total: risks.length,
      interventions_total: interventions.length,
      open_cases: cases.filter((record) => record.status === 'OPEN').length,
      cases_total: cases.length,
      decisions_by_action: decisionsByAction,
      coverage,
      recent_events: recentEvents,
    }
  }

  function metricHeader(help, type) {
    return [`# HELP ${help}`, `# TYPE ${help.split(' ')[0]} ${type}`]
  }

  /** Deterministic Prometheus text exposition; ends with a trailing newline. */
  function metricsText() {
    const tasks = Object.values(engine.state.tasks || {})
    const tasksByStatus = {}
    for (const task of tasks) {
      const status = task.status || 'UNKNOWN'
      tasksByStatus[status] = (tasksByStatus[status] || 0) + 1
    }
    const lines = []
    const tasksHelp = metricHeader('trust_tasks_total Payment tasks by status.', 'gauge')
    lines.push(tasksHelp[0], tasksHelp[1])
    for (const status of Object.keys(tasksByStatus).sort()) {
      lines.push(`trust_tasks_total{status="${status}"} ${tasksByStatus[status]}`)
    }
    const eventsHelp = metricHeader('trust_events_total Operation events recorded.', 'gauge')
    lines.push(eventsHelp[0], eventsHelp[1], `trust_events_total ${Object.keys(engine.state.events || {}).length}`)
    const risksHelp = metricHeader('trust_risk_decisions_total Risk evaluations recorded.', 'gauge')
    lines.push(risksHelp[0], risksHelp[1], `trust_risk_decisions_total ${Object.keys(engine.state.risk_evidence || {}).length}`)
    const interventionsHelp = metricHeader('trust_interventions_total Intervention decisions recorded.', 'gauge')
    lines.push(interventionsHelp[0], interventionsHelp[1], `trust_interventions_total ${Object.keys(engine.state.interventions || {}).length}`)
    const casesHelp = metricHeader('trust_cases_total Trace cases opened.', 'gauge')
    lines.push(casesHelp[0], casesHelp[1], `trust_cases_total ${Object.keys(engine.state.cases || {}).length}`)
    const pluginHelp = metricHeader('trust_plugin_info Embedded trust platform build info.', 'gauge')
    lines.push(pluginHelp[0], pluginHelp[1], `trust_plugin_info{name="${PLUGIN_NAME}",schema_version="${SCHEMA_VERSION}"} 1`)
    return `${lines.join('\n')}\n`
  }

  return { summary, metricsText }
}
