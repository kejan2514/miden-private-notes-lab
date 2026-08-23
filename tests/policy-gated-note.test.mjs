import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const notePath = new URL("../poc/policy-gated-note/policy-gated-note.masm", import.meta.url);

async function source() {
  return readFile(notePath, "utf8");
}

test("policy note binds consumption to the target account", async () => {
  const masm = await source();
  assert.match(masm, /exec\.active_account::get_id/);
  assert.match(masm, /exec\.account_id::eq assert\.err=ERR_TARGET_ACCOUNT_MISMATCH/);
});

test("policy note requires all three policy gates", async () => {
  const masm = await source();
  assert.match(masm, /RECIPIENT_ALLOWED_PTR eq\.1 assert\.err=ERR_RECIPIENT_POLICY/);
  assert.match(masm, /ASSET_ALLOWED_PTR eq\.1 assert\.err=ERR_ASSET_POLICY/);
  assert.match(masm, /JURISDICTION_ALLOWED_PTR eq\.1 assert\.err=ERR_JURISDICTION_POLICY/);
});

test("assets move only after recipient and policy checks", async () => {
  const masm = await source();
  const recipientCheck = masm.indexOf("exec.account_id::eq");
  const recipientPolicy = masm.indexOf("ERR_RECIPIENT_POLICY");
  const assetPolicy = masm.indexOf("ERR_ASSET_POLICY");
  const jurisdictionPolicy = masm.indexOf("ERR_JURISDICTION_POLICY");
  const moveAssets = masm.indexOf("exec.basic_wallet::move_note_assets_to_account");

  assert.ok(recipientCheck >= 0);
  assert.ok(moveAssets > recipientCheck);
  assert.ok(moveAssets > recipientPolicy);
  assert.ok(moveAssets > assetPolicy);
  assert.ok(moveAssets > jurisdictionPolicy);
});
