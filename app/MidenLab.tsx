"use client";

import { useMemo, useState } from "react";
import {
  MidenProvider,
  useCreateWallet,
  useMiden,
  useNotes,
} from "@miden-sdk/react/lazy";

type LabMode = "demo" | "testnet";

const demoNotes = [
  { id: "0x7a92…d14c", asset: "MID", amount: "48.00", status: "Committed", privacy: "Private" },
  { id: "0x3f18…a021", asset: "MID", amount: "12.50", status: "Expected", privacy: "Private" },
  { id: "0xb941…8e72", asset: "USDC", amount: "125.00", status: "Consumed", privacy: "Public" },
];

const proofSteps = [
  ["01", "Execute locally", "Account and note state transition"],
  ["02", "Generate proof", "Client-side STARK proof"],
  ["03", "Submit transaction", "Only commitments reach the network"],
];

function Logo() {
  return (
    <div className="brand-lockup" aria-label="Miden Private Notes Lab">
      <span className="brand-mark"><i /><i /><i /></span>
      <span><b>MIDEN</b><small>PRIVATE NOTES LAB</small></span>
    </div>
  );
}

function DemoWorkspace({ onConnect }: { onConnect: () => void }) {
  const [selected, setSelected] = useState(demoNotes[0].id);

  return (
    <WorkspaceFrame mode="demo" onConnect={onConnect}>
      <section className="metrics" aria-label="Demo metrics">
        <Metric label="Local accounts" value="01" meta="Private storage" />
        <Metric label="Tracked notes" value="03" meta="2 available" />
        <Metric label="Sync height" value="8,492" meta="Demo snapshot" />
        <Metric label="Proof target" value="LOCAL" meta="Client-side" accent />
      </section>

      <div className="workspace-grid">
        <section className="panel notes-panel">
          <PanelHeading eyebrow="NOTE EXPLORER" title="Private note inventory" action="Demo dataset" />
          <div className="note-table" role="table" aria-label="Sample Miden notes">
            <div className="note-row note-head" role="row"><span>Note ID</span><span>Asset</span><span>State</span><span>Privacy</span></div>
            {demoNotes.map((note) => (
              <button key={note.id} className={`note-row ${selected === note.id ? "selected" : ""}`} onClick={() => setSelected(note.id)} role="row">
                <span className="mono">{note.id}</span>
                <span><b>{note.amount}</b> <small>{note.asset}</small></span>
                <span><i className={`state-dot ${note.status.toLowerCase()}`} />{note.status}</span>
                <span className={`privacy-tag ${note.privacy.toLowerCase()}`}>{note.privacy}</span>
              </button>
            ))}
          </div>
          <div className="note-detail">
            <div><span>Selected note</span><strong className="mono">{selected}</strong></div>
            <button className="ghost-button" onClick={onConnect}>Inspect on testnet <span>↗</span></button>
          </div>
        </section>

        <aside className="panel proof-panel">
          <PanelHeading eyebrow="PROOF PIPELINE" title="Transaction lifecycle" action="Educational" />
          <div className="proof-flow">
            {proofSteps.map(([number, title, detail], index) => (
              <div className="proof-step" key={number}>
                <span className="step-index">{number}</span>
                <div><strong>{title}</strong><small>{detail}</small></div>
                <i className={index === 0 ? "active" : ""} />
              </div>
            ))}
          </div>
          <div className="proof-note"><span>◈</span><p>Execution data stays on the client. The dashboard labels every simulated value to avoid presenting demo data as network state.</p></div>
        </aside>
      </div>
    </WorkspaceFrame>
  );
}

function LiveWorkspace({ onDemo }: { onDemo: () => void }) {
  const { isReady, isInitializing, sync, error: clientError } = useMiden();
  const { createWallet, wallet, isCreating, error: walletError } = useCreateWallet();
  const { noteSummaries, consumableNoteSummaries, isLoading, refetch, error: notesError } = useNotes();
  const [syncing, setSyncing] = useState(false);

  const walletId = useMemo(() => {
    if (!wallet) return null;
    try { return wallet.id().toString(); } catch { return "Wallet created"; }
  }, [wallet]);

  async function handleSync() {
    setSyncing(true);
    try { await sync(); await refetch(); } finally { setSyncing(false); }
  }

  async function handleCreateWallet() {
    await createWallet({ storageMode: "private" });
  }

  return (
    <WorkspaceFrame mode="testnet" onConnect={onDemo}>
      <section className="live-banner panel">
        <div><span className={`connection-light ${isReady ? "ready" : ""}`} /><div><strong>{isReady ? "Miden testnet connected" : isInitializing ? "Initializing Miden WASM client" : "Client unavailable"}</strong><small>Official @miden-sdk/react lazy entry · local browser storage</small></div></div>
        <button className="ghost-button" onClick={handleSync} disabled={!isReady || syncing}>{syncing ? "Syncing…" : "Sync state"}</button>
      </section>

      <section className="metrics">
        <Metric label="Wallet" value={walletId ? "READY" : "NONE"} meta={walletId ? `${walletId.slice(0, 14)}…` : "Create locally"} accent={Boolean(walletId)} />
        <Metric label="Tracked notes" value={String(noteSummaries.length).padStart(2, "0")} meta={isLoading ? "Loading…" : "IndexedDB store"} />
        <Metric label="Consumable" value={String(consumableNoteSummaries.length).padStart(2, "0")} meta="Available to account" />
        <Metric label="Proof target" value="LOCAL" meta="Client-side prover" accent />
      </section>

      <div className="workspace-grid live-grid">
        <section className="panel wallet-panel">
          <PanelHeading eyebrow="LOCAL WALLET" title="Private account workspace" action="Testnet" />
          <div className="wallet-visual"><div className="wallet-orbit"><span>M</span></div><p>{walletId ?? "No local wallet yet"}</p></div>
          <button className="primary-button wide" onClick={handleCreateWallet} disabled={!isReady || isCreating}>{isCreating ? "Creating account…" : walletId ? "Create another private wallet" : "Create private wallet"}</button>
          <p className="error-text">{clientError?.message || walletError?.message || notesError?.message || ""}</p>
        </section>

        <section className="panel live-notes">
          <PanelHeading eyebrow="LIVE NOTES" title="Synced note summaries" action={`${noteSummaries.length} notes`} />
          {noteSummaries.length === 0 ? (
            <div className="empty-state"><span>◇</span><h3>No notes found</h3><p>Create or import a funded account, then sync the client to display note summaries here.</p></div>
          ) : (
            <div className="summary-list">{noteSummaries.slice(0, 5).map((note) => <div key={note.id}><span className="mono">{note.id.slice(0, 18)}…</span><strong>{note.assets.length} asset{note.assets.length === 1 ? "" : "s"}</strong></div>)}</div>
          )}
        </section>
      </div>
    </WorkspaceFrame>
  );
}

