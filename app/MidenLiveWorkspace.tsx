"use client";

import { useMemo, useState } from "react";
import { MidenProvider, useCreateWallet, useMiden, useNotes } from "@miden-sdk/react/lazy";

function LiveContent() {
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

  return <>
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
        <button className="primary-button wide" onClick={() => createWallet({ storageMode: "private" })} disabled={!isReady || isCreating}>{isCreating ? "Creating account…" : walletId ? "Create another private wallet" : "Create private wallet"}</button>
        <p className="error-text">{clientError?.message || walletError?.message || notesError?.message || ""}</p>
      </section>
      <section className="panel live-notes">
        <PanelHeading eyebrow="LIVE NOTES" title="Synced note summaries" action={`${noteSummaries.length} notes`} />
        {noteSummaries.length === 0 ? <div className="empty-state"><span>◇</span><h3>No notes found</h3><p>Create or import a funded account, then sync the client to display note summaries here.</p></div> : <div className="summary-list">{noteSummaries.slice(0, 5).map((note) => <div key={note.id}><span className="mono">{note.id.slice(0, 18)}…</span><strong>{note.assets.length} asset{note.assets.length === 1 ? "" : "s"}</strong></div>)}</div>}
      </section>
    </div>
  </>;
}

function Metric({ label, value, meta, accent = false }: { label: string; value: string; meta: string; accent?: boolean }) {
  return <article className={`metric-card ${accent ? "accent" : ""}`}><span>{label}</span><strong>{value}</strong><small>{meta}</small></article>;
}

function PanelHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action: string }) {
  return <div className="panel-heading"><div><span>{eyebrow}</span><h3>{title}</h3></div><small>{action}</small></div>;
}

export default function MidenLiveWorkspace() {
  return <MidenProvider config={{ rpcUrl: "testnet", prover: "local", autoSyncInterval: 15000 }} loadingComponent={<div className="status-screen"><div className="loader" /><h1>Initializing the Miden client</h1><p>Loading the WebAssembly client and browser-local store.</p></div>} errorComponent={(error) => <div className="status-screen"><span className="error-symbol">!</span><h1>Testnet client could not start</h1><p>{error.message}</p></div>}><LiveContent /></MidenProvider>;
}
