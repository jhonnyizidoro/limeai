import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("returns empty string with no args", () => {
    expect(cn()).toBe("");
  });

  it("returns single class name", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("joins multiple class names with space", () => {
    expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
  });

  it("filters out falsy values", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("filters out 0", () => {
    expect(cn("foo", 0, "bar")).toBe("foo bar");
  });

  it("filters out boolean true", () => {
    expect(cn("foo", true, "bar")).toBe("foo bar");
  });

  it("includes numbers as strings", () => {
    expect(cn("foo", 42)).toBe("foo 42");
  });

  it("deduplicates repeated class names", () => {
    expect(cn("foo", "bar", "foo")).toBe("foo bar");
  });

  it("returns empty string when all args are falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});
