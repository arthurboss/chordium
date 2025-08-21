/** Storage usage estimation */
export interface StorageEstimate {
  /** Current usage in bytes */
  usage: number;
  /** Available quota in bytes */
  quota: number;
  /** Usage as percentage of target (0-1) */
  usageRatio: number;
}
