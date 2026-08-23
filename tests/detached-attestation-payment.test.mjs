import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const notePath = new URL("../poc/policy-gated-note/detached-attestation-payment.masm", import.meta.url);

async function source() {
  return readFile(notePath, "utf8");
}

test("detached model decouples payer from issuer using a second input note", async () => {
  const masm = await source();
  assert.match(masm, /exec\.input_note::find_note/);
  assert.match(masm, /ERR_ATTESTATION_NOT_FOUND/);
  assert.match(masm, /exec\.input_note::get_sender/);
  assert.match(masm, /ERR_ISSUER_ACCOUNT_MISMATCH/);
});

test("detached model authenticates attestation payload commitment", async () => {
  const masm = await source();
  assert.match(masm, /exec\.input_note::get_storage_info/);
  assert.match(masm, /ATTESTATION_STORAGE_COMMITMENT_PTR/);
  assert.match(masm, /ERR_ATTESTATION_COMMITMENT_MISMATCH/);
});

test("recipient binding remains enforced", async () => {
  const masm = await source();
  assert.match(masm, /exec\.active_account::get_id/);
  assert.match(masm, /ERR_TARGET_ACCOUNT_MISMATCH/);
});

test("assets move after all detached-attestation checks", async () => {
  const masm = await source();
  const target = masm.indexOf("ERR_TARGET_ACCOUNT_MISMATCH");
  const found = masm.indexOf("ERR_ATTESTATION_NOT_FOUND");
  const issuer = masm.indexOf("ERR_ISSUER_ACCOUNT_MISMATCH");
  const commitment = masm.indexOf("ERR_ATTESTATION_COMMITMENT_MISMATCH");
  const move = masm.indexOf("exec.basic_wallet::move_note_assets_to_account");

  assert.ok(move > target);
  assert.ok(move > found);
  assert.ok(move > issuer);
  assert.ok(move > commitment);
});
