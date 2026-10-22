import { describe, it, expect, vi, beforeEach } from "vitest";
import renameList from "../rename-list";
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

  it("stores the trimmed new name on the existing list", async () => {
    const existing = { id: "1", name: "Old name", source: "manual" as const, order: 0, createdAt: 1 };
    mockedRead.mockImplementation(async (storeName, operation) =>
      operation({ get: () => existing })
    );
    const put = vi.fn();
    mockedWrite.mockImplementation(async (_storeName, operation) => operation({ put }));

    await renameList("1", "  New name  ");

    expect(mockedRead).toHaveBeenCalledWith(STORES.LISTS, expect.any(Function));
    expect(put).toHaveBeenCalledWith({ ...existing, name: "New name" });
  });

  it("is a no-op when the list no longer exists", async () => {
    mockedRead.mockImplementation(async (_storeName, operation) => operation({ get: () => undefined }));

    await renameList("missing", "Anything");

    expect(mockedWrite).not.toHaveBeenCalled();
  });

  it("throws when the new name is empty", async () => {
    await expect(renameList("1", "  ")).rejects.toThrow("List name is required");
    expect(mockedRead).not.toHaveBeenCalled();
  });
});
