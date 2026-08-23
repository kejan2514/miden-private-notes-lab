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
- Programmable privacy design for private payments + policy checks
- Selective disclosure scenarios for audit/review use cases
- Responsive interface with accessible controls

## Programmable privacy extension

The lab now includes a design track focused on private payments with programmable policy conditions and scoped disclosure.

Read:

- [Programmable Privacy on Miden](docs/programmable-privacy.md)
- [Privacy + Compliance Scenarios](docs/privacy-compliance-scenarios.md)

The current policy examples are intentionally educational. UI simulations are not presented as protocol enforcement. The next implementation stage is to replace illustrative checks with real Miden-compatible note/account logic and deterministic tests.

## Live data vs. demo data

The default screen uses representative values and labels them as demo data. Selecting **Connect testnet** initializes the official Miden Web SDK lazy entry. Only the connected screen displays SDK-derived account and note state.

For the programmable-privacy track, the project distinguishes these categories explicitly:

- DEMO DATA
- SDK-DERIVED DATA
- LOCAL POLICY SIMULATION
- ON-CHAIN / PROTOCOL-ENFORCED CONDITION

## Technology

- React 19
- TypeScript
- `@miden-sdk/react`
- `@miden-sdk/miden-sdk`
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
├── MidenLab.tsx       # Interactive demo and connected SDK workspace
├── globals.css        # Responsive visual system
├── layout.tsx         # Metadata and application shell
└── page.tsx           # Home route
docs/
├── programmable-privacy.md
└── privacy-compliance-scenarios.md
tests/
└── rendered-html.test.mjs
```

## Roadmap

- [x] Build the private-note educational workspace
- [x] Add official Miden React SDK initialization
- [x] Add private wallet creation and note summaries
- [x] Separate demo values from live SDK state
- [x] Define programmable privacy architecture
- [x] Define privacy + compliance scenario matrix
- [ ] Add programmable privacy UI panel
- [ ] Add testnet asset transfer form
- [ ] Add note consumption flow
- [ ] Implement a real scripted policy condition
- [ ] Add selective disclosure proof prototype
- [ ] Add transaction-stage timeline from live mutations
- [ ] Add encrypted local export/import guidance
- [ ] Extract a minimal contribution-ready tutorial

## Security

This project is an educational testnet application. Do not use test interfaces with valuable assets or treat the code as audited production software.

Policy checks implemented only in the UI are explanatory and must not be treated as enforceable compliance controls. Real enforcement must live in protocol-relevant programs and be covered by tests.

## References

- [Miden documentation](https://docs.miden.xyz/)
- [Miden Web SDK](https://github.com/0xMiden/web-sdk)
- [Miden GitHub organization](https://github.com/0xMiden)

## License

MIT
