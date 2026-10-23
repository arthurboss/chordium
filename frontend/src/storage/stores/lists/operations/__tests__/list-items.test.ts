import { describe, it, expect, vi, beforeEach } from "vitest";
import addItemToList from "../add-item-to-list";
import removeItemFromList from "../remove-item-from-list";
import itemId from "../item-id";
import { executeReadTransaction, executeWriteTransaction } from "@/storage/core/transactions";
import { STORES } from "@/storage/core/config/stores";

vi.mock("@/storage/core/transactions", () => ({
  executeReadTransaction: vi.fn(),
  executeWriteTransaction: vi.fn(),
}));

const mockedRead = executeReadTransaction as unknown as ReturnType<typeof vi.fn>;
const mockedWrite = executeWriteTransaction as unknown as ReturnType<typeof vi.fn>;

describe("itemId", () => {
  it("is deterministic for the same list and path", () => {
    expect(itemId("list-1", "oasis/wonderwall")).toBe("list-1::oasis/wonderwall");
    expect(itemId("list-1", "oasis/wonderwall")).toBe(itemId("list-1", "oasis/wonderwall"));
  });
});

describe("addItemToList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("puts a membership row keyed by list and path, ordered after existing items", async () => {
    const getAll = vi.fn(() => [{ id: "a", listId: "list-1", path: "x", order: 0 }]);
    mockedRead.mockImplementation(async (_storeName, operation) => operation({ index: () => ({ getAll }) }));
    const put = vi.fn();
    mockedWrite.mockImplementation(async (_storeName, operation) => operation({ put }));

    await addItemToList("list-1", "oasis/wonderwall");

    expect(getAll).toHaveBeenCalledWith("list-1");
    expect(put).toHaveBeenCalledWith({
      id: "list-1::oasis/wonderwall",
      listId: "list-1",
      path: "oasis/wonderwall",
      order: 1,
    });
  });

  it("overwrites rather than duplicates when the song is already in the list", async () => {
    const existing = [{ id: "list-1::oasis/wonderwall", listId: "list-1", path: "oasis/wonderwall", order: 0 }];
    mockedRead.mockImplementation(async (_storeName, operation) =>
      operation({ index: () => ({ getAll: () => existing }) })
    );
    const put = vi.fn();
    mockedWrite.mockImplementation(async (_storeName, operation) => operation({ put }));

    await addItemToList("list-1", "oasis/wonderwall");

    expect(put).toHaveBeenCalledWith(
      expect.objectContaining({ id: "list-1::oasis/wonderwall" })
    );
  });
});

describe("removeItemFromList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the row by its deterministic id", async () => {
    const deleteFn = vi.fn();
    mockedWrite.mockImplementation(async (storeName, operation) => {
      expect(storeName).toBe(STORES.LIST_ITEMS);
      return operation({ delete: deleteFn });
    });

    await removeItemFromList("list-1", "oasis/wonderwall");

    expect(deleteFn).toHaveBeenCalledWith("list-1::oasis/wonderwall");
  });
});
