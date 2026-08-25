# Privacy + Compliance Scenarios

This file defines concrete test cases for the private-stablecoin programmable-privacy extension.

## Deterministic Phase 2 policy matrix

The current MASM scaffold stores one policy word as:

```text
[recipient_allowed, asset_allowed, jurisdiction_allowed, policy_active]
```

| Scenario | Recipient allowed | Asset allowed | Jurisdiction allowed | Policy active | Expected result |
| --- | --- | --- | --- | --- | --- |
| Happy path | yes | yes | yes | yes | allow |
| Frozen recipient | no | yes | yes | yes | `ERROR_RECIPIENT_FROZEN` |
| Unsupported asset policy | yes | no | yes | yes | `ERROR_ASSET_BLOCKED` |
| Jurisdiction rule fails | yes | yes | no | yes | `ERROR_JURISDICTION_BLOCKED` |
| Policy inactive | yes | yes | yes | no | `ERROR_POLICY_INACTIVE` |

These cases are encoded in `tests/fixtures/private-stablecoin-policy.json` and checked by `tests/private-stablecoin-policy.test.mjs`.

## Selective disclosure cases

### Risk manager needs payment review

The UI preview may reveal:

- policy passed;
- asset label used by the simulator;
- transfer amount used by the simulator;
- freeze-list status.

It keeps sender and recipient identities hidden in the preview.

This is **not** yet a cryptographic disclosure proof. A real implementation must bind the disclosure to a note or transaction commitment and authenticate the reviewer.

### User declines disclosure

Expected behavior:

- transaction privacy remains unchanged;
- UI explains that disclosure is optional in the educational model;
- no fake proof or reviewer verification result is displayed.

## Data labels

The interface and documentation should distinguish these states:

```text
DEMO DATA
SDK-DERIVED DATA
LOCAL POLICY SIMULATION
MASM POLICY SCAFFOLD
```

The interface must never present simulated policy state as live network enforcement.

## Non-goals

This project does not claim to provide:

- production KYC/AML compliance;
- sanctions screening;
- legal jurisdiction determination;
- an audited stablecoin contract;
- authenticated live freeze-list infrastructure;
- cryptographically bound auditor disclosure today;
- guaranteed confidentiality against browser, endpoint, or operational leakage.

## Contribution checklist

Before extracting this work into an upstream tutorial:

- [x] Add a Miden-compatible deterministic note-policy scaffold.
- [x] Add deterministic test vectors.
- [x] Add failure-path tests.
- [x] Document public/private and simulated/enforced boundaries.
- [x] Explain current trusted-role limitations.
- [x] Remove claims that cannot be demonstrated in code.
- [ ] Execute the custom note through the current Miden client/toolchain.
- [ ] Replace fixture bits with issuer-authenticated policy state.
- [ ] Add cryptographically bound selective disclosure.
