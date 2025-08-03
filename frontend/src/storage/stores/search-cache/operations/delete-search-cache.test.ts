/**
 * Tests for deleteSearchCache function
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import deleteSearchCache from "./delete-search-cache";

// Mock the database utilities
vi.mock("../../chord-sheets/database/connection", () => ({
  getDatabase: vi.fn(),
}));

vi.mock("../../../core/transactions", () => ({
  executeReadTransaction: vi.fn(),
  executeWriteTransaction: vi.fn(),
}));

// Import mocked functions
import { getDatabase } from "../../chord-sheets/database/connection";
import { executeReadTransaction, executeWriteTransaction } from "../../../core/transactions";

const mockGetDatabase = vi.mocked(getDatabase);
const mockExecuteReadTransaction = vi.mocked(executeReadTransaction);
const mockExecuteWriteTransaction = vi.mocked(executeWriteTransaction);

describe("deleteSearchCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDatabase.mockResolvedValue({} as IDBDatabase);
  });

  it("should return true when entry exists and is deleted", async () => {
    // Mock that entry exists
    mockExecuteReadTransaction.mockResolvedValue({ path: "some-entry" });
    // Mock successful deletion
    mockExecuteWriteTransaction.mockResolvedValue(undefined);

    const result = await deleteSearchCache("metallica");

    expect(result).toBe(true);
    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteReadTransaction).toHaveBeenCalledOnce();
    expect(mockExecuteWriteTransaction).toHaveBeenCalledOnce();
  });

  it("should return false when entry does not exist", async () => {
    // Mock that no entry exists
    mockExecuteReadTransaction.mockResolvedValue(undefined);

    const result = await deleteSearchCache("non-existent-path");

    expect(result).toBe(false);
    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteReadTransaction).toHaveBeenCalledOnce();
    // Write transaction should not be called
    expect(mockExecuteWriteTransaction).not.toHaveBeenCalled();
  });

  it("should handle database initialization", async () => {
    mockExecuteReadTransaction.mockResolvedValue(undefined);

    await deleteSearchCache("some-path");

    expect(mockGetDatabase).toHaveBeenCalledOnce();
  });

  it("should propagate database operation errors", async () => {
    const dbError = new Error("Database delete failed");
    mockExecuteReadTransaction.mockRejectedValue(dbError);

    await expect(deleteSearchCache("some-path"))
      .rejects.toThrow("Database delete failed");
    
    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteReadTransaction).toHaveBeenCalledOnce();
  });

  it("should handle empty path gracefully", async () => {
    mockExecuteReadTransaction.mockResolvedValue(undefined);

    const result = await deleteSearchCache("");

    expect(result).toBe(false);
    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteReadTransaction).toHaveBeenCalledOnce();
  });
});
