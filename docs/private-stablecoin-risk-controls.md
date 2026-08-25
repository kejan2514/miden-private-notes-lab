# Private stablecoin risk controls on Miden

> Design note for an educational proof of concept. The current UI is a simulator; this document describes a path toward enforcing equivalent rules with Miden primitives. It does not claim that the simulated controls are currently enforced on Miden testnet.

## Goal

Model a private stablecoin payment in which transaction details remain private to normal observers while programmable rules can prevent disallowed transfers and an explicitly authorized risk manager can receive limited disclosure.

The prototype focuses on three ideas:

1. **Private transfer** — value moves through a private Miden note rather than exposing the full payment payload publicly.
2. **Programmable risk controls** — note/account logic decides whether the payment may be consumed.
3. **Selective disclosure** — compliance evidence can be prepared for an authorized auditor without making the full transaction public.

## Actors

- **Alice** — sender.
- **Bob** — intended recipient.
- **Issuer / policy authority** — defines stablecoin policy inputs.
- **Risk manager** — authorized party that may receive narrowly scoped disclosure.
- **Public observer** — should not receive the private payment details.

## Policy model

The UI currently represents three policy checks:

| Rule | Purpose | Intended enforcement point |
| --- | --- | --- |
| Recipient freeze list | Reject a frozen or blocked recipient | Note script and/or controlled account component |
| Asset policy | Restrict the flow to an approved stablecoin asset | Note script |
| Jurisdiction policy | Require an approved policy state for the transfer route | Note inputs plus note/account logic |

A payment is consumable only when every required policy predicate evaluates to true.

## Proposed note flow

```text
Alice
  |
  | create private stablecoin note
  v
[ private note ]
  |  asset commitment
  |  amount / recipient data kept private as appropriate
  |  policy inputs / commitments
  v
Bob attempts consumption
  |
  +--> verify recipient policy
  +--> verify asset policy
  +--> verify jurisdiction/policy state
  |
  +--> PASS -> consume note and produce the next state/output note
  |
  +--> FAIL -> note cannot be consumed through the intended path
```

The exact representation of policy state should be chosen from current Miden account, note, and authentication primitives rather than inventing a separate trust layer.

## Freeze-list design

The UI toggle is only a simulation. A real implementation needs a verifiable policy input.

A practical design direction is:

1. The policy authority maintains a commitment to the current allow/freeze state.
2. The consumer supplies the witness required by the note/account logic.
3. The program verifies that the intended recipient satisfies the committed policy.
4. If the recipient is frozen, the transaction cannot satisfy the consumption conditions.

The PoC should prefer a small deterministic policy fixture first. Dynamic policy updates and issuer governance can be added only after the basic note path is tested.

## Selective disclosure

Selective disclosure must not be confused with making a private note public.

For this PoC, the intended disclosure record contains only what the policy requires, for example:

```text
policy_result = PASS
asset = USDC
amount = 100
counterparties = HIDDEN
```

A production design would need explicit authorization and cryptographic binding between the disclosure and the underlying transaction/note. The browser UI currently demonstrates the disclosure boundary only; it does not yet generate such a proof or encrypted auditor payload.

## Implementation plan

### Phase 1 — architecture simulator

- [x] Private-payment UI flow.
- [x] Recipient freeze-list simulation.
- [x] Asset-policy simulation.
- [x] Jurisdiction-policy simulation.
- [x] Risk-manager selective-disclosure preview.
- [x] Clear labels separating simulation from live testnet behavior.

### Phase 2 — deterministic Miden note prototype

- [ ] Create a minimal custom note script for the stablecoin-policy path.
- [ ] Encode a deterministic recipient policy fixture.
- [ ] Reject consumption when the recipient policy fails.
- [ ] Verify the expected asset before consumption.
- [ ] Add unit/integration tests for allowed and blocked transfers.

### Phase 3 — client integration

- [ ] Create the custom note through the official Miden client/Web SDK where supported.
- [ ] Execute/prove the transaction locally.
- [ ] Surface real note/transaction state separately from simulated policy examples.
- [ ] Keep private values out of logs and analytics.

### Phase 4 — selective disclosure experiment

- [ ] Define the minimum auditor disclosure schema.
- [ ] Bind the disclosure to the relevant note/transaction commitment.
- [ ] Add an explicit auditor authorization mechanism.
- [ ] Document what the auditor can and cannot learn.

## Tests we should require

At minimum, the executable prototype should cover:

1. approved recipient + approved asset + approved jurisdiction -> success;
2. frozen recipient -> failure;
3. unapproved asset -> failure;
4. disallowed jurisdiction/policy state -> failure;
5. changing a disclosed field invalidates its binding to the original transaction;
6. normal public observers do not receive the private fields used by the policy logic.

## Security and scope notes

- This repository is an independent educational project, not a stablecoin product or compliance system.
- A UI toggle is not a security control. Enforcement belongs in verifiable Miden program logic.
- The risk manager must not receive a universal view key by accident; disclosure should be deliberately scoped.
- Freeze-list freshness, issuer key management, revocation, recovery, and policy governance are production concerns and are intentionally outside the first PoC.
- No private keys, secrets, or personally identifying compliance data should be committed to the repository.

## Why this is useful

The experiment demonstrates the architectural distinction between **privacy from public observers** and **controlled disclosure to an authorized party**. Miden's programmable notes, private state, and client-side execution/proving make that distinction worth testing as executable code rather than treating privacy and policy as purely application-layer UI concepts.
