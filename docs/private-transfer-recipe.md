# Private P2ID transfer and testnet migration

## Version baseline

This repository previously used SDK 0.15.8. Both `@miden-sdk/miden-sdk` and `@miden-sdk/react` are now pinned to 0.17.3 in package.json and the lockfile. Use Node 22.18+ (native TypeScript stripping for the integration tests).

The shared September 14 article describes v0.16. On October 17, 2026, browser initialization with SDK 0.16.3 failed at the public testnet with `accept header validation failed (client version: 0.16.1)`. The latest stable 0.17.3 connected and created two private accounts. This is why this change targets 0.17 instead of stopping at 0.16.

The live workspace uses the single-threaded lazy SDK entry and a dedicated IndexedDB store, `miden-private-notes-lab-v017`. It does not clear or import an older store. Export old private notes using the matching old client before any manual reset; do not assume a cross-version import is supported.

## Run

```sh
npm ci
npm run dev
```

Select **Connect testnet**. The client discovers the current fee faucet from synced chain configuration and preselects it as the transferred token. This is the fee-issuing account ID, not the faucet service's distributing wallet address. Token amounts are raw base units; the UI does not guess decimals or dollar prices.

1. Create two private local wallets (Falcon auth). Their testnet Bech32 addresses appear below the selectors. Creation alone does not register or fund an account.
2. Open the official testnet faucet, request free native fee tokens for each address, then use **Claim sender funding notes** and **Claim recipient funding notes**. If registration or invitation enforcement is enabled, follow the network's registration process first; this lab does not bypass it.
3. Select distinct sender and recipient accounts. Choose a valid token faucet hex ID and a positive integer amount. Keep enough native fee tokens in both accounts. Native fee tokens and the transferred asset can be the same token.
4. **Sync and read balances** fetches current state. **Send private note** syncs again, captures the baseline, explicitly constructs a private P2ID note, executes, reads the actual fee, proves locally, submits, applies, and waits for commitment.
5. **Deliver / retry delivery** waits for send confirmation, streams the stored private output note through Note Transport Service, fetches private notes, and syncs. Retrying this step never submits a second transfer.
6. **Consume as recipient** imports the recorded input note into a fee-aware request, executes, proves, submits, applies and waits for confirmation.
7. **Verify confirmed balances** syncs and reads both vault balances again. The sender loses the amount plus its send fee if paid in the transferred token. The recipient gains the amount minus its consume fee if paid in that token. Fees in another token are displayed but do not affect this token's balance equation.

The UI locks the transfer parameters after send submission. A synchronous guard serializes complete action sequences. There is no background polling that can interleave WASM calls. Waits are bounded; a timeout does not mean rejection. Transaction IDs are saved to UI state immediately after successful submission, before persistence and confirmation, so a later failure does not enable the Send button again.

Keep the tab and live workspace open until verification completes. Receipts and the pre-transfer balance snapshot currently live in component state; reloading or switching to demo loses that workflow context. Account keys remain in the versioned browser store. Do not start another transfer to recover a pending one: inspect the recorded transaction and note IDs first. Do not transact from these accounts in another tab during verification.

## What is tested

```sh
npm run typecheck
npm run lint
npm test
```

The integration test uses the real native SDK and mock chain: creates private wallets and a test faucet, mints and consumes funding, builds a private P2ID note, executes and proves the send, commits a block, exports/imports the full private note file, consumes it, commits, syncs and checks balances (1000/0 → 900/100). A second consumption is rejected. This is an executable standard-note example, not a simulated ledger.

The mock test deliberately uses note-file import, not the public transport service, and its chain charges zero fees. Separate tests cover same-token and different-token fee accounting, large integer precision, invalid amounts, and receipt preservation when persistence fails after submission.

Browser checks: public testnet initialization and two private wallet creations succeeded. End-to-end public transport, fee payment and confirmation have not been certified: faucet token submission was blocked by the execution environment's automatic approval review, requiring the human operator to request the free tokens. Do not describe these unverified paths as a successful live transfer.

## Privacy boundary and follow-on contribution

Private inputs are encrypted in transit; in the current stage validators can decrypt and re-execute them. Standard P2ID transfers here do not enforce the four predicates in `masm/notes/private_stablecoin_policy.masm`. That file remains a policy scaffold and its present tests inspect fixture/layout consistency, not execution through a real custom-note transaction.

A useful next upstream contribution is a minimal, version-pinned private-transfer recipe with working transport and actual fee accounting. Check tutorials issue #227 and existing PRs before proposing overlapping work. The custom-policy execution fixture, issuer-authenticated policy state and disclosure binding remain separate work.

Sources: [official SDK repository](https://github.com/0xMiden/web-sdk), its version-matched packaged AGENTS.md/skills/types, [tutorials #227](https://github.com/0xMiden/tutorials/issues/227), and the attached v0.16 article.
