#!/usr/bin/env node
/**
 * Cover for the shipped credential guard.
 *
 * This repository is a knowledge corpus, so the guard's job is narrow: keep a
 * credential out of a document. The near-miss cases matter more than usual
 * here, because handbook prose is full of formulas, table names and version
 * strings that a careless scanner would flag - and a guard that fires on
 * ordinary knowledge writing gets switched off within a day.
 */

import assert from "node:assert/strict";
import {
  scanContent,
  secretPathRule,
} from "../plugins/yieldwerx-knowledgebase/scripts/lib/guards/secrets.mjs";
import {
  evaluate,
  writtenText,
} from "../plugins/yieldwerx-knowledgebase/scripts/guards/write-guard.mjs";
import {
  emitDecision,
  mask,
} from "../plugins/yieldwerx-knowledgebase/scripts/lib/guards/hook-io.mjs";

let failures = 0;
const check = (label, fn) => {
  try {
    fn();
    console.log(`ok    ${label}`);
  } catch (e) {
    console.error(`FAIL  ${label}\n      ${e.message.split("\n")[0]}`);
    failures++;
  }
};

check("a credential in a document is denied and masked", () => {
  const secret = "ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456";
  const v = evaluate({
    tool_input: { file_path: "/kb/docs/notes.md", content: `token: "${secret}"` },
  });
  assert.equal(v.decision, "deny");
  assert.ok(!v.reason.includes(secret), "the secret must never appear in the reason");
});

check("a write to a credential-holding path is refused", () => {
  assert.equal(evaluate({ tool_input: { file_path: "/kb/.env", content: "" } }).decision, "deny");
  assert.ok(secretPathRule("/kb/certs/server.pem"));
  assert.equal(secretPathRule("/kb/.env.example"), null);
});

check("ordinary handbook prose is silent", () => {
  for (const content of [
    "Cpk = min((USL - Mean) / 3sigma, (Mean - LSL) / 3sigma)",
    "The wafer map renders bin 1 as passing; see chapter 10 for PAT and MVPAT.",
    "Connect with the configured account; the password is supplied by the operator.",
    "source_id: handbook-third-html",
    "version https://example.invalid/spec/v1",
    "SELECT lot_id, wafer_id FROM test_results WHERE bin > 1;",
  ]) {
    assert.deepEqual(scanContent(content), [], content.slice(0, 40));
  }
});

check("env indirection and placeholders are not credentials", () => {
  for (const line of [
    'password: "your_password_here"',
    "token: process.env.AIO_API_TOKEN",
    'api_key: "example-key-value"',
  ]) {
    assert.deepEqual(scanContent(line), [], line);
  }
});

check("writtenText reads every tool shape, so no Edit goes unscanned", () => {
  assert.equal(writtenText({ content: "a" }), "a");
  assert.equal(writtenText({ new_string: "b" }), "b");
  assert.equal(writtenText({ edits: [{ new_string: "c" }] }), "c");
});

check("the override is honoured", () => {
  const payload = {
    tool_input: { file_path: "/kb/docs/x.md", content: 'k = "AKIA2E0ZTRPQHV4XN9WB"' },
  };
  assert.equal(evaluate(payload, {}).decision, "deny");
  assert.equal(evaluate(payload, { YWKB_ALLOW_SECRET_WRITE: "1" }), null);
});

check("the emitted payload is the documented PreToolUse contract on stdout", () => {
  let out = "";
  emitDecision({ decision: "deny", reason: "because", findings: [] }, { write: (s) => (out += s) });
  const parsed = JSON.parse(out);
  assert.equal(parsed.hookSpecificOutput.hookEventName, "PreToolUse");
  assert.equal(parsed.hookSpecificOutput.permissionDecision, "deny");
  assert.equal(mask("short"), "*****");
});

if (failures) {
  console.error(`\n${failures} guard test(s) failed.`);
  process.exit(1);
}
console.log("\nKnowledgebase guard tests passed.");
