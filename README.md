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
- Credential commitment that replaces sender-controlled boolean policy flags
- Selective-disclosure scenarios for audit/review use cases

## Programmable privacy extension

The UI demonstrates private payment policy flows without claiming that UI state is protocol enforcement.

The protocol PoC under `poc/policy-gated-note/` now enforces three conditions before assets can move:

1. the note's real sender must match the authorized issuer account ID committed in note storage,
2. the executing account must match the target account embedded in note storage, and
3. the spender must provide a private credential preimage whose hash matches the credential commitment embedded in note storage.

The issuer check uses Miden active-note sender metadata. Because the issuer account must create the note, authorization is inherited from the issuer account's normal transaction authentication rather than from an unauthenticated boolean stored by the sender.

This is a stronger educational model, but it has an explicit limitation: the issuer is also the note creator. A future design for an independent payer plus separate issuer should use a signed credential, policy account, attestation note, or ZK proof rather than duplicating issuer identity as plain storage data.

Read:

- [Programmable Privacy on Miden](docs/programmable-privacy.md)
- [Privacy + Compliance Scenarios](docs/privacy-compliance-scenarios.md)
- [Credential Commitment Model](poc/policy-gated-note/CREDENTIAL_MODEL.md)

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
    ├── CREDENTIAL_MODEL.md
    └── README.md
tests/
├── policy-gated-note.test.mjs
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
- [ ] Support independent payer + issuer attestation
- [ ] Bind credential contents to asset, policy version, expiry, and nonce
- [ ] Add executable Miden PASS/FAIL transaction fixtures
- [ ] Add testnet asset transfer form
- [ ] Add note consumption flow
- [ ] Add selective disclosure proof prototype
- [ ] Extract a minimal contribution-ready tutorial

## Security

This project is an educational testnet application and protocol PoC. Do not use test interfaces with valuable assets or treat the code as audited production software.

The current issuer-authenticated flow requires the issuer account to create the note. It does not yet verify a detached issuer signature for notes funded by an unrelated payer. Production compliance enforcement should additionally bind credential contents to asset, policy version, expiry, nonce, and revocation state.

## References

- [Miden documentation](https://docs.miden.xyz/)
- [Miden Web SDK](https://github.com/0xMiden/web-sdk)
- [Miden GitHub organization](https://github.com/0xMiden)

## License

MIT
