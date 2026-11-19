import { describe, it, expect, vi, beforeEach } from "vitest";
import getAllLists from "../get-all-lists";
import { executeReadTransaction } from "@/storage/core/transactions";
import { STORES } from "@/storage/core/config/stores";

vi.mock("@/storage/core/transactions", () => ({
  executeReadTransaction: vi.fn(),
  executeWriteTransaction: vi.fn(),
}));

const mockedRead = executeReadTransaction as unknown as ReturnType<typeof vi.fn>;

describe("getAllLists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns lists sorted by their stored order", async () => {
    const unordered = [
      { id: "b", name: "B", source: "manual" as const, order: 2, createdAt: 1 },
      { id: "a", name: "A", source: "manual" as const, order: 0, createdAt: 1 },
      { id: "c", name: "C", source: "manual" as const, order: 1, createdAt: 1 },
    ];
    mockedRead.mockImplementation(async (storeName, operation) => {
      expect(storeName).toBe(STORES.LISTS);
      return operation({ getAll: () => unordered });
    });

    const result = await getAllLists();

    expect(result.map((l) => l.id)).toEqual(["a", "c", "b"]);
  });

  it("returns an empty array when there are no lists", async () => {
    mockedRead.mockImplementation(async (_storeName, operation) => operation({ getAll: () => [] }));

    expect(await getAllLists()).toEqual([]);
  });
});
