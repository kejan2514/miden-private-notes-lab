# Policy-gated private note PoC

This directory moves the Programmable Privacy demo one layer closer to protocol enforcement.

## Goal

A private payment note should only be consumable when its policy conditions pass. The note script is the enforcement boundary: failed assertions abort consumption before assets are received.

## Current scaffold

`policy-gated-note.masm` targets the Miden 0.15 note-script shape (`@note_script` + `pub proc main`). It models three gates:

1. recipient is allowed
2. asset is allowed
3. jurisdiction is allowed

All three must equal `1` before the receive path can execute.

## Security boundary

The current flags are **PoC inputs**, not trusted compliance facts. A sender could otherwise choose `1,1,1`. Production enforcement therefore requires the flags to be replaced by verifiable evidence, for example:

- an authorized policy/account component,
- a commitment plus proof checked by the script/account,
- or a trusted attestation whose authority is bound in account state.

This distinction is intentional: the repository must not claim real compliance enforcement until the policy facts are cryptographically authenticated.

## Next implementation milestones

- Match the current Miden 0.15 standard P2ID recipient-binding flow.
- Replace boolean policy inputs with authenticated policy evidence.
- Compile the script with the Miden 0.15 toolchain.
- Add positive and negative execution tests.
- Wire note creation/consumption into the browser lab and testnet client.

## Expected tests

| recipient | asset | jurisdiction | result |
|---|---|---|---|
| 1 | 1 | 1 | consume allowed |
| 0 | 1 | 1 | abort |
| 1 | 0 | 1 | abort |
| 1 | 1 | 0 | abort |

This is an educational protocol PoC and is not audited production code.
