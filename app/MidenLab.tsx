"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ProgrammablePrivacy } from "./ProgrammablePrivacy";

type LabMode = "demo" | "testnet";

const MidenLiveWorkspace = dynamic(() => import("./MidenLiveWorkspace"), {
  ssr: false,
  loading: () => <div className="status-screen"><div className="loader" /><h1>Loading the Miden client</h1><p>Preparing the browser-only SDK.</p></div>,
});

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

      <ProgrammablePrivacy />
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
    <WorkspaceFrame mode="testnet" onConnect={() => setMode("demo")}>
      <MidenLiveWorkspace />
    </WorkspaceFrame>
  );
}
