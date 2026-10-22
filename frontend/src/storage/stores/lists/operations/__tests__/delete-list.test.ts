import { describe, it, expect, vi, beforeEach } from "vitest";
import deleteList from "../delete-list";
import { executeReadTransaction, executeWriteTransaction } from "@/storage/core/transactions";
import { STORES } from "@/storage/core/config/stores";

vi.mock("@/storage/core/transactions", () => ({
  executeReadTransaction: vi.fn(),
  executeWriteTransaction: vi.fn(),
}));

const mockedRead = executeReadTransaction as unknown as ReturnType<typeof vi.fn>;
const mockedWrite = executeWriteTransaction as unknown as ReturnType<typeof vi.fn>;

describe("deleteList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes every membership row for the list, then the list itself", async () => {
    const items = [
      { id: "list-1::a/song", listId: "list-1", path: "a/song", order: 0 },
      { id: "list-1::b/song", listId: "list-1", path: "b/song", order: 1 },
    ];
    const getAll = vi.fn(() => items);
    mockedRead.mockImplementation(async (storeName, operation) =>
      operation({ index: () => ({ getAll }) })
    );

    const deletedFrom: Array<[string, string]> = [];
    mockedWrite.mockImplementation(async (storeName, operation) =>
      operation({ delete: (id: string) => deletedFrom.push([storeName, id]) })
    );

    await deleteList("list-1");

    expect(mockedRead).toHaveBeenCalledWith(STORES.LIST_ITEMS, expect.any(Function));
    expect(getAll).toHaveBeenCalledWith("list-1");
    expect(deletedFrom).toEqual([
      [STORES.LIST_ITEMS, "list-1::a/song"],
      [STORES.LIST_ITEMS, "list-1::b/song"],
      [STORES.LISTS, "list-1"],
    ]);
  });

  it("never touches chordSheets or songsMetadata stores", async () => {
    mockedRead.mockImplementation(async (_storeName, operation) =>
      operation({ index: () => ({ getAll: () => [] }) })
    );
    const touchedStores: string[] = [];
    mockedWrite.mockImplementation(async (storeName, operation) => {
      touchedStores.push(storeName);
      return operation({ delete: vi.fn() });
    });

    await deleteList("empty-list");

    expect(touchedStores).toEqual([STORES.LISTS]);
    expect(touchedStores).not.toContain(STORES.CHORD_SHEETS);
    expect(touchedStores).not.toContain(STORES.SONGS_METADATA);
  });
});
