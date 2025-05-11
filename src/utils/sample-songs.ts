import { SongData } from '../types/song';

export const loadSampleSongs = async (): Promise<Omit<SongData, "dateAdded">[]> => {
  const sampleSong1Content = await fetch("/src/data/songs/wonderwall.txt").then(res =>
    res.text()
  );
  const sampleSong2Content = await fetch(
    "/src/data/songs/hotel-california.txt"
  ).then((res) => res.text());

  return [
    {
      id: "wonderwall",
      title: "Wonderwall",
      artist: "Oasis",
      path: sampleSong1Content,
    },
    { 
      id: "hotel-california", 
      title: "Hotel California", 
      artist: "Eagles", 
      path: sampleSong2Content 
    },
  ];
};
