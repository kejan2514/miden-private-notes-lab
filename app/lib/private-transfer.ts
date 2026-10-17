import type { MidenClient, NoteArray, TransactionRequest, TransactionRequestBuilder } from "@miden-sdk/miden-sdk";

export type Fee = { assetId: string; amount: string };
export type Receipt = { txId: string; noteId: string | null; fees: Fee[] };
export type Balances = { sender: bigint; recipient: bigint };
export type Transfer = { sender: string; recipient: string; token: string; amount: string };

export function parseAmount(value: string): bigint {
  if (!/^[1-9][0-9]*$/.test(value)) throw new Error("Enter a positive whole number of token base units.");
  const amount = BigInt(value);
  if (amount > (1n << 63n) - (1n << 31n)) throw new Error("Amount exceeds the protocol fungible-asset limit.");
  return amount;
}

export async function readBalances(client: MidenClient, transfer: Transfer): Promise<Balances> {
  // Read fresh objects after sync, never an Account retained before a transaction.
  await client.sync();
  const sender = await client.accounts.getBalance(transfer.sender, transfer.token);
  const recipient = await client.accounts.getBalance(transfer.recipient, transfer.token);
  return { sender, recipient };
}

export function expectedBalances(before: Balances, transfer: Transfer, sendFees: Fee[], consumeFees: Fee[]): Balances {
  const amount = parseAmount(transfer.amount);
  const paidInToken = (fees: Fee[]) => fees
    .filter(fee => fee.assetId.toLowerCase() === transfer.token.toLowerCase())
    .reduce((sum, fee) => sum + BigInt(fee.amount), 0n);
  return {
    sender: before.sender - amount - paidInToken(sendFees),
    recipient: before.recipient + amount - paidInToken(consumeFees),
  };
}

// withOwnOutputNotes takes ownership of the array at the WASM boundary.
// Freeing that moved array throws before execution in browsers (native tests do not model this).
export function buildPrivateOutputRequest(builder: TransactionRequestBuilder, outputs: NoteArray): TransactionRequest {
  const configured = builder.withOwnOutputNotes(outputs);
  try { return configured.build(); }
  finally { configured.free?.(); builder.free?.(); }
}

export async function submitRequest(
  client: MidenClient,
  account: string,
  request: TransactionRequest,
  onStage: (stage: string) => void,
  onSubmitted: (receipt: Receipt) => void | Promise<void>,
): Promise<Receipt> {
  onStage("Executing locally and reading the fee");
  const execution = await client.transactions.executeRequest(account, request);
  const executed = execution.result.executedTransaction();
  const feeNote = executed.feeNote();
  const assets = feeNote?.assets();
  const fungibles = assets?.fungibleAssets() ?? [];
  const fees = fungibles.map(asset => {
    const id = asset.faucetId();
    try { return { assetId: id.toString(), amount: asset.amount().toString() }; }
    finally { id.free?.(); asset.free?.(); }
  });
  assets?.free?.(); feeNote?.free?.();
  const outputs = executed.userOutputNotes();
  const noteId = outputs[0]?.id();
  const receipt: Receipt = { txId: execution.id.toHex(), noteId: noteId?.toString() ?? null, fees };
  noteId?.free?.(); outputs.forEach(note => note.free?.()); executed.free?.();
  onStage(`Generating the proof locally · fee: ${fees.length ? fees.map(fee => `${fee.amount} base units of ${fee.assetId}`).join(", ") : "no fee note"}`);
  const proof = await execution.prove();
  onStage("Submitting to testnet");
  const submission = await proof.submit();
  // Preserve the transaction ID before apply/confirmation: a later failure must not prompt a resend.
  await onSubmitted(receipt);
  await submission.apply();
  onStage("Waiting for chain confirmation");
  await client.transactions.waitFor(receipt.txId, { timeout: 120_000 });
  return receipt;
}
