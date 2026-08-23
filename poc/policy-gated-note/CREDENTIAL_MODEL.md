# Issuer-authenticated credential model

This PoC replaces sender-controlled policy booleans with an issuer-authenticated credential commitment.

## Storage

The note stores:

- target account ID (2 felts)
- authorized issuer account ID (2 felts)
- credential digest (4 felts)

The credential preimage is supplied privately as note arguments and is not stored in note storage.

## Enforcement order

The note script performs three checks before assets can move:

1. **Issuer authentication** — `active_note::get_sender` must match the issuer account ID committed in storage.
2. **Recipient binding** — `active_account::get_id` must match the target account ID committed in storage.
3. **Credential possession** — the private credential preimage is hashed and must match the committed digest.

Only after all three checks succeed does the script call the basic wallet asset-move procedure.

## Why the issuer check is meaningful

The active-note sender is protocol metadata, not a caller-provided flag. Requiring it to match the issuer account means the issuer account itself must create the note. The note-creation transaction therefore inherits the issuer account's normal Miden authentication requirements.

This avoids pretending that a plain `issuer_id` field or `approved = 1` value proves authorization.

## Limitation

The current model couples **issuer** and **note creator/payer**. It does not yet support Alice funding a payment while a separate policy authority independently signs the credential.

A stronger next design can decouple those roles using one of these mechanisms:

- a detached issuer signature verified by the note or an account component,
- an on-chain policy account with an attestation procedure,
- a separate attestation note consumed in the same transaction,
- a ZK credential proof bound to issuer, recipient, asset, policy version, expiry, nonce, and revocation state.

## Security status

Educational PoC only. This code has not been audited and should not be used with valuable assets.
