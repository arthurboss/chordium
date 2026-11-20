import type { ChordiumBackup } from "./types";
import { BackupValidationError } from "./types";
import { serializeBackup } from "./import-backup";

const GZIP_MAGIC_FIRST = 0x1f;
const GZIP_MAGIC_SECOND = 0x8b;

export interface BackupDownload {
  blob: Blob;
  fileName: string;
}

function backupDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Compresses the backup so a large library stays manageable to share. Browsers
 * without Compression Streams still get a plain JSON download.
 */
export async function createBackupDownload(backup: ChordiumBackup): Promise<BackupDownload> {
  const json = serializeBackup(backup);
  const fileName = `chordium-backup-${backupDate()}`;

  if (typeof CompressionStream === "undefined") {
    return {
      blob: new Blob([json], { type: "application/json" }),
      fileName: `${fileName}.json`,
    };
  }

  const compressed = new Blob([json], { type: "application/json" })
    .stream()
    .pipeThrough(new CompressionStream("gzip"));

  return {
    blob: await new Response(compressed).blob(),
    fileName: `${fileName}.json.gz`,
  };
}

function isGzip(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 2) return false;
  const bytes = new Uint8Array(buffer, 0, 2);
  return bytes[0] === GZIP_MAGIC_FIRST && bytes[1] === GZIP_MAGIC_SECOND;
}

async function decompress(buffer: ArrayBuffer): Promise<string> {
  if (typeof DecompressionStream === "undefined") {
    throw new BackupValidationError("Compressed backups are not supported in this browser.");
  }
  const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

/**
 * Reads either a gzipped backup or a plain JSON backup. The format is detected
 * from the file bytes rather than the extension so renamed files still work.
 */
export async function readBackupFile(file: File): Promise<unknown> {
  const buffer = await file.arrayBuffer();
  const text = isGzip(buffer) ? await decompress(buffer) : new TextDecoder().decode(buffer);

  try {
    return JSON.parse(text);
  } catch {
    throw new BackupValidationError("The file is not valid JSON.");
  }
}
