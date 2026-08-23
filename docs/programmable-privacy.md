# Programmable Privacy on Miden

This design note extends **Miden Private Notes Lab** with a concrete privacy + compliance scenario inspired by the broader stablecoin privacy discussion.

> Educational proof of concept. This is not an audited compliance system, a stablecoin implementation, or legal advice.

## Goal

Demonstrate how a private payment flow can keep transaction details off the public state while still supporting policy checks and selective disclosure.

The target flow is:

```text
Alice
  |
  | creates private payment note
  v
Private Note
  |
  | note script / policy checks
  v
Policy Gate
  |\
  | \-- rejected -> note cannot be consumed under current policy
  |
  \---- approved
          |
          v
        Bob
          |
          | optional disclosure proof
          v
      Auditor / Risk Reviewer
```

## What is private?

The lab treats these fields as sensitive application data:

- sender identity
- receiver identity
- transfer amount
- payment reference / invoice metadata
- disclosure payloads

The public system should only need the commitments and proofs required by the protocol.

## What is programmable?

A payment is not just hidden data. Its spend conditions can encode application rules.

Example policy inputs:

```ts
export type ComplianceContext = {
  asset: string;
  amount: bigint;
  senderApproved: boolean;
  receiverApproved: boolean;
  assetAllowed: boolean;
  jurisdictionAllowed: boolean;
};
```

A minimal policy can be represented as:

```ts
export function canConsumePrivatePayment(ctx: ComplianceContext) {
  return (
    ctx.amount > 0n &&
    ctx.senderApproved &&
    ctx.receiverApproved &&
    ctx.assetAllowed &&
    ctx.jurisdictionAllowed
  );
}
```

This TypeScript is intentionally illustrative. In a production Miden design, enforceable spend conditions belong in the relevant note/account logic and must be represented by actual Miden programs and proofs.

## Selective disclosure model

The demo separates transaction privacy from auditability.

A user may reveal only the minimum evidence needed for a specific review, for example:

```text
Statement: "This payment is <= 1,000 units and used an approved asset."

Hidden:
- exact amount
- counterparty details
- invoice metadata

Revealed:
- policy result
- disclosure scope
- proof / verification status
```

This is preferable to making the full transaction graph public by default.

## Demo scenarios

### Scenario A — compliant private transfer

- Alice is approved.
- Bob is approved.
- Asset is allowed.
- Amount is positive.
- Jurisdiction policy passes.
- Private payment can proceed.

### Scenario B — blocked recipient

- Receiver approval fails.
- Payment remains private, but the policy gate rejects consumption.

### Scenario C — selective disclosure

- Transfer succeeds privately.
- User later generates a scoped disclosure object for a reviewer.
- Reviewer learns the policy result without receiving unrelated payment metadata.

## Threat model

This lab assumes:

- private application data can leak if copied into logs, analytics, screenshots, or browser storage;
- compliance metadata can itself become sensitive;
- a privileged reviewer key can become a high-value target;
- policy rules can be bypassed if enforced only in the UI;
- demo data must never be presented as live testnet state.

Therefore:

1. UI checks are explanatory only.
2. Enforceable rules should live in protocol-relevant programs.
3. Disclosure should be scoped, explicit, and user-visible.
4. Reviewer powers should be minimized and auditable.
5. Test interfaces should never be used with valuable assets.

## Proposed implementation phases

### Phase 1 — educational UI

Add a `Programmable Privacy` section to the existing lab with:

- private payment form
- policy switches
- pass/fail explanation
- selective disclosure preview
- clear DEMO badges

### Phase 2 — Miden testnet integration

Use the official SDK to:

- create a browser-local account;
- build a private note;
- show the transaction lifecycle;
- consume a note under a real scripted condition;
- keep all demo-only fields clearly separated from SDK-derived state.

### Phase 3 — contribution-ready tutorial

Extract the smallest reproducible example into a standalone tutorial that explains:

1. private note creation;
2. programmable spend conditions;
3. policy failure behavior;
4. selective disclosure architecture;
5. security limitations.

## Success criteria

The project is successful when a developer can answer all of these after using the lab:

- What data is public versus private?
- Where is a policy actually enforced?
- What happens when a policy fails?
- What can an auditor learn?
- What remains hidden from the auditor?
- Which parts are demo-only and which parts come from the Miden SDK?

## References

- Miden documentation: https://docs.miden.xyz/
- Miden GitHub: https://github.com/0xMiden
- Miden Web SDK: https://github.com/0xMiden/web-sdk
