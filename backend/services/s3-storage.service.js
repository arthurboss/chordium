import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import logger from "../utils/logger.js";

class S3StorageService {
  constructor() {
    this.s3 = null;
    this.enabled = null;
    this.bucketName = null;
  }

  _initialize() {
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

  _checkEnabled() {
    this._initialize();
    if (!this.enabled) {
      logger.warn("S3 storage is disabled. Skipping operation.");
      return false;
    }
    return true;
  }

  /**
   * Get artist songs from S3
   * @param {string} artistPath - Artist path (e.g., "hillsong-united")
   * @returns {Array} Artist songs or null if not found
   */
  async getArtistSongs(artistPath) {
    if (!this._checkEnabled()) {
      return null;
    }

    try {
      const key = `artist-songs/${artistPath}.json`;
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const result = await this.s3.send(command);
      const body = await result.Body.transformToString();
      const songs = JSON.parse(body);
      logger.info(`Retrieved ${songs.length} songs for ${artistPath} from S3`);
      return songs;
    } catch (error) {
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
   * @param {string} artistPath - Artist path (e.g., "hillsong-united")
   * @param {Array} songs - Array of song objects
   */
  async storeArtistSongs(artistPath, songs) {
    if (!this._checkEnabled()) {
      return false;
    }

    try {
      // Remove URL field to save storage space - can be reconstructed from path
      const optimizedSongs = songs.map((song) => ({
        title: song.title,
        path: song.path,
        artist: song.artist,
        // URL removed - can be reconstructed as: `${baseUrl}/${artistPath}/${song.path}/`
      }));

      const key = `artist-songs/${artistPath}.json`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: JSON.stringify(optimizedSongs, null, 2),
        ContentType: "application/json",
        Metadata: {
          artist: artistPath,
          "song-count": optimizedSongs.length.toString(),
          "last-updated": new Date().toISOString(),
        },
      });

      await this.s3.send(command);
      logger.info(
        `Stored ${optimizedSongs.length} songs for ${artistPath} in S3 (optimized schema)`
      );
      return true;
    } catch (error) {
      logger.error(
        `Error storing songs to S3 for ${artistPath}:`,
        error.message
      );
      return false; // Return false instead of throwing to allow graceful degradation
    }
  }

  /**
   * Add a song to existing artist songs list
   * @param {string} artistPath - Artist path
   * @param {Object} newSong - Song object to add
   */
  async addSongToArtist(artistPath, newSong) {
    try {
      const existingSongs = (await this.getArtistSongs(artistPath)) || [];

      // Check if song already exists (by path or title)
      const songExists = existingSongs.some(
        (song) => song.path === newSong.path || song.title === newSong.title
      );

      if (!songExists) {
        existingSongs.push(newSong);
        await this.storeArtistSongs(artistPath, existingSongs);
        logger.info(`Added song "${newSong.title}" to ${artistPath}`);
        return true;
      } else {
        logger.info(`Song "${newSong.title}" already exists for ${artistPath}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error adding song to ${artistPath}:`, error);
      throw error;
    }
  }

  /**
   * Remove a song from artist songs list
   * @param {string} artistPath - Artist path
   * @param {string} songPath - Song path to remove
   */
  async removeSongFromArtist(artistPath, songPath) {
    try {
      const existingSongs = await this.getArtistSongs(artistPath);
      if (!existingSongs) {
        logger.info(`No songs found for ${artistPath} to remove from`);
        return false;
      }

      const initialCount = existingSongs.length;
      const updatedSongs = existingSongs.filter(
        (song) => song.path !== songPath
      );

      if (updatedSongs.length < initialCount) {
        await this.storeArtistSongs(artistPath, updatedSongs);
        logger.info(`Removed song with path "${songPath}" from ${artistPath}`);
        return true;
      } else {
        logger.info(`Song with path "${songPath}" not found in ${artistPath}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error removing song from ${artistPath}:`, error);
      throw error;
    }
  }

  /**
   * List all artist song files in S3
   */
  async listArtists() {
    if (!this._checkEnabled()) {
      return [];
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: "artist-songs/",
      });

      const result = await this.s3.send(command);
      const artists =
        result.Contents?.map((obj) => {
          const filename = obj.Key.replace("artist-songs/", "");
          return filename.replace(".json", "");
        }) || [];

      logger.info(`Found ${artists.length} artists in S3 storage`);
      return artists;
    } catch (error) {
      logger.error("Error listing artists from S3:", error);
      throw error;
    }
  }

  /**
   * Check if S3 service is properly configured
   */
  async testConnection() {
    if (!this._checkEnabled()) {
      return false;
    }

    try {
      const command = new HeadBucketCommand({ Bucket: this.bucketName });
      await this.s3.send(command);
      logger.info(`S3 connection successful to bucket: ${this.bucketName}`);
      return true;
    } catch (error) {
      logger.error(
        `S3 connection failed for bucket ${this.bucketName}: ${error.message}`
      );
      return false;
    }
  }
}

export const s3StorageService = new S3StorageService();