function WorkspaceFrame({ mode, onConnect, children }: { mode: LabMode; onConnect: () => void; children: React.ReactNode }) {
  return (
    <main className="lab-shell">
      <header className="topbar">
        <Logo />
        <nav aria-label="Project links"><a href="#workspace">Workspace</a><a href="#learn">How it works</a><a href="https://docs.miden.xyz/" target="_blank" rel="noreferrer">Docs ↗</a></nav>
        <button className={mode === "testnet" ? "mode-button connected" : "mode-button"} onClick={onConnect}><span />{mode === "testnet" ? "Return to demo" : "Connect testnet"}</button>
      </header>

      <section className="hero">
        <div className="hero-copy"><span className="kicker">PRIVATE BY DEFAULT · PROVE ON THE EDGE</span><h1>See how private value moves on <em>Miden.</em></h1><p>Explore notes, create a browser-local account, and follow the client-side proof lifecycle without hiding what is live and what is simulated.</p><div className="hero-actions"><button className="primary-button" onClick={onConnect}>{mode === "demo" ? "Connect to testnet" : "Explore demo mode"}<span>→</span></button><a className="text-link" href="https://github.com/0xMiden/web-sdk" target="_blank" rel="noreferrer">View Web SDK ↗</a></div></div>
        <div className="hero-art" aria-hidden="true"><div className="proof-disc"><span>M</span><i /><i /><i /></div><div className="commitment commitment-one">ACCOUNT<br/><b>LOCAL</b></div><div className="commitment commitment-two">PROOF<br/><b>CLIENT</b></div><div className="commitment commitment-three">CHAIN<br/><b>COMMIT</b></div></div>
      </section>

      <section id="workspace" className="workspace"><div className="section-title"><div><span>DEVELOPER WORKSPACE</span><h2>{mode === "demo" ? "Private transaction lab" : "Connected testnet client"}</h2></div><p>{mode === "demo" ? "Representative data · no network claims" : "Official Miden SDK · browser-local state"}</p></div>{children}</section>

      <section id="learn" className="learn-section"><span>WHY MIDEN</span><h2>Private state. Local execution. Verifiable outcomes.</h2><div className="learn-grid"><article><b>01</b><h3>Accounts</h3><p>Store application state publicly or privately while preserving programmable behavior.</p></article><article><b>02</b><h3>Notes</h3><p>Move assets and data through composable objects that can remain private to participants.</p></article><article><b>03</b><h3>Proofs</h3><p>Execute transactions and create proofs on the client before submitting commitments.</p></article></div></section>
      <footer><Logo /><p>Independent educational project. Not affiliated with or endorsed by Miden.</p><span>Built with the official Miden Web SDK</span></footer>
    </main>
  );
}

function Metric({ label, value, meta, accent = false }: { label: string; value: string; meta: string; accent?: boolean }) {
  return <article className={`metric-card ${accent ? "accent" : ""}`}><span>{label}</span><strong>{value}</strong><small>{meta}</small></article>;
}

function PanelHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action: string }) {
  return <div className="panel-heading"><div><span>{eyebrow}</span><h3>{title}</h3></div><small>{action}</small></div>;
}

export function MidenLab() {
  const [mode, setMode] = useState<LabMode>("demo");
  if (mode === "demo") return <DemoWorkspace onConnect={() => setMode("testnet")} />;
  return (
    <MidenProvider config={{ rpcUrl: "testnet", prover: "local", autoSyncInterval: 15000 }} loadingComponent={<LoadingScreen onDemo={() => setMode("demo")} />} errorComponent={(error) => <SdkError error={error} onDemo={() => setMode("demo")} />}>
      <LiveWorkspace onDemo={() => setMode("demo")} />
    </MidenProvider>
  );
}

function LoadingScreen({ onDemo }: { onDemo: () => void }) { return <div className="status-screen"><Logo /><div className="loader" /><h1>Initializing the Miden client</h1><p>Loading the WebAssembly client and browser-local store.</p><button className="ghost-button" onClick={onDemo}>Return to demo</button></div>; }
function SdkError({ error, onDemo }: { error: Error; onDemo: () => void }) { return <div className="status-screen"><Logo /><span className="error-symbol">!</span><h1>Testnet client could not start</h1><p>{error.message}</p><button className="primary-button" onClick={onDemo}>Explore demo mode</button></div>; }
