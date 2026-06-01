type MaybeClassNames = string | boolean | number | undefined | null;

export const cn = (...args: MaybeClassNames[]): string => {
  const seen = new Set<string>();
  for (const arg of args) {
    if (arg && (typeof arg === "string" || typeof arg === "number")) {
      seen.add(String(arg));
    }
  }
  return [...seen].join(" ");
};
