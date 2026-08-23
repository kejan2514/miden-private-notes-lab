# Miden Private Notes Lab

An interactive developer lab for exploring private notes, browser-local accounts, client-side proving, and programmable privacy patterns on Miden.

> Independent educational project. Not affiliated with or endorsed by Miden.

## Why this project exists

Miden moves transaction execution and proof generation to the client. This lab turns the account, note, proof, and programmable-privacy lifecycle into an inspectable interface.

## Features

- Clearly labeled demo workspace with representative note data
- Optional connection to Miden testnet through the official React SDK
- Browser-local private wallet creation
- Synced note summaries and consumable-note counts
- Manual client synchronization
- Visual explanation of local execution, proving, and submission
- Programmable Privacy UI simulator for private payments + policy checks
- Protocol-level note PoC with target-account binding
- Issuer-authenticated credential note using active-note sender metadata
- Detached issuer-attestation payment scaffold that separates payer and policy authority
- Credential commitment that replaces sender-controlled boolean policy flags
- Selective-disclosure scenarios for audit/review use cases

## Programmable privacy extension

The UI demonstrates private payment policy flows without claiming that UI state is protocol enforcement.

The protocol PoC under `poc/policy-gated-note/` now contains two enforcement models.

### Issuer-created credential note

`policy-gated-note.masm` requires the note's sender to match the authorized issuer, binds consumption to the target account, and verifies a private credential commitment before assets move.

### Detached issuer attestation

`detached-attestation-payment.masm` separates payer and policy authority. The payer can fund the payment note while a distinct authority creates an attestation note. The payment note requires that exact attestation note in the same transaction and checks its sender and storage commitment using Miden input-note primitives before assets move.

This detached flow is intentionally labeled an experimental scaffold until executable Miden fixtures validate the exact stack choreography and positive/negative transactions.

Read:

- [Programmable Privacy on Miden](docs/programmable-privacy.md)
- [Privacy + Compliance Scenarios](docs/privacy-compliance-scenarios.md)
- [Credential Commitment Model](poc/policy-gated-note/CREDENTIAL_MODEL.md)
- [Policy-gated Note PoC](poc/policy-gated-note/README.md)

## Live data vs. demo data

The default screen uses representative values and labels them as demo data. Selecting **Connect testnet** initializes the official Miden Web SDK lazy entry. Only the connected screen displays SDK-derived account and note state.

The project distinguishes these categories explicitly:

- DEMO DATA
- SDK-DERIVED DATA
- LOCAL POLICY SIMULATION
- PROTOCOL-ENFORCED CONDITION

## Technology

- React 19
- TypeScript
- `@miden-sdk/react`
- `@miden-sdk/miden-sdk`
- Miden Assembly PoC note scripts
- vinext and Vite
- Cloudflare-compatible deployment output

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Production validation:

```bash
npm test
```

## Project structure

```text
app/
├── MidenLab.tsx
├── ProgrammablePrivacy.tsx
├── programmable-privacy.css
├── globals.css
├── layout.tsx
└── page.tsx
docs/
├── programmable-privacy.md
└── privacy-compliance-scenarios.md
poc/
└── policy-gated-note/
    ├── policy-gated-note.masm
    ├── detached-attestation-payment.masm
    ├── CREDENTIAL_MODEL.md
    └── README.md
tests/
├── policy-gated-note.test.mjs
├── detached-attestation-payment.test.mjs
└── rendered-html.test.mjs
```

## Roadmap

- [x] Build the private-note educational workspace
- [x] Add official Miden React SDK initialization
- [x] Add private wallet creation and note summaries
- [x] Separate demo values from live SDK state
- [x] Define programmable privacy architecture
- [x] Add Programmable Privacy UI panel
- [x] Add target-account recipient binding
- [x] Replace boolean policy flags with a credential commitment
- [x] Authenticate issuer by binding note sender metadata to the committed issuer account ID
- [x] Add independent payer + issuer attestation scaffold
- [ ] Bind credential contents to asset, policy version, expiry, and nonce
- [ ] Add executable Miden PASS/FAIL transaction fixtures
- [ ] Add testnet asset transfer form
- [ ] Add note consumption flow
- [ ] Add selective disclosure proof prototype
- [ ] Extract a minimal contribution-ready tutorial

## Security

This project is an educational testnet application and protocol PoC. Do not use test interfaces with valuable assets or treat the code as audited production software.

The detached issuer-attestation flow separates payer and policy authority by requiring a distinct authority-created input note in the same transaction. The current MASM implementation remains an experimental scaffold until executable transaction fixtures confirm the exact stack behavior. Production compliance enforcement should additionally bind credential contents to asset, policy version, expiry, nonce, and revocation state.

## References

- [Miden documentation](https://docs.miden.xyz/)
- [Miden Web SDK](https://github.com/0xMiden/web-sdk)
- [Miden GitHub organization](https://github.com/0xMiden)

## License

MIT
