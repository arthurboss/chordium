import { describe, it, expect, vi, beforeEach } from "vitest";
import renameList from "../rename-list";
import DuplicateListNameError from "../duplicate-list-name-error";
import { executeReadTransaction, executeWriteTransaction } from "@/storage/core/transactions";
import { STORES } from "@/storage/core/config/stores";

vi.mock("@/storage/core/transactions", () => ({
  executeReadTransaction: vi.fn(),
  executeWriteTransaction: vi.fn(),
}));

const mockedRead = executeReadTransaction as unknown as ReturnType<typeof vi.fn>;
const mockedWrite = executeWriteTransaction as unknown as ReturnType<typeof vi.fn>;

describe("renameList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores the trimmed new name as title case on the existing list", async () => {
    const existing = { id: "1", name: "Old Name", source: "manual" as const, order: 0, createdAt: 1 };
    mockedRead.mockImplementation(async (storeName, operation) =>
      operation({ getAll: () => [existing] })
    );
    const put = vi.fn();
    mockedWrite.mockImplementation(async (_storeName, operation) => operation({ put }));

    await renameList("1", "  new name  ");

    expect(mockedRead).toHaveBeenCalledWith(STORES.LISTS, expect.any(Function));
    expect(put).toHaveBeenCalledWith({ ...existing, name: "New Name" });
  });

  it("is a no-op when the list no longer exists", async () => {
    mockedRead.mockImplementation(async (_storeName, operation) => operation({ getAll: () => [] }));

    await renameList("missing", "Anything");

    expect(mockedWrite).not.toHaveBeenCalled();
  });

  it("throws when the new name is empty", async () => {
    await expect(renameList("1", "  ")).rejects.toThrow("List name is required");
    expect(mockedRead).not.toHaveBeenCalled();
  });

  it("throws when another list already has this name, case-insensitively", async () => {
    const existing = { id: "1", name: "Old Name", source: "manual" as const, order: 0, createdAt: 1 };
    const other = { id: "2", name: "Worship Songs", source: "manual" as const, order: 1, createdAt: 2 };
    mockedRead.mockImplementation(async (_storeName, operation) =>
      operation({ getAll: () => [existing, other] })
    );

    await expect(renameList("1", "worship songs")).rejects.toThrow(DuplicateListNameError);
    expect(mockedWrite).not.toHaveBeenCalled();
  });

  it("allows renaming a list to the name it already has", async () => {
    const existing = { id: "1", name: "Old Name", source: "manual" as const, order: 0, createdAt: 1 };
    mockedRead.mockImplementation(async (_storeName, operation) =>
      operation({ getAll: () => [existing] })
    );
    const put = vi.fn();
    mockedWrite.mockImplementation(async (_storeName, operation) => operation({ put }));

    await renameList("1", "Old Name");

    expect(put).toHaveBeenCalledWith({ ...existing, name: "Old Name" });
  });
});
