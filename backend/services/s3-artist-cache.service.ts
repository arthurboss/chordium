// S3 artist song cache service
import { s3StorageService as S3StorageService } from "./s3-storage.service.js";
import type { Song } from "../../shared/types/index.js";

async function getCachedArtistSongs(
  artistPath: string
): Promise<Song[] | null> {
  return await S3StorageService.getArtistSongs(artistPath);
}

async function storeArtistSongs(
  artistPath: string,
  songs: Song[]
): Promise<boolean> {
  return await S3StorageService.storeArtistSongs(artistPath, songs);
}

async function addSongToArtist(
  artistName: string,
  song: Song
): Promise<boolean> {
  return await S3StorageService.addSongToArtist(artistName, song);
}

async function removeSongFromArtist(
  artistName: string,
  songPath: string
): Promise<boolean> {
  return await S3StorageService.removeSongFromArtist(artistName, songPath);
}

async function listArtists(): Promise<string[]> {
  return await S3StorageService.listArtists();
}

export {
  getCachedArtistSongs,
  storeArtistSongs,
  addSongToArtist,
  removeSongFromArtist,
  listArtists,
};
