"use client";

import { useMemo, useState } from "react";
import styles from "./ProgrammablePrivacy.module.css";

type PolicyState = {
  recipientAllowed: boolean;
  assetAllowed: boolean;
  jurisdictionAllowed: boolean;
};

const initialPolicy: PolicyState = {
  recipientAllowed: true,
  assetAllowed: true,
  jurisdictionAllowed: true,
};

export function ProgrammablePrivacy() {
  const [amount, setAmount] = useState("100");
  const [policy, setPolicy] = useState<PolicyState>(initialPolicy);
  const [disclosed, setDisclosed] = useState(false);

  const approved = useMemo(
    () => policy.recipientAllowed && policy.assetAllowed && policy.jurisdictionAllowed,
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
          <h3 id="programmable-privacy-title">Private payment policy simulator</h3>
        </div>
        <small>Educational PoC · simulated policy layer</small>
      </div>

      <div className={styles.flow} aria-label="Private payment flow">
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
              label="Recipient allowlist"
              detail="Bob is eligible to receive the private note"
              enabled={policy.recipientAllowed}
              onToggle={() => toggle("recipientAllowed")}
            />
            <Rule
              label="Asset policy"
              detail="USDC is permitted by the simulated policy"
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
              ? "All simulated policy checks pass. A real Miden implementation would enforce equivalent conditions in programmable note/account logic before consumption."
              : "At least one simulated rule fails, so this demo treats the private transfer as non-consumable."}
          </p>
          <button disabled={!approved} onClick={() => setDisclosed((value) => !value)}>
            {disclosed ? "Hide disclosure" : "Create selective disclosure"}
          </button>
          {disclosed && approved ? (
            <div className={styles.disclosure}>
              <span>DISCLOSED TO AUDITOR</span>
              <dl>
                <div><dt>Policy</dt><dd>Passed</dd></div>
                <div><dt>Asset</dt><dd>USDC</dd></div>
                <div><dt>Amount</dt><dd>{amount || "0"}</dd></div>
                <div><dt>Counterparties</dt><dd>Hidden</dd></div>
              </dl>
            </div>
          ) : null}
        </aside>
      </div>

      <p className={styles.disclaimer}>
        This panel is a UI-level policy simulator. It does not claim that these checks are currently enforced on testnet. The goal is to make the intended programmable-privacy architecture inspectable before wiring it to Miden note scripts or account components.
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
