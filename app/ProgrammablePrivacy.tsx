"use client";

import { useMemo, useState } from "react";
import styles from "./ProgrammablePrivacy.module.css";

type PolicyState = {
  recipientFrozen: boolean;
  assetAllowed: boolean;
  jurisdictionAllowed: boolean;
};

const initialPolicy: PolicyState = {
  recipientFrozen: false,
  assetAllowed: true,
  jurisdictionAllowed: true,
};

export function ProgrammablePrivacy() {
  const [amount, setAmount] = useState("100");
  const [policy, setPolicy] = useState<PolicyState>(initialPolicy);
  const [disclosed, setDisclosed] = useState(false);

  const approved = useMemo(
    () => !policy.recipientFrozen && policy.assetAllowed && policy.jurisdictionAllowed,
    [policy],
  );

  const toggle = (key: keyof PolicyState) => {
    setPolicy((current) => ({ ...current, [key]: !current[key] }));
    setDisclosed(false);
  };

  return (
    <section className={styles.shell} aria-labelledby="programmable-privacy-title">
      <div className={styles.heading}>
        <div>
          <span>PROGRAMMABLE PRIVACY</span>
          <h3 id="programmable-privacy-title">Private stablecoin risk-control simulator</h3>
        </div>
        <small>Educational PoC · simulated policy layer</small>
      </div>

      <div className={styles.flow} aria-label="Private stablecoin payment flow">
        <article>
          <span>01</span>
          <strong>Alice</strong>
          <small>Private sender</small>
        </article>
        <i>→</i>
        <article className={styles.noteCard}>
          <span>02</span>
          <strong>{amount || "0"} USDC</strong>
          <small>Private note payload</small>
        </article>
        <i>→</i>
        <article>
          <span>03</span>
          <strong>Bob</strong>
          <small>Private recipient</small>
        </article>
      </div>

      <div className={styles.grid}>
        <div className={styles.controls}>
          <label>
            <span>Transfer amount</span>
            <div className={styles.amountField}>
              <input
                aria-label="Transfer amount"
                inputMode="decimal"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value.replace(/[^0-9.]/g, ""));
                  setDisclosed(false);
                }}
              />
              <b>USDC</b>
            </div>
          </label>

          <div className={styles.rules}>
            <Rule
              label="Recipient freeze list"
              detail={
                policy.recipientFrozen
                  ? "Bob is frozen and the private note must not be consumable"
                  : "Bob is not present on the simulated freeze list"
              }
              enabled={!policy.recipientFrozen}
              onToggle={() => toggle("recipientFrozen")}
            />
            <Rule
              label="Asset policy"
              detail="USDC is permitted by the simulated issuer policy"
              enabled={policy.assetAllowed}
              onToggle={() => toggle("assetAllowed")}
            />
            <Rule
              label="Jurisdiction policy"
              detail="Transfer route passes the simulated jurisdiction check"
              enabled={policy.jurisdictionAllowed}
              onToggle={() => toggle("jurisdictionAllowed")}
            />
          </div>
        </div>

        <aside className={`${styles.result} ${approved ? styles.pass : styles.fail}`}>
          <span className={styles.resultEyebrow}>POLICY RESULT</span>
          <strong>{approved ? "PASS" : "FAIL"}</strong>
          <p>
            {approved
              ? "All simulated controls pass. A real Miden implementation could encode equivalent checks in programmable note or account logic before the private asset can move."
              : "At least one simulated control fails, so this demo treats the private stablecoin transfer as non-consumable."}
          </p>
          <button disabled={!approved} onClick={() => setDisclosed((value) => !value)}>
            {disclosed ? "Hide risk-manager view" : "Create risk-manager disclosure"}
          </button>
          {disclosed && approved ? (
            <div className={styles.disclosure}>
              <span>DISCLOSED TO RISK MANAGER</span>
              <dl>
                <div><dt>Policy</dt><dd>Passed</dd></div>
                <div><dt>Asset</dt><dd>USDC</dd></div>
                <div><dt>Amount</dt><dd>{amount || "0"}</dd></div>
                <div><dt>Sender / recipient</dt><dd>Hidden</dd></div>
                <div><dt>Freeze-list status</dt><dd>Clear</dd></div>
              </dl>
            </div>
          ) : null}
        </aside>
      </div>

      <p className={styles.disclaimer}>
        This panel is a UI-level architecture simulator. It does not claim that stablecoin freeze lists, risk-manager disclosure, or jurisdiction checks are currently enforced on Miden testnet. The goal is to model how private transfers and explicit risk controls could coexist before wiring the design to Miden note scripts or account components.
      </p>
    </section>
  );
}

function Rule({ label, detail, enabled, onToggle }: { label: string; detail: string; enabled: boolean; onToggle: () => void }) {
  return (
    <button className={styles.rule} onClick={onToggle} aria-pressed={enabled}>
      <span className={enabled ? styles.on : styles.off} />
      <div>
        <strong>{label}</strong>
        <small>{detail}</small>
      </div>
      <b>{enabled ? "PASS" : "FAIL"}</b>
    </button>
  );
}
