import assert from "node:assert/strict";

import { describe, it } from "vitest";

import { tryCatch } from "./tryCatch.ts";

describe("tryCatch", () => {
  it("returns [null, data] on success", async () => {
    const [err, data] = await tryCatch(Promise.resolve(42));
    assert.equal(err, null);
    assert.equal(data, 42);
  });

  it("returns [Error, null] on rejection", async () => {
    const [err, data] = await tryCatch(Promise.reject(new Error("boom")));
    assert.ok(err instanceof Error);
    assert.equal(err.message, "boom");
    assert.equal(data, null);
  });

  it("wraps non-Error rejections in Error", async () => {
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    const [err, data] = await tryCatch(Promise.reject("string error"));
    assert.ok(err instanceof Error);
    assert.equal(err.message, "string error");
    assert.equal(data, null);
  });

  it("infers data type from promise", async () => {
    const [err, data] = await tryCatch(Promise.resolve({ id: "1", name: "test" }));
    assert.equal(err, null);
    assert.equal(data.id, "1");
    assert.equal(data.name, "test");
  });
});
