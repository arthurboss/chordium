import { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Song } from "../types/song";
import type { StoredSongMetadata } from "@/storage/types";
import type { ChordSheet } from "@chordium/types";
import ChordSheetList from "./chord-sheet-list";
import { SearchTab } from "@/search";
import UploadTab from "./tabs/UploadTab";
import { scrollToElement } from "../utils/scroll-utils";
import { deleteChordSheet, storeChordSheet } from "@/storage/stores/chord-sheets/operations";
import { toast } from "@/hooks/use-toast";
import { cyAttr } from "@/utils/test-utils";
import { toSlug } from "@/utils/url-slug-utils";
import { GUITAR_TUNINGS } from "@/constants/guitar-tunings";
import i18n from "@/i18n/config";

interface TabContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  myChordSheets: StoredSongMetadata[];
  setMySongs: () => Promise<void>;
  selectedSong: Song | null;
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>;
}

const TabContainer = ({
  activeTab,
  setActiveTab,
  myChordSheets,
  setMySongs,
  selectedSong,
  setSelectedSong
}: TabContainerProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const chordDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedSong) {
      scrollToElement(chordDisplayRef.current);
    }
  }, [selectedSong]);

  const navigateToSearch = () => {
    try {
      const storedQuery = sessionStorage.getItem("chordium_search_query");
      if (storedQuery) {
        const { lastRoute } = JSON.parse(storedQuery);
        if (lastRoute) {
          navigate(lastRoute);
          return;
        }
      }
    } catch (error) {
      console.warn("Failed to restore route from session storage:", error);
    }
    navigate("/search");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedSong(null);

    if (value === "upload") {
      navigate("/upload");
    } else if (value === "search") {
      navigateToSearch();
    } else if (value === "my-chord-sheets") {
      navigate("/my-chord-sheets");
    }
  };

  const handleSongSelect = (metadata: StoredSongMetadata) => {
    if (metadata.artist && metadata.title) {
      const artistSlug = toSlug(metadata.artist);
      const songSlug = toSlug(metadata.title);
      const targetUrl = `/${artistSlug}/${songSlug}`;
      navigate(targetUrl, {
        state: {
          song: {
            path: metadata.path,
            title: metadata.title,
            artist: metadata.artist
          }
        }
      });
    } else {
      navigate(`/${encodeURIComponent(metadata.path)}`, {
        state: {
          song: {
            path: metadata.path,
            title: metadata.title,
            artist: metadata.artist
          }
        }
      });
    }
  };

  function mapStringToGuitarTuning(tuning: string) {
    const normalized = tuning.trim().toLowerCase();
    for (const key in GUITAR_TUNINGS) {
      if (
        key.toLowerCase() === normalized ||
        GUITAR_TUNINGS[key as keyof typeof GUITAR_TUNINGS].join("-").toLowerCase() ===
          normalized.replace(/\s+/g, "-")
      ) {
        return GUITAR_TUNINGS[key as keyof typeof GUITAR_TUNINGS];
      }
    }
    return GUITAR_TUNINGS.STANDARD;
  }

  const handleSaveUploadedChordSheet = async (meta: {
    content: string;
    title: string;
    artist: string;
    songKey: string;
    guitarTuning: string;
    guitarCapo: number;
  }) => {
    try {
      const guitarCapo = meta.guitarCapo || 0;
      const mappedTuning = mapStringToGuitarTuning(meta.guitarTuning);

      const metadata = {
        title: meta.title || "Untitled Song",
        artist: meta.artist || "Unknown Artist",
        songKey: meta.songKey || "",
        guitarTuning: mappedTuning,
        guitarCapo
      };

      const content: ChordSheet = {
        songChords: meta.content
      };

      const artistSlug = toSlug(metadata.artist);
      const titleSlug = toSlug(metadata.title);
      const path = `${artistSlug}/${titleSlug}`;

      await storeChordSheet(metadata, content, true, path);

      toast({
        title: i18n.t("notifications:uploadSaved"),
        description: i18n.t("notifications:uploadSavedDesc", { title: metadata.title }),
      });

      await setMySongs();
      navigate(`/${artistSlug}/${titleSlug}`, {
        state: {
          song: {
            path,
            title: metadata.title,
            artist: metadata.artist
          }
        }
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to save uploaded chord sheet:", error);
      }
      toast({
        title: i18n.t("notifications:uploadSaveFailed"),
        description: i18n.t("notifications:uploadSaveFailedDesc"),
        variant: "destructive"
      });
    }
  };

  const handleChordSheetDelete = async (songPath: string) => {
    const songToDelete = myChordSheets.find(song => song.path === songPath);

    if (!songToDelete) {
      if (import.meta.env.DEV) {
        console.error("Song not found for deletion:", songPath);
      }
      return;
    }

    try {
      await deleteChordSheet(songPath);

      toast({
        title: i18n.t("notifications:uploadRemoved"),
        description: i18n.t("notifications:uploadRemovedDesc", { title: songToDelete.title }),
      });

      await setMySongs();

      if (selectedSong?.path === songPath) {
        setSelectedSong(null);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to remove chord sheet:", error);
      }
      toast({
        title: i18n.t("notifications:uploadRemoveFailed"),
        description: i18n.t("notifications:uploadRemoveFailedDesc", { title: songToDelete.title }),
        variant: "destructive"
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, value: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTabChange(value);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList
        className="grid w-full grid-cols-[repeat(auto-fit,_minmax(0,_1fr))]"
        role="tablist"
        {...cyAttr("tabs-list")}
      >
        <TabsTrigger
          value="my-chord-sheets"
          className="text-xs sm:text-sm"
          onKeyDown={(e) => handleKeyDown(e, "my-chord-sheets")}
          {...cyAttr("tab-my-chord-sheets")}
        >
          {t("tabs.myChordSheets")}
        </TabsTrigger>
        <TabsTrigger
          value="search"
          className="text-xs sm:text-sm"
          onKeyDown={(e) => handleKeyDown(e, "search")}
          {...cyAttr("tab-search")}
        >
          {t("tabs.search")}
        </TabsTrigger>
        <TabsTrigger
          value="upload"
          className="text-xs sm:text-sm"
          onKeyDown={(e) => handleKeyDown(e, "upload")}
          {...cyAttr("tab-upload")}
        >
          {t("tabs.upload")}
        </TabsTrigger>
      </TabsList>

      <div className="mt-4 sm:mt-6">
        <div className={activeTab === "search" ? "" : "hidden"}>
          <SearchTab
            setMySongs={setMySongs}
            setActiveTab={setActiveTab}
            setSelectedSong={setSelectedSong}
          />
        </div>
        <div className={activeTab === "upload" ? "" : "hidden"}>
          <UploadTab
            chordDisplayRef={chordDisplayRef}
            onSaveUploadedSong={handleSaveUploadedChordSheet}
          />
        </div>
        <div className={activeTab === "my-chord-sheets" ? "" : "hidden"}>
          <ChordSheetList
            chordSheets={myChordSheets}
            onChordSheetSelect={handleSongSelect}
            onDeleteChordSheet={handleChordSheetDelete}
            onUploadClick={() => handleTabChange("upload")}
          />
        </div>
      </div>
    </Tabs>
  );
};

export default TabContainer;
