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
import {
  deleteChordSheet,
  getChordSheetContent,
  getFullChordSheetContent,
  storeChordSheet,
} from "@/storage/stores/chord-sheets/operations";
import { getStoredLyrics } from "@/storage/services/lyrics-storage";
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  importBackup,
  type BackupSong,
  type ChordiumBackup,
} from "@/storage/services/backup";
import { toast } from "sonner";
import { cyAttr } from "@/utils/test-utils";
import { toSlug } from "@/utils/url-slug-utils";
import { mapStringToGuitarTuning } from "@/utils/guitar-tuning-utils";
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

      toast.success(i18n.t("notifications:uploadSaved"), { description: i18n.t("notifications:uploadSavedDesc", { title: metadata.title }) });

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
      toast.error(i18n.t("notifications:uploadSaveFailed"), { description: i18n.t("notifications:uploadSaveFailedDesc") });
    }
  };

  const handleChordSheetsDelete = async (songPaths: string[]) => {
    if (songPaths.length === 0) return;

    try {
      const songs: BackupSong[] = [];
      for (const songPath of songPaths) {
        const metadata = myChordSheets.find((song) => song.path === songPath);
        if (!metadata) continue;
        const [chordSheet, fullChordSheet, lyrics] = await Promise.all([
          getChordSheetContent(songPath),
          getFullChordSheetContent(songPath),
          getStoredLyrics(songPath),
        ]);
        songs.push({
          metadata,
          ...(chordSheet ? { chordSheet } : {}),
          ...(fullChordSheet ? { fullChordSheet } : {}),
          ...(lyrics ? { lyrics } : {}),
        });
      }

      const backup: ChordiumBackup = {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        songs,
      };

      for (const songPath of songPaths) {
        await deleteChordSheet(songPath);
      }

      toast.success(i18n.t("notifications:bulkRemoved", { count: songPaths.length }), {
        duration: 12000,
        action: {
          label: i18n.t("notifications:undo"),
          onClick: async () => {
            try {
              await importBackup(backup);
              await setMySongs();
              toast.success(i18n.t("notifications:bulkRestored", { count: songs.length }));
            } catch (error) {
              if (import.meta.env.DEV) {
                console.error("Failed to restore chord sheets:", error);
              }
              toast.error(i18n.t("notifications:bulkRestoreFailed"), {
                description: i18n.t("notifications:bulkRestoreFailedDesc"),
              });
            }
          },
        },
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to remove chord sheets:", error);
      }
      toast.error(i18n.t("notifications:bulkRemoveFailed"), {
        description: i18n.t("notifications:bulkRemoveFailedDesc"),
      });
    } finally {
      await setMySongs();
      if (selectedSong && songPaths.includes(selectedSong.path)) {
        setSelectedSong(null);
      }
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
            onDeleteChordSheets={handleChordSheetsDelete}
            onUploadClick={() => handleTabChange("upload")}
          />
        </div>
      </div>
    </Tabs>
  );
};

export default TabContainer;
