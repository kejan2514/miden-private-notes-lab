# Policy-gated note PoC

This directory contains educational Miden note-script PoCs for programmable privacy and compliance-style gating.

## Implemented models

### 1. Issuer-created credential note

`policy-gated-note.masm` authenticates the note creator as the issuer, binds consumption to the target account, and requires a matching private credential commitment before assets move.

This model is simple and strong, but couples the issuer and note creator.

### 2. Detached issuer attestation

`detached-attestation-payment.masm` separates payer and policy issuer.

The payer can create and fund the payment note. A separate policy authority creates an attestation note. The payment note requires that exact attestation note to be included as another transaction input and verifies:

1. the executing account matches the payment target,
2. the required attestation note is present among transaction inputs,
3. the attestation note sender matches the authorized issuer account, and
4. the attestation note storage commitment matches the commitment required by the payment note.

Assets move only after all four checks succeed.

## Why this matters

The detached model removes the earlier requirement that the policy issuer also fund or create the payment note. The issuer's authority comes from protocol-authenticated note metadata (`input_note::get_sender`), while the attestation payload is bound through the input note's storage commitment.

## Remaining work

The detached model is still an experimental scaffold. Before testnet claims, we need executable Miden fixtures that compile and exercise the full stack choreography with positive and negative transactions.

A production credential should bind at least recipient, asset or policy class, policy version, expiry, nonce, and revocation context.

This code is not audited production software.
