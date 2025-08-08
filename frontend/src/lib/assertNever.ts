export const assertNever = (value: never, message?: string): never => {
  // Helps ensure exhaustive checks at compile time where possible
  throw new Error(message ?? `Unhandled case: ${String(value)}`);
};


