// S3 artist song cache service
import { s3StorageService as S3StorageService } from './s3-storage.service.js';

async function getCachedArtistSongs(artistPath) {
  return await S3StorageService.getArtistSongs(artistPath);
}

async function storeArtistSongs(artistPath, songs) {
  return await S3StorageService.storeArtistSongs(artistPath, songs);
}

async function addSongToArtist(artistName, song) {
  return await S3StorageService.addSongToArtist(artistName, song);
}

async function removeSongFromArtist(artistName, songPath) {
  return await S3StorageService.removeSongFromArtist(artistName, songPath);
}

async function listArtists() {
  return await S3StorageService.listArtists();
}

export {
  getCachedArtistSongs,
  storeArtistSongs,
  addSongToArtist,
  removeSongFromArtist,
  listArtists
};
