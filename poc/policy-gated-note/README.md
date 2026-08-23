# Policy-gated note PoC

This directory contains an educational Miden note-script PoC for programmable privacy with issuer-authenticated credential gating.

## Current enforcement

Before assets move, the note script requires:

1. the active note sender to match the authorized issuer account ID stored in the note,
2. the executing account to match the intended target account ID, and
3. the private credential preimage to hash to the committed credential digest.

Because the issuer must be the actual note creator, issuance inherits the issuer account's normal Miden transaction authentication.

## Storage layout

Eight felts are used:

- target account suffix
- target account prefix
- issuer account suffix
- issuer account prefix
- four felts for the credential digest

## Important limitation

This model couples the issuer and note creator. It does not yet support an unrelated payer funding a note while a separate authority signs the credential. That next step should use a detached signature, policy account, attestation note, or ZK credential proof.

This is not audited production code.
