import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChordUrl, storeChordUrl } from "@/utils/session-storage-utils";
import {
  clearExpiredChordSheetCache,
  getChordSheetWithRefresh,
} from "@/cache/implementations/chord-sheet-cache";

export interface ChordSheetData {
  content: string;
  capo: string;
  tuning: string;
  key: string;
  artist: string;
  song: string;
  loading: boolean;
  error: string | null;
  originalUrl?: string;
}

const initialState: ChordSheetData = {
  content: "",
  capo: "",
  tuning: "",
  key: "",
  artist: "",
  song: "",
  loading: true,
  error: null,
};

export function useChordSheet(url?: string) {
  const [chordData, setChordData] = useState<ChordSheetData>(initialState);
  const params = useParams<{ artist?: string; song?: string; id?: string }>();
  const navigate = useNavigate();

  // Clear expired cache entries when hook is first used
  useEffect(() => {
    clearExpiredChordSheetCache();
  }, []);

  useEffect(() => {
    const fetchChordSheet = async () => {
      // If no URL is provided, first check sessionStorage, then try to construct a URL
      let fetchUrl = url;
      let isStoredUrl = false;
      let isReconstructedUrl = false;

      if (!fetchUrl && params.artist && params.song) {
        // First get a URL to use for fetching, either from storage or reconstructed
        const storedUrl = getChordUrl(params.artist, params.song);

        if (storedUrl) {
          fetchUrl = storedUrl;
          isStoredUrl = true;
          console.log("Found URL in session storage:", fetchUrl);
        } else {
          // Reconstruct the URL from artist and song params
          const artistSlug = params.artist.toLowerCase();
          const songSlug = params.song.toLowerCase();
          fetchUrl = `https://www.cifraclub.com.br/${artistSlug}/${songSlug}/`;
          isReconstructedUrl = true;
          console.log("Reconstructed URL from params:", fetchUrl);
        }
      }

      if (!fetchUrl) {
        setChordData({
          ...initialState,
          loading: false,
          error:
            "Could not find the chord sheet. Please try searching for it again.",
        });
        return;
      }

      setChordData((prev) => ({
        ...prev,
        loading: true,
        originalUrl: fetchUrl,
      }));

      try {
        // Validate URL format
        try {
          new URL(fetchUrl);
        } catch (e) {
          throw new Error(
            "Invalid URL format. Please ensure the URL includes http:// or https://"
          );
        }

        // Use the conditional refresh functionality
        const { immediate, refreshPromise } = await getChordSheetWithRefresh(
          params.artist || null,
          params.song || null,
          fetchUrl,
          // This callback will run if/when background refresh completes
          (updatedData) => {
            console.log("Background refresh completed, updating UI");

            // Update URL to artist/song format if needed
            if (
              updatedData.artist &&
              updatedData.song &&
              (params.artist !==
                updatedData.artist.toLowerCase().replace(/\s+/g, "-") ||
                params.song !==
                  updatedData.song.toLowerCase().replace(/\s+/g, "-"))
            ) {
              const artistSlug = updatedData.artist
                .toLowerCase()
                .replace(/\s+/g, "-");
              const songSlug = updatedData.song
                .toLowerCase()
                .replace(/\s+/g, "-");

              // Store the original URL in sessionStorage and navigate without URL query parameter
              storeChordUrl(artistSlug, songSlug, fetchUrl);

              // Determine if we're in My Songs context based on current path
              const currentPath = window.location.pathname;
              const isMySONgsContext = currentPath.startsWith("/my-songs/");
              const newPath = isMySONgsContext
                ? `/my-songs/${artistSlug}/${songSlug}`
                : `/${artistSlug}/${songSlug}`;

              navigate(newPath, { replace: true });
            }

            setChordData({
              ...updatedData,
              loading: false,
              error: null,
            });
          }
        );

        if (immediate) {
          // We have cached data, show it immediately
          console.log("Showing cached chord sheet data");
          setChordData({
            ...immediate,
            loading: false,
            error: null,
          });

          // The background refresh promise will handle itself via the callback
          refreshPromise.catch((error) => {
            console.error("Background refresh error (silent):", error);
            // We don't show errors from background refresh since user already sees data
          });

          // Skip the rest of the processing
          return;
        }

        // If we got here, we have no cached data and need to wait for the promise
        try {
          const freshData = await refreshPromise;

          if (!freshData) {
            throw new Error("Failed to fetch chord sheet data");
          }

          if (!freshData.content) {
            throw new Error(
              "No chord sheet content found. This song may not be available."
            );
          }

          // Update URL to artist/song format if needed
          if (
            freshData.artist &&
            freshData.song &&
            (params.artist !==
              freshData.artist.toLowerCase().replace(/\s+/g, "-") ||
              params.song !== freshData.song.toLowerCase().replace(/\s+/g, "-"))
          ) {
            const artistSlug = freshData.artist
              .toLowerCase()
              .replace(/\s+/g, "-");
            const songSlug = freshData.song.toLowerCase().replace(/\s+/g, "-");

            // Store the original URL in sessionStorage and navigate without URL query parameter
            storeChordUrl(artistSlug, songSlug, fetchUrl);

            // Determine if we're in My Songs context based on current path
            const currentPath = window.location.pathname;
            const isMySONgsContext = currentPath.startsWith("/my-songs/");
            const newPath = isMySONgsContext
              ? `/my-songs/${artistSlug}/${songSlug}`
              : `/${artistSlug}/${songSlug}`;

            navigate(newPath, { replace: true });
          }

          setChordData({
            ...freshData,
            loading: false,
            error: null,
          });
        } catch (fetchErr) {
          // Re-throw fetch errors for the outer catch block
          throw fetchErr;
        }
      } catch (err) {
        console.error("Error fetching chord sheet:", err);

        // Provide more user-friendly error messages
        let errorMessage: string;

        if (err instanceof DOMException && err.name === "AbortError") {
          errorMessage =
            "Request timed out. The server might be busy or the connection is slow.";
        } else if (err instanceof Error) {
          errorMessage = err.message;
        } else {
          errorMessage = "Failed to load chord sheet. Please try again later.";
        }

        // If we're using a reconstructed URL and it fails, add a hint
        if (isReconstructedUrl) {
          errorMessage +=
            " (Note: Using a URL reconstructed from the artist and song parameters)";
        }

        setChordData({
          ...initialState,
          loading: false,
          error: errorMessage,
          originalUrl: fetchUrl,
        });
      }
    };

    fetchChordSheet();
  }, [url, params.artist, params.song, params.id, navigate]);

  return chordData;
}
