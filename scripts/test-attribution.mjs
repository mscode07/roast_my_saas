// Run with: node --experimental-strip-types scripts/test-attribution.mjs
import assert from "node:assert/strict";
import { roastResultSchema } from "../types/roast.ts";

const schema = roastResultSchema.shape.attribution;
assert.equal(schema.parse(undefined), undefined, "Legacy and anonymous roasts remain valid");
assert.equal(schema.parse({ xHandle: " @mscode07 ", taggingConsent: true }).xHandle, "mscode07");
for (const input of [
  { xHandle: "valid", taggingConsent: false },
  { xHandle: "valid" },
  { xHandle: "bad handle", taggingConsent: true },
  { xHandle: "https://x.com/me", taggingConsent: true },
  { xHandle: "abcdefghijklmnop", taggingConsent: true },
  { xHandle: "", taggingConsent: true },
]) {
  assert.equal(schema.safeParse(input).success, false, JSON.stringify(input));
}
// The AI output schema must not collect or invent social handles.
assert.equal("attribution" in roastResultSchema.omit({ id: true, createdAt: true, attribution: true }).shape, false);
console.log("Attribution validation: 9 checks passed.");
