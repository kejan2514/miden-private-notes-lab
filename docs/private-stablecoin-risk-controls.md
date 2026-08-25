# Private stablecoin risk controls on Miden

> Design note for an educational proof of concept. The browser UI is a simulator; the repository also contains a deterministic Miden Assembly note-policy scaffold. Neither should be treated as an audited stablecoin or compliance system.

## Goal

Model a private stablecoin payment in which transaction details remain private to normal observers while programmable rules can prevent disallowed transfers and an explicitly authorized risk manager can receive limited disclosure.

The prototype focuses on three ideas:

1. **Private transfer** — value moves through a private Miden note rather than exposing the full payment payload publicly.
2. **Programmable risk controls** — note logic gates consumption before assets are added to the consuming account.
3. **Selective disclosure** — the UI demonstrates a deliberately scoped risk-manager view without exposing the full transaction.

## Actors

- **Alice** — sender.
- **Bob** — intended recipient.
- **Issuer / policy authority** — defines stablecoin policy state in a future authenticated design.
- **Risk manager** — authorized party that may receive narrowly scoped disclosure.
- **Public observer** — should not receive the private payment details.

## Current deterministic note model

The Phase 2 MASM scaffold is [`masm/notes/private_stablecoin_policy.masm`](../masm/notes/private_stablecoin_policy.masm).

It reads one policy word from note storage:

```text
[recipient_allowed, asset_allowed, jurisdiction_allowed, policy_active]
```

Each field must equal `1`. The script checks the values before calling `wallet::add_assets_to_account`.

| Rule | Failure | Current representation |
| --- | --- | --- |
| Recipient freeze list | `ERROR_RECIPIENT_FROZEN` | deterministic `recipient_allowed` fixture bit |
| Asset policy | `ERROR_ASSET_BLOCKED` | deterministic `asset_allowed` fixture bit |
| Jurisdiction policy | `ERROR_JURISDICTION_BLOCKED` | deterministic `jurisdiction_allowed` fixture bit |
| Policy lifecycle | `ERROR_POLICY_INACTIVE` | deterministic `policy_active` fixture bit |

This proves the enforcement location and failure ordering. It does **not** yet authenticate who supplied the policy bits or prove that an asset-policy bit corresponds to a specific issuer asset.

## Deterministic test vectors

[`tests/fixtures/private-stablecoin-policy.json`](../tests/fixtures/private-stablecoin-policy.json) defines:

- one successful policy word;
- frozen-recipient failure;
- asset-policy failure;
- jurisdiction-policy failure;
- inactive-policy failure.

[`tests/private-stablecoin-policy.test.mjs`](../tests/private-stablecoin-policy.test.mjs) checks those vectors and verifies that the MASM source keeps every policy assertion before asset transfer.

## Note flow

```text
Alice
  |
  | creates private stablecoin note
  v
[ private note ]
  | policy word in note storage (Phase 2 fixture)
  v
Bob attempts consumption
  |
  +--> policy active?
  +--> jurisdiction allowed?
  +--> asset policy allowed?
  +--> recipient allowed?
  |
  +--> PASS -> add note assets to consuming account
  |
  +--> FAIL -> assertion stops the intended consumption path
```

## Freeze-list design beyond the fixture

The current toggle and note bit are not a production freeze-list system. A stronger design needs authenticated, fresh policy state.

A practical next direction is:

1. a policy authority commits to the current allow/freeze state;
2. the transaction supplies the witness required by note/account logic;
3. the program verifies recipient eligibility against the authenticated commitment;
4. stale or revoked policy state is rejected;
5. the authority and update mechanism are explicit and auditable.

## Selective disclosure

Selective disclosure must not be confused with making a private note public.

For this PoC, the browser preview reveals only a minimal review record such as:

```text
policy_result = PASS
asset = USDC
amount = 100
counterparties = HIDDEN
freeze_list_status = CLEAR
```

This is only a UX boundary today. A production design would need explicit authorization plus cryptographic binding between the disclosed statement and the underlying note/transaction commitment.

## Implementation status

### Phase 1 — architecture simulator

- [x] Private-payment UI flow.
- [x] Recipient freeze-list simulation.
- [x] Asset-policy simulation.
- [x] Jurisdiction-policy simulation.
- [x] Risk-manager selective-disclosure preview.
- [x] Clear labels separating simulation from live testnet behavior.

### Phase 2 — deterministic Miden note prototype

- [x] Create a minimal custom note script for the stablecoin-policy path.
- [x] Encode deterministic policy fixtures.
- [x] Reject consumption when recipient policy fails.
- [x] Reject consumption when the asset-policy predicate fails.
- [x] Reject consumption when jurisdiction policy fails.
- [x] Reject consumption when policy is inactive.
- [x] Add allow/deny test vectors and source-order enforcement tests.

### Phase 3 — executable Miden client integration

- [ ] Create the custom note through the current Miden client/toolchain.
- [ ] Execute/prove successful consumption locally.
- [ ] Execute negative fixtures and confirm assertion failures in the Miden VM/client.
- [ ] Bind the policy note to the intended recipient/account.
- [ ] Keep private values out of logs and analytics.

### Phase 4 — authenticated policy + selective disclosure

- [ ] Replace fixture bits with issuer-authenticated policy state.
- [ ] Define the minimum risk-manager disclosure schema.
- [ ] Bind disclosure to the relevant note/transaction commitment.
- [ ] Add explicit auditor authorization and revocation.
- [ ] Document exactly what the auditor can and cannot learn.

## Security and scope notes

- This repository is an independent educational project, not a stablecoin product or compliance system.
- A UI toggle is not a security control.
- The deterministic MASM policy bits are an enforcement scaffold, not authenticated policy state.
- A production asset check must verify the actual asset/issuer relationship rather than trust an `asset_allowed` bit.
- The risk manager must not receive a universal view key by accident; disclosure should be deliberately scoped.
- Freeze-list freshness, issuer key management, revocation, recovery, and policy governance are production concerns.
- No private keys, secrets, or personally identifying compliance data should be committed to the repository.

## Why this is useful

The experiment demonstrates the architectural distinction between **privacy from public observers** and **controlled disclosure to an authorized party**. The deterministic note script makes the policy gate concrete while keeping the current trust limitations visible instead of presenting UI simulation as protocol enforcement.
