import { useEffect } from "react";
import { fromSlug } from "@/utils/url-slug-utils";

export function useInitSearchStateEffect(
  location: { search: string },
  isInitialized: React.MutableRefObject<boolean>,
  setArtistInput: (artist: string) => void,
  setSongInput: (song: string) => void,
  setPrevArtistInput: (artist: string) => void,
  setPrevSongInput: (song: string) => void,
  setSubmittedArtist: (artist: string) => void,
  setSubmittedSong: (song: string) => void,
  updateSearchState: (state: { artist: string; song: string; results: any[] }) => void,
  setHasSearched: (val: boolean) => void,
  setShouldFetch: (val: boolean) => void
) {
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const artistParam = searchParams.get('artist');
    const songParam = searchParams.get('song');
    if ((artistParam || songParam) && !isInitialized.current) {
      const artist = artistParam ? fromSlug(artistParam) : '';
      const song = songParam ? fromSlug(songParam) : '';
      setArtistInput(artist);
      setSongInput(song);
      setPrevArtistInput(artist);
      setPrevSongInput(song);
      setSubmittedArtist(artist);
      setSubmittedSong(song);
      updateSearchState({ artist, song, results: [] });
      setHasSearched(true);
      setShouldFetch(true);
      isInitialized.current = true;
    }
  }, [location.search, updateSearchState]);
}
