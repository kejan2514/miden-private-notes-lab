# Miden Private Notes Lab

An interactive developer lab for exploring private notes, browser-local accounts, client-side proving, and programmable privacy patterns on Miden.

> Independent educational project. Not affiliated with or endorsed by Miden.

## Why this project exists

Miden moves transaction execution and proof generation to the client. That architecture is powerful, but it can be difficult to understand from code alone. This lab turns the account, note, proof, and privacy-policy lifecycle into an inspectable interface.

## Features

- Clearly labeled demo workspace with representative note data
- Optional connection to Miden testnet through the official React SDK
- Browser-local private wallet creation
- Synced note summaries and consumable-note counts
- Manual client synchronization
- Visual explanation of local execution, proving, and submission
- Private stablecoin risk-control simulator
- Deterministic Miden Assembly note-policy prototype
- Freeze-list, asset-policy, jurisdiction, and policy-active test vectors
- Scoped risk-manager disclosure preview
- Responsive interface with accessible controls

## Private stablecoin risk-control PoC

The current branch models a private stablecoin payment where a note may be consumed only when four deterministic policy predicates pass:

1. recipient is not frozen;
2. the asset-policy predicate passes;
3. the jurisdiction-policy predicate passes;
4. the policy is active.

The browser panel is explicitly a simulator. The protocol-facing experiment lives in [`masm/notes/private_stablecoin_policy.masm`](masm/notes/private_stablecoin_policy.masm), and its deterministic positive/negative vectors live in [`tests/fixtures/private-stablecoin-policy.json`](tests/fixtures/private-stablecoin-policy.json).

Read:

- [Private Stablecoin Risk Controls](docs/private-stablecoin-risk-controls.md)
- [Programmable Privacy on Miden](docs/programmable-privacy.md)
- [Privacy + Compliance Scenarios](docs/privacy-compliance-scenarios.md)

The MASM policy script is a deterministic enforcement scaffold, not a production compliance mechanism. The policy bits are fixtures stored in the note; dynamic issuer-authenticated policy commitments, live freeze-list freshness, and cryptographically bound selective disclosure remain separate follow-on work.

## Live data vs. demo data

The default screen uses representative values and labels them as demo data. Selecting **Connect testnet** initializes the official Miden Web SDK lazy entry. Only the connected screen displays SDK-derived account and note state.

For the programmable-privacy track, the project distinguishes these categories explicitly:

- DEMO DATA
- SDK-DERIVED DATA
- LOCAL POLICY SIMULATION
- MASM POLICY SCAFFOLD

## Technology

- React 19
- TypeScript
- `@miden-sdk/react`
- `@miden-sdk/miden-sdk`
- Miden Assembly note scripts
- Node.js test runner
- vinext and Vite
- Cloudflare-compatible deployment output

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Production validation builds the app and runs all render/policy tests:

```bash
npm test
```

## Project structure

```text
app/
├── MidenLab.tsx                    # Interactive demo and connected SDK workspace
├── MidenLiveWorkspace.tsx          # Official Miden React SDK testnet surface
├── ProgrammablePrivacy.tsx         # Stablecoin risk-control simulator
└── ProgrammablePrivacy.module.css
docs/
├── private-stablecoin-risk-controls.md
├── programmable-privacy.md
└── privacy-compliance-scenarios.md
masm/notes/
└── private_stablecoin_policy.masm  # Deterministic policy-gated note script
tests/
├── fixtures/private-stablecoin-policy.json
├── private-stablecoin-policy.test.mjs
└── rendered-html.test.mjs
```

## Roadmap

- [x] Build the private-note educational workspace
- [x] Add official Miden React SDK initialization
- [x] Add private wallet creation and note summaries
- [x] Separate demo values from live SDK state
- [x] Define programmable privacy architecture
- [x] Define privacy + compliance scenario matrix
- [x] Add programmable privacy UI panel
- [x] Add deterministic Miden Assembly policy note scaffold
- [x] Add deterministic allow/deny policy vectors
- [x] Add failure-path tests for recipient, asset, jurisdiction, and policy-active gates
- [ ] Create and consume this custom policy note through a real Miden client transaction fixture
- [ ] Replace fixture policy bits with issuer-authenticated policy commitments
- [ ] Bind selective disclosure cryptographically to a note/transaction commitment
- [ ] Add transaction-stage timeline from live mutations
- [ ] Extract a minimal contribution-ready tutorial after executable client integration

## Security

This project is an educational testnet application. Do not use test interfaces with valuable assets or treat the code as audited production software.

The UI checks are explanatory. The MASM note script demonstrates where deterministic enforcement can live, but its current policy bits are supplied as note-storage fixtures. A production design would need authenticated policy state, clear issuer authority, freshness/revocation rules, recipient binding, and executable integration tests against the current Miden client/toolchain.

## References

- [Miden documentation](https://docs.miden.xyz/)
- [Miden custom note tutorial](https://github.com/0xMiden/tutorials/blob/main/docs/src/rust-client/custom_note_how_to.md)
- [Miden Web SDK](https://github.com/0xMiden/web-sdk)
- [Miden GitHub organization](https://github.com/0xMiden)

## License

MIT
