import { useState, useMemo } from "react";
import artistsData from "@/mocks/artists.json";
import songsData from "@/mocks/songs.json";

export function useSearchResults(artist: string, song: string) {
  // Use mock data
  const artists = artistsData.artists;
  const songs = songsData;

  // Filter artists
  const filteredArtists = useMemo(() => {
    if (!artist) return artists;
    return artists.filter(a =>
      a.title.toLowerCase().includes(artist.toLowerCase())
    );
  }, [artist, artists]);

  // Filter songs
  const filteredSongs = useMemo(() => {
    let filtered = songs;
    if (artist) {
      filtered = filtered.filter(s =>
        s.url.toLowerCase().includes(artist.toLowerCase().replace(/\s+/g, "-"))
      );
    }
    if (song) {
      filtered = filtered.filter(s =>
        (s.title || "").toLowerCase().includes(song.toLowerCase())
      );
    }
    return filtered;
  }, [artist, song, songs]);

  return {
    artists: filteredArtists,
    songs: filteredSongs,
    loading: false,
    error: null
  };
}
