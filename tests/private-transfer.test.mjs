import assert from "node:assert/strict";
import test from "node:test";
import { MidenClient, FaucetType, createP2IDNote, getWrappedSdk } from "@miden-sdk/miden-sdk";
import { expectedBalances, parseAmount, readBalances, submitRequest } from "../app/lib/private-transfer.ts";

test("base-unit parsing rejects fractions, negatives and protocol overflow without losing precision", () => {
  assert.equal(parseAmount("9007199254740993"), 9007199254740993n);
  for (const input of ["0", "-1", "1.5", "1e6", "", " 1", "9223372036854775807"]) {
    assert.throws(() => parseAmount(input));
  }
});

test("real SDK mock chain: private P2ID transfer, note-file import, consume, refreshed balances and replay rejection", { timeout: 180_000 }, async () => {
  const { NoteArray } = getWrappedSdk();
  const client = await MidenClient.createMock();
  try {
    const alice = await client.accounts.create({ storage: "private", auth: "falcon" });
    const bob = await client.accounts.create({ storage: "private", auth: "falcon" });
    const faucet = await client.accounts.create({ type: FaucetType.FungibleFaucet, symbol: "LAB", decimals: 0, maxSupply: 1000000n });
    const transfer = { sender: alice.id().toString(), recipient: bob.id().toString(), token: faucet.id().toString(), amount: "100" };
    await client.transactions.mint({ account: faucet, to: alice, amount: 1000n, type: "public" });
    await client.proveBlock(); await client.sync();
    const funding = await client.notes.listAvailable({ account: alice });
    await client.transactions.consume({ account: alice, notes: funding });
    await client.proveBlock();
    const before = await readBalances(client, transfer);
    assert.deepEqual(before, { sender: 1000n, recipient: 0n });

    const note = createP2IDNote({ from: alice, to: bob, assets: { token: faucet, amount: 100n }, type: "private" });
    const outputs = new NoteArray(); outputs.push(note);
    const builder = await client.feeAwareTransactionRequestBuilder(alice);
    const request = builder.withOwnOutputNotes(outputs).build();
    const stages = [];
    const sent = await submitRequest(client, transfer.sender, request, stage => stages.push(stage), async receipt => {
      assert.ok(receipt.txId); assert.ok(receipt.noteId);
      await client.proveBlock();
    });
    assert.deepEqual(sent.fees, [], "default mock chain has zero fees; not evidence of paid-testnet behavior");
    // Import the full private note out of band. Testnet UI exercises NTL separately.
    const file = await client.notes.export(sent.noteId);
    await client.notes.import(file);
    await client.sync();
    const record = await client.notes.get(sent.noteId);
    assert.ok(record);
    const input = record.toInputNote();
    const consumeBuilder = await client.feeAwareTransactionRequestBuilder(bob);
    const consumeRequest = consumeBuilder.withExplicitInputNote(input).build();
    const consumed = await submitRequest(client, transfer.recipient, consumeRequest, stage => stages.push(stage), async () => { await client.proveBlock(); });
    assert.ok(consumed.txId);
    const after = await readBalances(client, transfer);
    assert.deepEqual(after, { sender: 900n, recipient: 100n });
    assert.ok(stages.some(stage => stage.startsWith("Generating the proof locally")));
    await assert.rejects(client.transactions.consume({ account: bob, notes: [sent.noteId] }));
    funding.forEach(note => note.free?.());
    input.free?.(); record.free?.(); consumeBuilder.free?.(); consumeRequest.free?.();
    note.free?.(); outputs.free?.(); builder.free?.(); request.free?.(); file.free?.();
    alice.free?.(); bob.free?.(); faucet.free?.();
  } finally { client.terminate(); }
});


test("balance accounting charges each account its own fee only when it matches the transferred token", () => {
  const transfer = { sender: "alice", recipient: "bob", token: "0xAB", amount: "100" };
  const before = { sender: 1000n, recipient: 20n };
  assert.deepEqual(expectedBalances(before, transfer, [{ assetId: "0xab", amount: "7" }], [{ assetId: "0xAB", amount: "3" }]), { sender: 893n, recipient: 117n });
  assert.deepEqual(expectedBalances(before, transfer, [{ assetId: "0xcd", amount: "7" }], [{ assetId: "0xcd", amount: "3" }]), { sender: 900n, recipient: 120n });
});

test("a post-submit persistence error preserves the receipt and does not resubmit", async () => {
  const order = [];
  const client = { transactions: {
    executeRequest: async () => ({
      id: { toHex: () => "tx-1" },
      result: { executedTransaction: () => ({ feeNote: () => undefined, userOutputNotes: () => [] }) },
      prove: async () => ({ submit: async () => {
        order.push("submit");
        return { apply: async () => { order.push("apply"); throw new Error("store unavailable"); } };
      } }),
    }),
    waitFor: async () => { order.push("wait"); },
  } };
  let saved;
  await assert.rejects(submitRequest(client, "alice", {}, () => {}, receipt => { order.push("save"); saved = receipt; }), /store unavailable/);
  assert.equal(saved.txId, "tx-1");
  assert.deepEqual(order, ["submit", "save", "apply"]);
});
