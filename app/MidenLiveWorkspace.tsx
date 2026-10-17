"use client";

import { useEffect, useRef, useState } from "react";
import { AccountInterface, MidenClient, NetworkId, NoteArray, createP2IDNote } from "@miden-sdk/miden-sdk/lazy";
import { buildPrivateOutputRequest, expectedBalances, parseAmount, readBalances, submitRequest, type Balances, type Receipt, type Transfer } from "./lib/private-transfer";

const STORE = "miden-private-notes-lab-v017";
type Wallet = { id: string; address: string };

export default function MidenLiveWorkspace() {
  const clientRef = useRef<MidenClient | null>(null);
  const locked = useRef(false);
  const [feeToken, setFeeToken] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("Initializing Miden v0.17");
  const [error, setError] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transfer, setTransfer] = useState<Transfer>({ sender: "", recipient: "", token: "", amount: "100" });
  const [balances, setBalances] = useState<Balances | null>(null);
  const [before, setBefore] = useState<Balances | null>(null);
  const [sent, setSent] = useState<Receipt | null>(null);
  const [consumed, setConsumed] = useState<Receipt | null>(null);
  const [verification, setVerification] = useState("");

  useEffect(() => {
    let active = true;
    let owned: MidenClient | null = null;
    void (async () => {
      try {
        await MidenClient.ready();
        owned = await MidenClient.createTestnet({ storeName: STORE, proverUrl: "local", autoSync: false });
        if (!active) { owned.terminate(); return; }
        clientRef.current = owned;
        const headers = await owned.accounts.list();
        const restored = headers.map(header => {
          const id = header.id();
          const wallet = { id: id.toString(), address: id.toBech32(NetworkId.testnet(), AccountInterface.BasicWallet) };
          id.free(); header.free(); return wallet;
        });
        await owned.syncChain();
        const feeId = await owned.feeFaucetId();
        const nativeToken = feeId.toString(); feeId.free();
        if (!active) return;
        setFeeToken(nativeToken);
        setWallets(restored);
        setTransfer(value => ({ ...value, sender: restored[0]?.id ?? "", recipient: restored[1]?.id ?? "", token: nativeToken }));
        setReady(true); setStage("Ready · sync manually before reading state");
      } catch (cause) { if (active) setError(message(cause)); }
    })();
    return () => { active = false; clientRef.current = null; owned?.terminate(); };
  }, []);

  async function run(action: (client: MidenClient) => Promise<void>) {
    if (locked.current || !clientRef.current) return;
    locked.current = true; setBusy(true); setError("");
    try { await action(clientRef.current); }
    catch (cause) { setError(message(cause)); setStage("Action stopped; inspect the transaction IDs below before retrying."); }
    finally { locked.current = false; setBusy(false); }
  }

  function edit(key: keyof Transfer, value: string) {
    setTransfer(current => ({ ...current, [key]: value })); setBalances(null); setBefore(null); setVerification("");
  }

  async function createWallet(client: MidenClient) {
    setStage("Creating a private Falcon wallet");
    const account = await client.accounts.create({ storage: "private", auth: "falcon" });
    const id = account.id();
    const wallet = { id: id.toString(), address: id.toBech32(NetworkId.testnet(), AccountInterface.BasicWallet) };
    id.free(); account.free();
    setWallets(current => [...current, wallet]);
    setTransfer(current => ({ ...current, sender: current.sender || wallet.id, recipient: current.sender && !current.recipient ? wallet.id : current.recipient }));
    setStage("Wallet created. Fund both accounts with free native testnet fee tokens before transacting.");
  }

  async function send(client: MidenClient) {
    const amount = parseAmount(transfer.amount);
    if (!transfer.sender || !transfer.recipient || transfer.sender === transfer.recipient) throw new Error("Choose two different local accounts.");
    const baseline = await readBalances(client, transfer);
    if (baseline.sender < amount) throw new Error("The sender has insufficient token balance. Fund it, consume funding notes, and sync first.");
    setBefore(baseline); setBalances(baseline);
    const note = createP2IDNote({ from: transfer.sender, to: transfer.recipient, assets: { token: transfer.token, amount }, type: "private" });
    const outputs = new NoteArray();
    outputs.push(note);
    const builder = await client.feeAwareTransactionRequestBuilder(transfer.sender);
    const request = buildPrivateOutputRequest(builder, outputs);
    note.free();
    try { await submitRequest(client, transfer.sender, request, setStage, setSent); }
    finally { request.free(); }
    setStage("Transfer confirmed. Deliver the private note, then consume it as the recipient.");
  }

  async function deliver(client: MidenClient) {
    if (!sent?.noteId) throw new Error("No submitted private note to deliver.");
    await client.transactions.waitFor(sent.txId, { timeout: 120_000 });
    const recipient = wallets.find(wallet => wallet.id === transfer.recipient);
    if (!recipient) throw new Error("Recipient wallet is unavailable.");
    setStage("Delivering through the Note Transport Service");
    await client.notes.sendPrivateOutput({ noteId: sent.noteId, to: recipient.address });
    await client.notes.fetchPrivate();
    await client.sync();
    setStage("Private note delivered and fetched. Ready to consume.");
  }

  async function consume(client: MidenClient) {
    if (!sent?.noteId || !before) throw new Error("Send and deliver a private note first.");
    await client.sync();
    const record = await client.notes.get(sent.noteId);
    if (!record) throw new Error("Note not found. Use Deliver / retry delivery first.");
    const note = record.toInputNote();
    const builder = await client.feeAwareTransactionRequestBuilder(transfer.recipient);
    const request = builder.withExplicitInputNote(note).build();
    builder.free();
    let receipt: Receipt;
    try { receipt = await submitRequest(client, transfer.recipient, request, setStage, setConsumed); }
    finally { request.free(); note.free(); record.free(); }
    await check(client, receipt);
  }

  async function check(client: MidenClient, consumeReceipt = consumed) {
    if (!sent || !consumeReceipt || !before) throw new Error("Both transactions must be submitted before verification.");
    await client.transactions.waitFor(sent.txId, { timeout: 120_000 });
    await client.transactions.waitFor(consumeReceipt.txId, { timeout: 120_000 });
    const after = await readBalances(client, transfer);
    setBalances(after);
    const expected = expectedBalances(before, transfer, sent.fees, consumeReceipt.fees);
    if (after.sender !== expected.sender || after.recipient !== expected.recipient) throw new Error(`Balance mismatch: expected sender ${expected.sender}, recipient ${expected.recipient}; observed ${after.sender}, ${after.recipient}. Other activity may have changed these accounts.`);
    setVerification("Verified: both confirmed balances match the transfer amount and actual fees.");
    setStage("Transfer and balances verified");
  }

  async function claimFunding(client: MidenClient, account: string) {
    if (!account) throw new Error("Choose an account first.");
    await client.sync();
    const available = await client.notes.listAvailable({ account });
    if (!available.length) throw new Error("No consumable funding notes. Request free testnet tokens from the faucet, then retry.");
    try {
      await client.transactions.consume({ account, notes: available, waitForConfirmation: true, timeout: 120_000 });
      setStage("Funding notes consumed. Read balances before sending.");
    } finally { available.forEach(note => note.free()); }
  }

  const disabled = !ready || busy;
  const frozen = busy || Boolean(sent);
  return <section className="panel transfer-panel">
    <div className="panel-heading"><div><span>LIVE TESTNET · SDK 0.17.3</span><h3>Private transfer lab</h3></div><small>{ready ? "Client ready" : "Initializing"}</small></div>
    <p>Create two browser-local private accounts. Fund both with free native testnet fee tokens for fees, and fund the sender with the asset you want to send. Amounts and fees below are raw base units.</p>
    <p>Stage 1 privacy: validators can decrypt and re-execute private inputs. This flow uses standard P2ID notes; the separate policy simulator is not enforced here.</p>
    <button className="primary-button" disabled={disabled || Boolean(sent)} onClick={() => void run(createWallet)}>Create private wallet</button>
    <div className="transfer-fields">
      {(["sender", "recipient"] as const).map(role => <label key={role}>{role === "sender" ? "Sender" : "Recipient"}<select value={transfer[role]} disabled={frozen} onChange={event => edit(role, event.target.value)}><option value="">Choose a local account</option>{wallets.map(wallet => <option key={wallet.id} value={wallet.id}>{wallet.id}</option>)}</select><small className="mono">{wallets.find(wallet => wallet.id === transfer[role])?.address}</small></label>)}
      <label>Token faucet ID (hex)<input value={transfer.token} disabled={frozen} onChange={event => edit("token", event.target.value.trim())} placeholder="0x…" /></label>
      <label>Amount (base units)<input inputMode="numeric" value={transfer.amount} disabled={frozen} onChange={event => edit("amount", event.target.value)} /></label>
    </div>
    <p className="mono">Network fee asset: {feeToken || "Loading from chain configuration…"}</p>
    <p><a href="https://faucet.testnet.miden.io" target="_blank" rel="noreferrer">Open testnet faucet</a> · Never use valuable assets in this educational lab.</p>
    <div className="transfer-actions">
      <button className="ghost-button" disabled={disabled || Boolean(sent)} onClick={() => void run(client => claimFunding(client, transfer.sender))}>Claim sender funding notes</button>
      <button className="ghost-button" disabled={disabled || Boolean(sent)} onClick={() => void run(client => claimFunding(client, transfer.recipient))}>Claim recipient funding notes</button>
      <button className="ghost-button" disabled={disabled} onClick={() => void run(async client => { setBalances(await readBalances(client, transfer)); setStage("Synced balances refreshed"); })}>Sync and read balances</button>
      <button className="primary-button" disabled={disabled || Boolean(sent)} onClick={() => void run(send)}>1. Send private note</button>
      <button className="ghost-button" disabled={disabled || !sent || Boolean(consumed)} onClick={() => void run(deliver)}>2. Deliver / retry delivery</button>
      <button className="primary-button" disabled={disabled || !sent || Boolean(consumed)} onClick={() => void run(consume)}>3. Consume as recipient</button>
      <button className="ghost-button" disabled={disabled || !consumed} onClick={() => void run(client => check(client))}>4. Verify confirmed balances</button>
    </div>
    <p role="status" aria-live="polite">{stage}</p>
    {error && <p role="alert" className="error-text">{error}</p>}
    {balances && <p className="mono">Sender: {balances.sender.toString()} · Recipient: {balances.recipient.toString()} base units</p>}
    {[sent, consumed].map((receipt, index) => receipt && <div key={index} className="transfer-receipt"><strong>{index === 0 ? "Send" : "Consume"} submitted</strong><p className="mono">Transaction: {receipt.txId}</p>{receipt.noteId && index === 0 && <p className="mono">Private note: {receipt.noteId}</p>}<p>Actual fee: {receipt.fees.length ? receipt.fees.map(fee => `${fee.amount} base units of ${fee.assetId}`).join(", ") : "No fee note in this execution"}</p></div>)}
    {verification && <p role="status">{verification}</p>}
    <p>Store: {STORE}. Older stores are left untouched. Keep this tab open until verification finishes; transaction receipts are held in this session.</p>
  </section>;
}

function message(cause: unknown) {
  return cause instanceof Error ? cause.message : String(cause);
}
