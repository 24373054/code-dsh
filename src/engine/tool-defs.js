// Tool catalogue for the embedded trust engine. The descriptions are the
// agent-facing contract; handlers live in src/engine-tools.js. Generated from
// the retired control-plane catalogue and kept in sync by tmp/engine/gen-tool-defs.py.
export const TOOL_DEFS = [
  {
    "name": "register_identity",
    "description": "Register an agent identity (DID) with the embedded trust engine. Registration creates the domain when it does not exist yet and never grants payment authority.",
    "parameters": {
      "domain_id": {
        "type": "string",
        "description": "Domain to register the identity in, e.g. \"corp.example\"."
      },
      "subject_id": {
        "type": "string",
        "description": "Subject identifier within the domain."
      },
      "display_name": {
        "type": "string",
        "description": "Human-readable name for the identity."
      },
      "did": {
        "type": "string",
        "description": "Legacy DID argument; its domain and subject are reused when the other fields are absent."
      },
      "domain": {
        "type": "string",
        "description": "Legacy domain argument."
      },
      "jurisdiction": {
        "type": "string",
        "description": "Jurisdiction code; the service defaults to CN."
      }
    }
  },
  {
    "name": "get_identity_status",
    "description": "Read the authoritative status and DID document of a registered identity from the embedded trust engine.",
    "parameters": {
      "did": {
        "type": "string",
        "description": "DID, e.g. \"did:trust:corp.example:agent-7\"."
      }
    }
  },
  {
    "name": "verify_credential",
    "description": "Verify a verifiable credential with the embedded trust engine. Verification is authoritative and never assumes a credential is valid when data is missing.",
    "parameters": {
      "credential": {
        "type": "object",
        "description": "Verifiable credential JSON document to verify.",
        "additionalProperties": true
      },
      "credential_id": {
        "type": "string",
        "description": "Identifier of a credential already issued by the control plane."
      },
      "required_claims": {
        "type": "array",
        "description": "Claims that must be present for the credential to remain valid.",
        "items": {
          "type": "string"
        }
      }
    }
  },
  {
    "name": "check_authorization",
    "description": "Check whether a delegation authorizes a payment intent. The decision is deterministic and delegated: ACTIVE status, validity window, delegated action, subject binding, amount and daily limits, and asset scope must all pass. Missing data is DEFER, never ALLOW.",
    "parameters": {
      "delegation_id": {
        "type": "string",
        "description": "Delegation identifier to evaluate."
      },
      "did": {
        "type": "string",
        "description": "Payer DID expected by the delegation subject binding."
      },
      "beneficiary": {
        "type": "string",
        "description": "Payment beneficiary, recorded on the authorization."
      },
      "amount": {
        "type": "number",
        "description": "Payment amount to compare against delegation limits."
      },
      "currency": {
        "type": "string",
        "description": "Asset code; must match the delegation asset scope."
      },
      "action": {
        "type": "string",
        "description": "Delegated action to check; defaults to PAYREQ."
      },
      "task_id": {
        "type": "string",
        "description": "Optional task identifier; when given, the root delegation issuer must be the task requester."
      }
    }
  },
  {
    "name": "create_payment_task",
    "description": "Create a payment task in the embedded trust engine. With authorization_id (from check_authorization) it records an authorized intent to pay. Without authorization_id it opens a CREATED task draft from requester_did + amount, which a delegation can then reference. This never moves funds or settles value.",
    "parameters": {
      "authorization_id": {
        "type": "string",
        "description": "Authorization returned by check_authorization in this session. Optional: omit it to open a task draft."
      },
      "requester_did": {
        "type": "string",
        "description": "DID of the payment requester. Required in draft mode (no authorization_id)."
      },
      "amount": {
        "type": "number",
        "description": "Positive payment amount. Required in draft mode."
      },
      "asset_id": {
        "type": "string",
        "description": "Asset identifier for draft mode, for example USD. Defaults to the authorization asset otherwise."
      },
      "beneficiary": {
        "type": "string",
        "description": "Beneficiary account identifier for draft mode. Defaults to the authorized beneficiary otherwise."
      },
      "purpose": {
        "type": "string",
        "description": "Business purpose stored in task metadata."
      },
      "domain_id": {
        "type": "string",
        "description": "Domain override; derived from the requester or authorization DID by default."
      },
      "policy_version": {
        "type": "string",
        "description": "Policy version override."
      },
      "metadata": {
        "type": "object",
        "description": "Additional JSON metadata merged into the task.",
        "additionalProperties": true
      }
    }
  },
  {
    "name": "submit_operation_event",
    "description": "Submit an operation event for a payment task to the embedded trust engine. Events are observed records; they are not proof of settlement and may fail verification.",
    "parameters": {
      "task_id": {
        "type": "string",
        "description": "Payment task identifier."
      },
      "event_type": {
        "type": "string",
        "description": "Operation event type: DELEGATE, QUOTE, SELECT, PAYREQ, RESULT, BRIDGE, SETTLE."
      },
      "source_ref": {
        "type": "string",
        "description": "External reference of the observed operation (2-250 characters)."
      },
      "actor_did": {
        "type": "string",
        "description": "Actor that emits the event; defaults to the task requester."
      },
      "payload": {
        "type": "object",
        "description": "Event payload JSON object.",
        "additionalProperties": true
      },
      "finality": {
        "type": "string",
        "description": "Finality: OBSERVED, CONFIRMED, FINAL; defaults to OBSERVED."
      },
      "trace_id": {
        "type": "string",
        "description": "Optional trace identifier shared across events."
      },
      "counterparty_did": {
        "type": "string",
        "description": "Optional counterparty DID."
      }
    }
  },
  {
    "name": "get_risk_decision",
    "description": "Evaluate risk for a payment task. The risk decision never authorizes payment and never replaces check_authorization; it only informs it.",
    "parameters": {
      "task_id": {
        "type": "string",
        "description": "Payment task identifier."
      },
      "subject_did": {
        "type": "string",
        "description": "Subject DID to score; defaults to the task requester."
      },
      "event_id": {
        "type": "string",
        "description": "Optional operation event that belongs to the task."
      },
      "features": {
        "type": "object",
        "description": "Risk features: velocity, amount_deviation, new_counterparty, cross_chain_hops, identity_unknown.",
        "additionalProperties": true
      },
      "policy_version": {
        "type": "string",
        "description": "Optional policy version override."
      },
      "model_version": {
        "type": "string",
        "description": "Optional model version override."
      }
    }
  },
  {
    "name": "request_step_up",
    "description": "Create a real STEP_UP intervention decision in the embedded trust engine. The effective action may be downgraded by the engine; only STEP_UP satisfies the request.",
    "parameters": {
      "task_id": {
        "type": "string",
        "description": "Payment task identifier."
      },
      "reason": {
        "type": "string",
        "description": "Why stronger verification is required."
      },
      "event_id": {
        "type": "string",
        "description": "Optional operation event that triggered the request."
      },
      "rationale": {
        "type": "object",
        "description": "Additional rationale fields merged into the intervention rationale object.",
        "additionalProperties": true
      },
      "policy_version": {
        "type": "string",
        "description": "Optional policy version override."
      }
    }
  },
  {
    "name": "get_execution_receipt",
    "description": "Report the execution receipt for a payment task. The embedded engine only records a receipt after an explicitly allowed intervention execution; this tool never claims settlement.",
    "parameters": {
      "task_id": {
        "type": "string",
        "description": "Payment task identifier."
      }
    }
  },
  {
    "name": "execute_intervention",
    "description": "Execute an intervention decision and return the execution receipt. Execution is gated by the allowInterventionExecution setting; it never transfers funds.",
    "parameters": {
      "decision_id": {
        "type": "string",
        "description": "Intervention decision identifier to execute."
      }
    }
  },
  {
    "name": "check_service_health",
    "description": "Check embedded trust-engine liveness and readiness. Read-only diagnostic; readiness may be false while the engine still serves reads.",
    "parameters": {}
  },
  {
    "name": "resolve_identity_admission",
    "description": "Evaluate admission for an agent identity. Admission is advisory: it returns ALLOW, DEFER, BLOCK or UNKNOWN and never authorizes a payment.",
    "parameters": {
      "did": {
        "type": "string",
        "description": "Agent DID to evaluate."
      },
      "policy_version": {
        "type": "string",
        "description": "Policy version to evaluate against."
      },
      "required_actions": {
        "type": "array",
        "description": "Actions the identity must be admitted for.",
        "items": {
          "type": "string"
        }
      },
      "jurisdiction": {
        "type": "string",
        "description": "Optional jurisdiction scope."
      }
    }
  },
  {
    "name": "verify_remote_credential",
    "description": "Verify a verifiable credential against the embedded trust engine. Authoritative: VALID is required for success.",
    "parameters": {
      "credential": {
        "type": "object",
        "description": "Verifiable credential JSON document.",
        "additionalProperties": true
      },
      "required_claims": {
        "type": "array",
        "description": "Claims that must be present for the credential to stay valid.",
        "items": {
          "type": "string"
        }
      }
    }
  },
  {
    "name": "read_payment_task",
    "description": "Read one payment task from the embedded trust engine. Read-only.",
    "parameters": {
      "task_id": {
        "type": "string",
        "description": "Payment task identifier."
      }
    }
  },
  {
    "name": "list_payment_tasks",
    "description": "List payment tasks known to the embedded trust engine. Read-only.",
    "parameters": {}
  },
  {
    "name": "read_delegation",
    "description": "Read one delegation from the embedded trust engine. Read-only; reading a delegation never authorizes a payment.",
    "parameters": {
      "delegation_id": {
        "type": "string",
        "description": "Delegation identifier."
      }
    }
  },
  {
    "name": "list_delegations",
    "description": "List delegations, optionally filtered by payment task. Read-only.",
    "parameters": {
      "task_id": {
        "type": "string",
        "description": "Optional payment task identifier filter."
      }
    }
  },
  {
    "name": "verify_operation_event",
    "description": "Verify an operation event signature and identity context. Authoritative: success means the engine verified it.",
    "parameters": {
      "event_id": {
        "type": "string",
        "description": "Operation event identifier."
      }
    }
  },
  {
    "name": "evaluate_remote_risk",
    "description": "Evaluate risk for a payment task in the embedded trust engine. Risk informs but never authorizes payment.",
    "parameters": {
      "task_id": {
        "type": "string",
        "description": "Payment task identifier."
      },
      "subject_did": {
        "type": "string",
        "description": "Subject DID to score; defaults to the configured actor DID."
      },
      "event_id": {
        "type": "string",
        "description": "Optional operation event belonging to the task."
      },
      "features": {
        "type": "object",
        "description": "Risk features: velocity, amount_deviation, new_counterparty, cross_chain_hops, identity_unknown.",
        "additionalProperties": true
      },
      "policy_version": {
        "type": "string",
        "description": "Optional policy version override."
      },
      "model_version": {
        "type": "string",
        "description": "Optional model version override."
      }
    }
  },
  {
    "name": "read_risk_evidence",
    "description": "Read risk evidence recorded for a payment task. Read-only.",
    "parameters": {
      "task_id": {
        "type": "string",
        "description": "Payment task identifier."
      }
    }
  },
  {
    "name": "propose_intervention",
    "description": "Create an intervention decision in the embedded trust engine. This records a decision only; execution requires the separately gated execute_intervention tool.",
    "parameters": {
      "task_id": {
        "type": "string",
        "description": "Payment task identifier."
      },
      "action": {
        "type": "string",
        "description": "Intervention action: ALLOW, WARN, THROTTLE, STEP_UP, DEFER, BLOCK, FREEZE."
      },
      "event_id": {
        "type": "string",
        "description": "Optional operation event that triggered the decision."
      },
      "rationale": {
        "type": "object",
        "description": "Rationale object; the service expects a JSON object, not a string.",
        "additionalProperties": true
      },
      "policy_version": {
        "type": "string",
        "description": "Optional policy version override."
      }
    }
  },
  {
    "name": "read_interventions",
    "description": "List intervention decisions recorded by the embedded trust engine. Read-only.",
    "parameters": {}
  },
  {
    "name": "read_trace_context",
    "description": "Read the evidence graph of a trace case. Read-only; create the case with create_trace_case first.",
    "parameters": {
      "case_id": {
        "type": "string",
        "description": "Trace case identifier."
      }
    }
  },
  {
    "name": "search_trust_knowledge",
    "description": "Search the trust knowledge base. Read-only.",
    "parameters": {
      "query": {
        "type": "string",
        "description": "Search query (1-1000 characters)."
      },
      "jurisdiction": {
        "type": "string",
        "description": "Optional jurisdiction filter."
      },
      "effective_at": {
        "type": "string",
        "description": "Optional effective-at timestamp filter."
      },
      "limit": {
        "type": "number",
        "description": "Result limit, 1-20; the service defaults to 5."
      }
    }
  },
  {
    "name": "read_evidence",
    "description": "Read one evidence record. Read-only.",
    "parameters": {
      "evidence_id": {
        "type": "string",
        "description": "Evidence identifier."
      }
    }
  },
  {
    "name": "ingest_evidence",
    "description": "Register evidence with the embedded trust engine. Content hash must be 16-128 characters; anchoring and settlement are separate and never guaranteed.",
    "parameters": {
      "source_type": {
        "type": "string",
        "description": "Evidence source type (2-80 characters)."
      },
      "source_ref": {
        "type": "string",
        "description": "Evidence source reference (2-250 characters)."
      },
      "content_hash": {
        "type": "string",
        "description": "Content hash, 16-128 characters."
      },
      "case_id": {
        "type": "string",
        "description": "Optional trace case to attach the evidence to."
      },
      "sm3_hash": {
        "type": "string",
        "description": "Optional SM3 hash."
      },
      "content": {
        "type": "string",
        "description": "Optional raw content; its SHA-256 must equal content_hash."
      },
      "storage_uri": {
        "type": "string",
        "description": "Optional storage URI."
      },
      "metadata": {
        "type": "object",
        "description": "Optional evidence metadata object.",
        "additionalProperties": true
      }
    }
  },
  {
    "name": "create_trace_case",
    "description": "Create a trace case from the recorded evidence of a payment task. Read-only with respect to funds.",
    "parameters": {
      "task_id": {
        "type": "string",
        "description": "Payment task identifier to trace."
      }
    }
  },
  {
    "name": "read_report",
    "description": "Read a generated trust report by identifier. Read-only.",
    "parameters": {
      "report_id": {
        "type": "string",
        "description": "Report identifier."
      }
    }
  },
  {
    "name": "submit_governance_feedback",
    "description": "Record governance feedback for a case or subject. Requires submitted_by and a reason of 3-4000 characters.",
    "parameters": {
      "label": {
        "type": "string",
        "description": "Feedback label: CONFIRMED, FALSE_POSITIVE, WITHDRAWN, NEEDS_MORE_EVIDENCE."
      },
      "reason": {
        "type": "string",
        "description": "Feedback reason, 3-4000 characters."
      },
      "submitted_by": {
        "type": "string",
        "description": "Submitter DID or name; defaults to the configured actor DID."
      },
      "case_id": {
        "type": "string",
        "description": "Optional trace case identifier."
      },
      "subject_did": {
        "type": "string",
        "description": "Optional subject DID."
      },
      "evidence_refs": {
        "type": "array",
        "description": "Optional evidence identifiers supporting the feedback.",
        "items": {
          "type": "string"
        }
      }
    }
  },
  {
    "name": "read_dashboard_summary",
    "description": "Read the trust-engine governance dashboard summary. Read-only.",
    "parameters": {}
  },
  {
    "name": "query_audit_assistant",
    "description": "Ask the audit assistant a read-only question. draft_report queries require an idempotency key, which the engine records.",
    "parameters": {
      "tool": {
        "type": "string",
        "description": "Assistant tool: resolve_entity, get_timeline, trace_asset, replay_rule, rank_nodes, match_pattern, draft_report."
      },
      "arguments": {
        "type": "object",
        "description": "Tool arguments object passed to the assistant. Most tools require {task_id, case_id?}; for example get_timeline takes {task_id} and optionally case_id.",
        "additionalProperties": true
      }
    }
  },
  {
    "name": "create_delegation",
    "description": "Create a delegation that lets a subject act for the task requester. The engine enforces issuer authority, task/asset scope, limit and timezone rules; a delegation never moves funds.",
    "parameters": {
      "task_id": {
        "type": "string",
        "description": "Payment task the delegation is scoped to."
      },
      "issuer_did": {
        "type": "string",
        "description": "Issuer DID; must be the task requester for a root delegation."
      },
      "subject_did": {
        "type": "string",
        "description": "Subject DID receiving the authority."
      },
      "actions": {
        "type": "array",
        "description": "Delegated event actions (uppercased by the service): DELEGATE, QUOTE, SELECT, PAYREQ, RESULT, BRIDGE, SETTLE. Business verbs such as PAY are rejected with 422 ACTION_NOT_SUPPORTED.",
        "items": {
          "type": "string"
        }
      },
      "asset_id": {
        "type": "string",
        "description": "Asset scope; must equal the task asset."
      },
      "amount_limit": {
        "type": "number",
        "description": "Maximum amount per operation; must not exceed the task amount."
      },
      "daily_limit": {
        "type": "number",
        "description": "Maximum amount per day."
      },
      "valid_from": {
        "type": "string",
        "description": "ISO timestamp with timezone (naive timestamps are rejected)."
      },
      "valid_to": {
        "type": "string",
        "description": "ISO timestamp with timezone, in the future."
      },
      "parent_id": {
        "type": "string",
        "description": "Optional parent delegation for redelegation."
      },
      "can_redelegate": {
        "type": "boolean",
        "description": "Whether the subject may redelegate; defaults to false."
      },
      "claims": {
        "type": "object",
        "description": "Optional delegation claims object.",
        "additionalProperties": true
      }
    }
  },
  {
    "name": "revoke_delegation",
    "description": "Revoke a delegation. The engine requires the transition body shape even though the status is ignored.",
    "parameters": {
      "delegation_id": {
        "type": "string",
        "description": "Delegation identifier."
      },
      "reason": {
        "type": "string",
        "description": "Revocation reason, 3-1000 characters."
      }
    }
  },
  {
    "name": "issue_credential",
    "description": "Issue a verifiable credential. The engine enforces issuer authority and DID status; issuing never grants payment authority by itself.",
    "parameters": {
      "credential_type": {
        "type": "string",
        "description": "Credential type, e.g. AgentRegistrationCredential."
      },
      "issuer_did": {
        "type": "string",
        "description": "Active issuer DID."
      },
      "subject_did": {
        "type": "string",
        "description": "Active subject DID."
      },
      "claims": {
        "type": "object",
        "description": "Optional credential claims object.",
        "additionalProperties": true
      },
      "valid_from": {
        "type": "string",
        "description": "Optional validity start; defaults to now."
      },
      "valid_to": {
        "type": "string",
        "description": "Optional validity end; defaults to now + 365 days."
      }
    }
  },
  {
    "name": "read_credential",
    "description": "Read one credential record and its verifiable credential document. Read-only.",
    "parameters": {
      "credential_id": {
        "type": "string",
        "description": "Credential identifier."
      }
    }
  },
  {
    "name": "transition_payment_task",
    "description": "Transition a payment task to a new lifecycle state. The engine validates the allowed transition.",
    "parameters": {
      "task_id": {
        "type": "string",
        "description": "Payment task identifier."
      },
      "status": {
        "type": "string",
        "description": "Target task status: CREATED, AUTHORIZED, DELEGATING, QUOTING, SELECTED, PAYREQ_PENDING, SUBMITTED, CONFIRMED, AUDITED, CLOSED, FAILED, BLOCKED, DEFERRED, THROTTLED, PENDING_STEP_UP, CANCELLED."
      },
      "reason": {
        "type": "string",
        "description": "Transition reason, 3-1000 characters."
      }
    }
  },
  {
    "name": "create_trace_report",
    "description": "Generate a trust report for a traced case. Requires an existing case snapshot (create the case first).",
    "parameters": {
      "case_id": {
        "type": "string",
        "description": "Trace case identifier."
      }
    }
  },
  {
    "name": "list_identities",
    "description": "List every identity registered in the embedded trust engine. Read-only view of every registered identity.",
    "parameters": {}
  },
  {
    "name": "get_identity_keys",
    "description": "Read the key history for one identity. Read-only view of one identity key history.",
    "parameters": {
      "did": {
        "type": "string",
        "description": "Agent DID."
      }
    }
  },
  {
    "name": "rotate_identity_keys",
    "description": "Rotate the signing keys of an identity. Administrative write; needs an active DID and a reason.",
    "parameters": {
      "did": {
        "type": "string",
        "description": "Agent DID."
      },
      "public_key": {
        "type": "string",
        "description": "Optional new public key (service generates one when omitted)."
      },
      "private_key": {
        "type": "string",
        "description": "Optional new private key (development only)."
      },
      "reason": {
        "type": "string",
        "description": "Why the keys are rotated (3-1000 characters)."
      }
    }
  },
  {
    "name": "set_identity_status",
    "description": "Suspend, revoke or reactivate an identity. Administrative write; never grants payment authority by itself.",
    "parameters": {
      "did": {
        "type": "string",
        "description": "Agent DID."
      },
      "status": {
        "type": "string",
        "description": "Target identity status: ACTIVE, SUSPENDED, REVOKED."
      },
      "reason": {
        "type": "string",
        "description": "Why the status changes (3-1000 characters)."
      }
    }
  },
  {
    "name": "read_credential_status",
    "description": "Read the lifecycle status of one credential. Read-only view of one credential lifecycle status.",
    "parameters": {
      "credential_id": {
        "type": "string",
        "description": "Credential identifier."
      }
    }
  },
  {
    "name": "set_credential_status",
    "description": "Suspend, revoke or reactivate a credential. Administrative write; revocation is irreversible for payments.",
    "parameters": {
      "credential_id": {
        "type": "string",
        "description": "Credential identifier."
      },
      "status": {
        "type": "string",
        "description": "Target credential status: ACTIVE, SUSPENDED, REVOKED."
      },
      "reason": {
        "type": "string",
        "description": "Why the status changes (3-1000 characters)."
      },
      "actor_did": {
        "type": "string",
        "description": "Optional acting DID recorded in the audit trail."
      }
    }
  },
  {
    "name": "query_operation_events",
    "description": "List operation events, optionally filtered to one payment task. Read-only view of recorded operation events.",
    "parameters": {
      "task_id": {
        "type": "string",
        "description": "Optional payment-task identifier."
      }
    }
  },
  {
    "name": "read_operation_event",
    "description": "Read one operation event by identifier. Read-only view of one operation event.",
    "parameters": {
      "event_id": {
        "type": "string",
        "description": "Operation event identifier."
      }
    }
  },
  {
    "name": "anchor_evidence",
    "description": "Anchor an evidence record to the ledger trust anchor (development anchor is local). Administrative write.",
    "parameters": {
      "evidence_id": {
        "type": "string",
        "description": "Evidence record identifier."
      }
    }
  },
  {
    "name": "read_evidence_anchors",
    "description": "List the trust anchors for one evidence record. Read-only view of the trust anchors of one evidence record.",
    "parameters": {
      "evidence_id": {
        "type": "string",
        "description": "Evidence record identifier."
      }
    }
  },
  {
    "name": "list_trace_cases",
    "description": "List trace cases opened for audits. Read-only view of opened trace cases.",
    "parameters": {}
  },
  {
    "name": "read_trace_case",
    "description": "Read one trace case by identifier. Read-only view of one trace case.",
    "parameters": {
      "case_id": {
        "type": "string",
        "description": "Trace case identifier."
      }
    }
  },
  {
    "name": "read_case_trace",
    "description": "Read the saved trace snapshot of a case. Read-only view of a saved case trace snapshot.",
    "parameters": {
      "case_id": {
        "type": "string",
        "description": "Trace case identifier."
      }
    }
  },
  {
    "name": "list_case_reports",
    "description": "List the reports produced for one case. Read-only view of the reports of one case.",
    "parameters": {
      "case_id": {
        "type": "string",
        "description": "Trace case identifier."
      }
    }
  },
  {
    "name": "list_governance_policies",
    "description": "List published governance policies, optionally for one domain. Read-only view of published governance policies.",
    "parameters": {
      "domain_id": {
        "type": "string",
        "description": "Optional domain filter."
      }
    }
  },
  {
    "name": "publish_governance_policy",
    "description": "Publish a signed governance policy package. Administrative write; affects future admissions for the domain.",
    "parameters": {
      "policy_id": {
        "type": "string",
        "description": "Policy identifier (2-120 characters)."
      },
      "domain_id": {
        "type": "string",
        "description": "Domain the policy applies to."
      },
      "version": {
        "type": "string",
        "description": "Policy version (1-80 characters)."
      },
      "package": {
        "type": "json",
        "description": "Policy package object (validated by the service)."
      },
      "package_uri": {
        "type": "string",
        "description": "Optional package URI; defaults to inline://policy."
      },
      "signed_by": {
        "type": "string",
        "description": "DID that signed the package."
      },
      "signature": {
        "type": "string",
        "description": "Optional detached signature."
      },
      "rollback_version": {
        "type": "string",
        "description": "Optional version to roll back to."
      }
    }
  },
  {
    "name": "list_governance_models",
    "description": "List registered risk-model artifacts. Read-only view of registered risk-model artifacts.",
    "parameters": {
      "model_name": {
        "type": "string",
        "description": "Optional model-name filter."
      }
    }
  },
  {
    "name": "publish_governance_model",
    "description": "Register a risk-model artifact digest. Administrative write; the model itself is not executed here.",
    "parameters": {
      "model_id": {
        "type": "string",
        "description": "Model identifier (2-120 characters)."
      },
      "model_name": {
        "type": "string",
        "description": "Human-readable model name."
      },
      "digest": {
        "type": "string",
        "description": "Artifact digest (16-128 characters)."
      },
      "artifact_uri": {
        "type": "string",
        "description": "Where the artifact lives."
      },
      "metrics": {
        "type": "json",
        "description": "Optional evaluation metrics object."
      },
      "signed_by": {
        "type": "string",
        "description": "DID that signed the artifact."
      }
    }
  },
  {
    "name": "ingest_knowledge_document",
    "description": "Ingest an internal knowledge document used by the audit assistant and knowledge search. Administrative write.",
    "parameters": {
      "title": {
        "type": "string",
        "description": "Document title (2-300 characters)."
      },
      "content": {
        "type": "string",
        "description": "Document body (1-2,000,000 characters)."
      },
      "evidence_id": {
        "type": "string",
        "description": "Optional evidence record the document derives from."
      },
      "content_hash": {
        "type": "string",
        "description": "Optional content hash supplied by the caller."
      },
      "jurisdiction": {
        "type": "string",
        "description": "Jurisdiction scope; defaults to GLOBAL."
      },
      "effective_from": {
        "type": "string",
        "description": "Optional ISO-8601 effective-from time."
      },
      "effective_to": {
        "type": "string",
        "description": "Optional ISO-8601 effective-to time."
      },
      "access_level": {
        "type": "string",
        "description": "Visibility: PUBLIC, INTERNAL, RESTRICTED; defaults to INTERNAL."
      },
      "metadata": {
        "type": "json",
        "description": "Optional metadata object."
      }
    }
  },
  {
    "name": "publish_knowledge_document",
    "description": "Publish a knowledge document so search and the assistant can use it. Administrative write.",
    "parameters": {
      "document_id": {
        "type": "string",
        "description": "Knowledge document identifier."
      },
      "review_note": {
        "type": "string",
        "description": "Optional review note (max 2000 characters)."
      }
    }
  },
  {
    "name": "read_knowledge_document",
    "description": "Read one knowledge document by identifier. Read-only view of one knowledge document.",
    "parameters": {
      "document_id": {
        "type": "string",
        "description": "Knowledge document identifier."
      }
    }
  },
  {
    "name": "read_metrics",
    "description": "Read Prometheus-style metrics emitted by the embedded trust engine as text. Read-only diagnostic; the text may be truncated.",
    "parameters": {}
  },
  {
    "name": "read_delegation_chain",
    "description": "Read a delegation together with its full parent chain and effective scopes. The chain is returned root to leaf, effective limits are the intersection of the whole chain, and chain_trustworthy is false when a link is revoked, the chain is cyclic or the root issuer is not the task requester.",
    "parameters": {
      "delegation_id": {
        "type": "string",
        "description": "Delegation identifier, e.g. \"del_...\"."
      },
      "actor_did": {
        "type": "string",
        "description": "Optional DID performing the read; it must be allowed to access the task domain."
      }
    }
  },
  {
    "name": "settle_payment_task",
    "description": "Close the settlement loop with cryptographic evidence: signs a FINAL SETTLE event with the requester embedded Ed25519 key, verifies signature, identity, authorization and ledger, and only then advances the task CONFIRMED -> AUDITED -> CLOSED. Unsigned or unverified settlement is refused instead of claimed.",
    "parameters": {
      "task_id": {
        "type": "string",
        "description": "Payment task identifier in SUBMITTED status."
      },
      "amount": {
        "type": "number",
        "description": "Settlement amount; defaults to the task amount."
      },
      "settlement_ref": {
        "type": "string",
        "description": "Optional settlement reference used in the source_ref and payload."
      },
      "actor_did": {
        "type": "string",
        "description": "Optional settlement actor; defaults to the task requester DID."
      },
      "event_id": {
        "type": "string",
        "description": "Optional event id (must start with \"evt_\"); generated when omitted."
      },
      "event_time": {
        "type": "string",
        "description": "Optional ISO-8601 event time with timezone."
      },
      "observed_at": {
        "type": "string",
        "description": "Optional ISO-8601 observation time with timezone."
      },
      "trace_id": {
        "type": "string",
        "description": "Optional trace identifier."
      },
      "source_ledger": {
        "type": "json",
        "description": "Optional ledger evidence object; defaults to the embedded ledger with FINAL finality."
      },
      "policy_version": {
        "type": "string",
        "description": "Optional policy version recorded on the settlement event."
      }
    }
  }
]
