import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import logger from "../utils/logger.js";
import type { Song } from '../../packages/types/dist';

class S3StorageService {
  private s3: S3Client | null = null;
  private enabled: boolean | null = null;
  private bucketName: string | null = null;

  private _initialize(): void {
    if (this.enabled !== null) return; // Already initialized

    // Check if AWS credentials are available
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      logger.warn("AWS credentials not found. S3 storage will be disabled.");
      this.enabled = false;
      return;
    }

    this.s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        ...(process.env.AWS_SESSION_TOKEN && {
          sessionToken: process.env.AWS_SESSION_TOKEN,
        }),
      },
      region: process.env.AWS_REGION || "eu-central-1",
    });
    this.bucketName = process.env.S3_BUCKET_NAME || "chordium";
    this.enabled = true;
  }

  private _checkEnabled(): boolean {
    this._initialize();
    if (!this.enabled) {
      logger.warn("S3 storage is disabled. Skipping operation.");
      return false;
    }
    return true;
  }

  /**
   * Get artist songs from S3
   */
  async getArtistSongs(artistPath: string): Promise<Song[] | null> {
    if (!this._checkEnabled()) {
      return null;
    }

    try {
      const key = `artist-songs/${artistPath}.json`;
      const command = new GetObjectCommand({
        Bucket: this.bucketName!,
        Key: key,
      });

      const result = await this.s3!.send(command);
      const body = await result.Body!.transformToString();
      const songs = JSON.parse(body) as Song[];
      logger.info(`Retrieved ${songs.length} songs for ${artistPath} from S3`);
      return songs;
    } catch (error: any) {
      if (error.name === "NoSuchKey") {
        logger.info(`No cached songs found for ${artistPath} in S3`);
        return null;
      }
      logger.error(
        `Error retrieving songs from S3 for ${artistPath}:`,
        error.message
      );
      return null; // Return null instead of throwing to allow fallback
    }
  }

  /**
   * Store artist songs in S3
   */
  async storeArtistSongs(artistPath: string, songs: Song[]): Promise<boolean> {
    if (!this._checkEnabled()) {
      return false;
    }

    try {
      // Optimize storage by only keeping essential fields
      const optimizedSongs = songs.map(song => ({
        title: song.title,
        path: song.path,
        artist: song.artist
      }));

      const key = `artist-songs/${artistPath}.json`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName!,
        Key: key,
        Body: JSON.stringify(optimizedSongs),
        ContentType: "application/json",
        Metadata: {
          artist: artistPath,
          "song-count": songs.length.toString(),
          "last-updated": new Date().toISOString(),
        },
      });

      await this.s3!.send(command);
      logger.info(`Stored ${songs.length} songs for ${artistPath} in S3 (optimized schema)`);
      return true;
    } catch (error: any) {
      logger.error(`Error storing songs to S3 for ${artistPath}:`, error.message);
      return false;
    }
  }

  /**
   * Add a single song to an artist's cached song list
   */
  async addSongToArtist(artistPath: string, song: Song): Promise<boolean> {
    if (!this._checkEnabled()) {
      return false;
    }

    try {
      // First, get existing songs
      const existingSongs = await this.getArtistSongs(artistPath) || [];
      
      // Check if song already exists
      const songExists = existingSongs.some(existingSong => 
        existingSong.path === song.path
      );
      
      if (songExists) {
        logger.info(`Song "${song.title}" already exists for ${artistPath}`);
        return false;
      }
      
      // Add the new song
      const updatedSongs = [...existingSongs, song];
      
      // Store the updated list
      const success = await this.storeArtistSongs(artistPath, updatedSongs);
      if (success) {
        logger.info(`Added song "${song.title}" to ${artistPath}`);
      }
      return success;
    } catch (error: any) {
      logger.error(`Error adding song to artist ${artistPath}:`, error.message);
      return false;
    }
  }

  /**
   * Remove a song from an artist's cached song list
   */
  async removeSongFromArtist(artistPath: string, songPath: string): Promise<boolean> {
    if (!this._checkEnabled()) {
      return false;
    }

    try {
      // First, get existing songs
      const existingSongs = await this.getArtistSongs(artistPath);
      
      if (!existingSongs) {
        logger.warn(`No songs found for artist ${artistPath}`);
        return false;
      }
      
      // Filter out the song to remove
      const updatedSongs = existingSongs.filter(song => song.path !== songPath);
      
      if (updatedSongs.length === existingSongs.length) {
        logger.info(`Song with path "${songPath}" not found in ${artistPath}`);
        return false;
      }
      
      // Store the updated list
      const success = await this.storeArtistSongs(artistPath, updatedSongs);
      if (success) {
        logger.info(`Removed song with path "${songPath}" from ${artistPath}`);
      }
      return success;
    } catch (error: any) {
      logger.error(`Error removing song from artist ${artistPath}:`, error.message);
      return false;
    }
  }

  /**
   * List all artists with cached songs
   */
  async listArtists(): Promise<string[]> {
    if (!this._checkEnabled()) {
      return [];
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName!,
        Prefix: "artist-songs/",
      });

      const result = await this.s3!.send(command);
      const artists =
        result.Contents?.map((obj) => {
          const filename = obj.Key!.replace("artist-songs/", "");
          return filename.replace(".json", "");
        }) || [];

      logger.info(`Found ${artists.length} artists in S3 storage`);
      return artists;
    } catch (error: any) {
      logger.error("Error listing artists from S3:", error);
      throw error;
    }
  }

  /**
   * Check if S3 service is properly configured
   */
  async testConnection(): Promise<boolean> {
    if (!this._checkEnabled()) {
      return false;
    }

    try {
      const command = new HeadBucketCommand({ Bucket: this.bucketName! });
      await this.s3!.send(command);
      logger.info(`S3 connection successful to bucket: ${this.bucketName}`);
      return true;
    } catch (error: any) {
      logger.error(
        `S3 connection failed for bucket ${this.bucketName}: ${error.message}`
      );
      return false;
    }
  }
}

export const s3StorageService = new S3StorageService();
