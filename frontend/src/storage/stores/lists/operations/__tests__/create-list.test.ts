import { describe, it, expect, vi, beforeEach } from "vitest";
import createList from "../create-list";
import DuplicateListNameError from "../duplicate-list-name-error";
import { executeReadTransaction, executeWriteTransaction } from "@/storage/core/transactions";
import { STORES } from "@/storage/core/config/stores";

vi.mock("@/storage/core/transactions", () => ({
  executeReadTransaction: vi.fn(),
  executeWriteTransaction: vi.fn(),
}));

vi.mock("uuid", () => ({
  v4: () => "test-uuid",
}));

const mockedRead = executeReadTransaction as unknown as ReturnType<typeof vi.fn>;
const mockedWrite = executeWriteTransaction as unknown as ReturnType<typeof vi.fn>;

describe("createList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a list with a trimmed name, manual source and the next order", async () => {
    mockedRead.mockResolvedValue([
      { order: 0, name: "Other" },
      { order: 1, name: "Another" },
    ]);
    const put = vi.fn();
    mockedWrite.mockImplementation(async (_storeName, operation) => operation({ put }));

    const list = await createList("  Worship songs  ");

    expect(list).toMatchObject({
      id: "test-uuid",
      name: "Worship Songs",
      source: "manual",
      order: 2,
    });
    expect(typeof list.createdAt).toBe("number");
    expect(mockedRead).toHaveBeenCalledWith(STORES.LISTS, expect.any(Function));
    expect(put).toHaveBeenCalledWith(list);
  });

  it("starts order at 0 for the first list", async () => {
    mockedRead.mockResolvedValue([]);
    const put = vi.fn();
    mockedWrite.mockImplementation(async (_storeName, operation) => operation({ put }));

    const list = await createList("Favorites");

    expect(list.order).toBe(0);
  });

  it("throws when the name is empty or whitespace only", async () => {
    await expect(createList("   ")).rejects.toThrow("List name is required");
    expect(mockedWrite).not.toHaveBeenCalled();
  });

  it("throws when another list already has this name, case-insensitively", async () => {
    mockedRead.mockResolvedValue([{ id: "1", name: "Worship Songs", order: 0 }]);

    await expect(createList("worship songs")).rejects.toThrow(DuplicateListNameError);
    expect(mockedWrite).not.toHaveBeenCalled();
  });
});
