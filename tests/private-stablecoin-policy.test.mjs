import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const vectors = JSON.parse(
  await readFile(new URL("./fixtures/private-stablecoin-policy.json", import.meta.url), "utf8"),
);

function evaluateStorage([recipientAllowed, assetAllowed, jurisdictionAllowed, policyActive]) {
  if (policyActive !== 1) return "ERROR_POLICY_INACTIVE";
  if (jurisdictionAllowed !== 1) return "ERROR_JURISDICTION_BLOCKED";
  if (assetAllowed !== 1) return "ERROR_ASSET_BLOCKED";
  if (recipientAllowed !== 1) return "ERROR_RECIPIENT_FROZEN";
  return "allow";
}

for (const vector of vectors) {
  test(`policy vector: ${vector.name}`, () => {
    assert.equal(evaluateStorage(vector.storage), vector.expected);
  });
}

test("MASM note script keeps policy checks before asset transfer", async () => {
  const source = await readFile(
    new URL("../masm/notes/private_stablecoin_policy.masm", import.meta.url),
    "utf8",
  );

  assert.match(source, /@note_script/);
  assert.match(source, /exec\.active_note::get_storage/);
  assert.match(source, /mem_loadw_le/);

  const inactive = source.indexOf("assert.err=ERROR_POLICY_INACTIVE");
  const jurisdiction = source.indexOf("assert.err=ERROR_JURISDICTION_BLOCKED");
  const asset = source.indexOf("assert.err=ERROR_ASSET_BLOCKED");
  const recipient = source.indexOf("assert.err=ERROR_RECIPIENT_FROZEN");
  const transfer = source.indexOf("exec.wallet::add_assets_to_account");

  assert.ok(inactive > -1);
  assert.ok(jurisdiction > inactive);
  assert.ok(asset > jurisdiction);
  assert.ok(recipient > asset);
  assert.ok(transfer > recipient);
});

test("fixture storage layout matches the documented note word", async () => {
  const source = await readFile(
    new URL("../masm/notes/private_stablecoin_policy.masm", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /\[recipient_allowed, asset_allowed, jurisdiction_allowed, policy_active\]/,
  );
  assert.equal(vectors.every((vector) => vector.storage.length === 4), true);
  assert.equal(vectors.every((vector) => vector.storage.every((value) => value === 0 || value === 1)), true);
});
