import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { buildPrivateOutputRequest } from "../app/lib/private-transfer.ts";

test("browser WASM request construction never frees a moved output array", async () => {
  // Exercise the published browser binding, not the native shim: native arrays are plain JS arrays.
  const packageRoot = new URL("../node_modules/@miden-sdk/miden-sdk/dist/st/", import.meta.url);
  const chunks = await readdir(packageRoot);
  const filename = chunks.find(name => /^Cargo-.*\.js$/.test(name));
  assert.ok(filename, "published browser binding is present");
  const wasm = await import(new URL(filename, packageRoot).href);
  wasm.initSync({ module: await readFile(new URL("assets/miden_client_web.wasm", packageRoot)) });
  const moved = new wasm.NoteArray();
  const original = new wasm.TransactionRequestBuilder();
  const configured = original.withOwnOutputNotes(moved);
  assert.throws(() => moved.free(), /null pointer passed to rust/, "reproduces the reported browser failure");
  configured.free(); original.free();

  const request = buildPrivateOutputRequest(new wasm.TransactionRequestBuilder(), new wasm.NoteArray());
  assert.ok(request.serialize().length > 0, "request remains valid after builder cleanup");
  request.free();
});
