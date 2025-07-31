import { wouldExceedAfterWrite } from "../monitor/write-impact";

/**
 * Triggers cleanup before writing new data if needed
 */
export async function triggerBeforeWrite(
  estimatedSize: number = 50000
): Promise<boolean> {
  return await wouldExceedAfterWrite(estimatedSize);
}
