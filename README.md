# DSH Trust Platform Plugin

Install this package into DeepSeek Harness to expose identity and payment-governance tools for multi-agent cross-border payment workflows.

## Install

```sh
npm install @00ccf/dsh-trust-platform
```

Enable the package in the DSH profile/package layer. The bundle patch mounts the function plugin and registers its tools through the Harness `tools` service.

## Tools

The plugin provides `register_identity`, `get_identity_status`, `verify_credential`, `check_authorization`, `create_payment_task`, `submit_operation_event`, `get_risk_decision`, `request_step_up`, `get_execution_receipt`, and `open_trace_case`.

The first release is an in-memory sandbox adapter. It deliberately has no `send_money` tool and cannot settle funds. `create_payment_task` only creates a handoff for an external Execution Gateway. Replace the stores and gateway boundary with the existing control-plane API before production use; connect real DID/VC, OIDC, policy, ledger, evidence, and key-management providers.

## Development

```sh
npm test
npm run pack:check
```

This package follows the DSH function-plugin contract: named exports `name`, `inject`, and `apply`, with no default export.
