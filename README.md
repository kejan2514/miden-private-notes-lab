# Miden Private Notes Lab

An interactive developer lab for exploring private notes, browser-local accounts, and client-side proving on Miden.

> Independent educational project. Not affiliated with or endorsed by Miden.

## Why this project exists

Miden moves transaction execution and proof generation to the client. That architecture is powerful, but it can be difficult to understand from code alone. This lab turns the account, note, and proof lifecycle into an inspectable interface.

## Features

- Clearly labeled demo workspace with representative note data
- Optional connection to Miden testnet through the official React SDK
- Browser-local private wallet creation
- Synced note summaries and consumable-note counts
- Manual client synchronization
- Visual explanation of local execution, proving, and submission
- Responsive interface with accessible controls

## Live data vs. demo data

The default screen uses representative values and labels them as demo data. Selecting **Connect testnet** initializes the official Miden Web SDK lazy entry. Only the connected screen displays SDK-derived account and note state.

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
tests/
└── rendered-html.test.mjs
```

## Roadmap

- [x] Build the private-note educational workspace
- [x] Add official Miden React SDK initialization
- [x] Add private wallet creation and note summaries
- [x] Separate demo values from live SDK state
- [ ] Add testnet asset transfer form
- [ ] Add note consumption flow
- [ ] Add transaction-stage timeline from live mutations
- [ ] Add encrypted local export/import guidance

## Security

This project is an educational testnet application. Do not use test interfaces with valuable assets or treat the code as audited production software.

## References

- [Miden documentation](https://docs.miden.xyz/)
- [Miden Web SDK](https://github.com/0xMiden/web-sdk)
- [Miden GitHub organization](https://github.com/0xMiden)

## License

MIT
