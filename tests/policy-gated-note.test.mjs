import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const notePath = new URL("../poc/policy-gated-note/policy-gated-note.masm", import.meta.url);

async function source() {
  return readFile(notePath, "utf8");
}

test("credential note binds consumption to the target account", async () => {
  const masm = await source();
  assert.match(masm, /exec\.active_account::get_id/);
  assert.match(masm, /exec\.account_id::eq assert\.err=ERR_TARGET_ACCOUNT_MISMATCH/);
});

test("credential note verifies a committed credential hash", async () => {
  const masm = await source();
  assert.match(masm, /hash/);
  assert.match(masm, /CREDENTIAL_DIGEST_PTR/);
  assert.match(masm, /mem_loadw_le/);
  assert.match(masm, /assert_eqw\.err=ERR_CREDENTIAL_MISMATCH/);
});

test("boolean policy flags are removed", async () => {
  const masm = await source();
  assert.doesNotMatch(masm, /RECIPIENT_ALLOWED_PTR|ASSET_ALLOWED_PTR|JURISDICTION_ALLOWED_PTR/);
  assert.doesNotMatch(masm, /ERR_RECIPIENT_POLICY|ERR_ASSET_POLICY|ERR_JURISDICTION_POLICY/);
});

test("assets move only after recipient and credential checks", async () => {
  const masm = await source();
  const recipientCheck = masm.indexOf("exec.account_id::eq");
  const credentialCheck = masm.indexOf("assert_eqw.err=ERR_CREDENTIAL_MISMATCH");
  const moveAssets = masm.indexOf("exec.basic_wallet::move_note_assets_to_account");

  assert.ok(recipientCheck >= 0);
  assert.ok(credentialCheck > recipientCheck);
  assert.ok(moveAssets > credentialCheck);
});
