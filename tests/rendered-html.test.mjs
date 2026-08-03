import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Miden lab", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Miden Private Notes Lab<\/title>/i);
  assert.match(html, /PRIVATE NOTES LAB/);
  assert.match(html, /Representative data · no network claims/);
  assert.match(html, /Connect to testnet/);
  assert.match(html, /Built with the official Miden Web SDK/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("keeps live SDK data separate from demo data", async () => {
  const source = await readFile(new URL("../app/MidenLab.tsx", import.meta.url), "utf8");
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");

  assert.match(source, /@miden-sdk\/react\/lazy/);
  assert.match(source, /rpcUrl: "testnet"/);
  assert.match(source, /Demo dataset/);
  assert.match(source, /useCreateWallet/);
  assert.match(source, /useNotes/);
  assert.match(packageJson, /"@miden-sdk\/react"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
