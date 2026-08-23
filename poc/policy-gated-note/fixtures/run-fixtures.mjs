import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fixtureUrl = new URL("./cases.json", import.meta.url);
const cases = JSON.parse(await readFile(fixtureUrl, "utf8"));

function evaluateDetachedAttestation(tx) {
  if (!tx.targetMatches) return "ERR_TARGET_ACCOUNT_MISMATCH";
  if (!tx.attestationPresent) return "ERR_ATTESTATION_NOT_FOUND";
  if (!tx.issuerMatches) return "ERR_ISSUER_ACCOUNT_MISMATCH";
  if (!tx.commitmentMatches) return "ERR_ATTESTATION_COMMITMENT_MISMATCH";
  return "PASS";
}

let passed = 0;
for (const fixture of cases) {
  const actual = evaluateDetachedAttestation(fixture);
  assert.equal(actual, fixture.expected, `${fixture.name}: expected ${fixture.expected}, got ${actual}`);
  console.log(`${fixture.name}: ${actual}`);
  passed += 1;
}

console.log(`fixtures: ${passed}/${cases.length} passed`);
