import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const runner = new URL("../poc/policy-gated-note/fixtures/run-fixtures.mjs", import.meta.url);

test("detached attestation PASS/FAIL fixtures execute deterministically", async () => {
  const { stdout, stderr } = await execFileAsync(process.execPath, [runner.pathname]);
  assert.equal(stderr, "");
  assert.match(stdout, /pass-valid-detached-attestation: PASS/);
  assert.match(stdout, /fail-missing-attestation: ERR_ATTESTATION_NOT_FOUND/);
  assert.match(stdout, /fail-wrong-issuer: ERR_ISSUER_ACCOUNT_MISMATCH/);
  assert.match(stdout, /fail-wrong-recipient: ERR_TARGET_ACCOUNT_MISMATCH/);
  assert.match(stdout, /fail-wrong-attestation-commitment: ERR_ATTESTATION_COMMITMENT_MISMATCH/);
  assert.match(stdout, /fixtures: 5\/5 passed/);
});
