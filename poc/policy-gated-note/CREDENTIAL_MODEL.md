# Credential commitment model

This PoC replaces sender-controlled boolean policy flags with a single private credential proof.

## Flow

1. A policy issuer evaluates the intended recipient under whatever off-chain policy is required (for example recipient eligibility, asset policy, and jurisdiction rules).
2. The issuer provides the eligible recipient with a private credential preimage.
3. The note stores only the credential digest commitment together with the target account ID.
4. At consumption time, the recipient supplies the private credential as note arguments.
5. The note script hashes the supplied credential and requires it to equal the stored commitment.
6. The script also requires the executing account to equal the target account ID.
7. Assets move only if both checks pass.

## What this improves

The spender can no longer flip three public `1/0` policy values to make a payment pass. The spending condition is now possession of a secret whose digest was committed when the note was created.

## Remaining trust assumption

This is **not yet a cryptographic proof that an authorized issuer created the credential**. The PoC assumes the commitment placed into the note came from the intended policy authority.

A production design should replace that assumption with one of these patterns:

- a signature/attestation verified against an authorized issuer key,
- an on-chain policy account whose state is read or proven during consumption, or
- a zero-knowledge credential proof bound to the recipient, asset, policy version, and expiry.

## Recommended credential binding

The credential material should commit to at least:

- target account ID,
- asset/faucet ID or policy class,
- jurisdiction/policy identifier,
- policy version,
- expiry or validity window,
- a nonce to prevent credential reuse where required.

That prevents a valid credential for one context from being replayed in another.
