import { useState, RefObject } from "react";
import { Card, CardContent } from "@/components/ui/card";
import FileUploader from "@/components/FileUploader";
import ChordDisplay from "@/components/ChordDisplay";

import ChordEditToolbar from "@/components/ChordDisplay/ChordEditToolbar";
import { GUITAR_TUNINGS } from "@/constants/guitar-tunings";
import { extractSongMetadata } from "@/utils/metadata-extraction";
import { ChordSheet } from "@chordium/types";

interface UploadedChordSheetMeta extends Omit<ChordSheet, 'guitarTuning' | 'songChords'> {
  content: string;
  guitarTuning: ChordSheet['guitarTuning'] | string; // Allow string for flexibility
}

interface UploadTabProps {
  chordDisplayRef: RefObject<HTMLDivElement>;
  onSaveUploadedSong: (meta: UploadedChordSheetMeta) => void;
}

const UploadTab = ({ chordDisplayRef, onSaveUploadedSong }: UploadTabProps) => {
  const [uploadedContent, setUploadedContent] = useState("");
  const [uploadedTitle, setUploadedTitle] = useState("");
  const [uploadedArtist, setUploadedArtist] = useState("");
  const [uploadedSongKey, setUploadedSongKey] = useState("");
  const [uploadedGuitarTuning, setUploadedGuitarTuning] = useState("");
  const [uploadedGuitarCapo, setUploadedGuitarCapo] = useState(0);
  const [showMetadata, setShowMetadata] = useState(false);

  const handleFileUpload = (content: string, fileName: string, metadata?: {
    title: string;
    artist: string;
    songKey: string;
    guitarTuning: string;
    guitarCapo: number;
  }) => {
    setUploadedContent(content);

    if (metadata) {
      // Use the user-entered metadata from the form
      setUploadedTitle(metadata.title);
      setUploadedArtist(metadata.artist);
      setUploadedSongKey(metadata.songKey);
      setUploadedGuitarTuning(metadata.guitarTuning);
      setUploadedGuitarCapo(metadata.guitarCapo);
    } else {
      // Extract metadata from content and filename (fallback)
      const extractedMetadata = extractSongMetadata(content, fileName);
      setUploadedTitle(extractedMetadata.title || "");
      setUploadedArtist(extractedMetadata.artist || "");
      setUploadedSongKey(extractedMetadata.songKey || "");
      setUploadedGuitarTuning(extractedMetadata.guitarTuning || "");
      setUploadedGuitarCapo(extractedMetadata.guitarCapo || 0);
    }

    // Don't show metadata form here - let FileUploader handle it
    setShowMetadata(false);
  };

  const handleSave = () => {
    if (uploadedContent.trim()) {
      onSaveUploadedSong({
        content: uploadedContent,
        title: uploadedTitle || "Untitled Song",
        artist: uploadedArtist || "Unknown Artist",
        songKey: uploadedSongKey,
        guitarTuning: uploadedGuitarTuning,
        guitarCapo: uploadedGuitarCapo
      });
      setUploadedContent("");
      setUploadedTitle("");
      setUploadedArtist("");
      setUploadedSongKey("");
      setUploadedGuitarTuning("");
      setShowMetadata(false);
    }
  };

  // Map string tuning to GuitarTuning array for preview
  function mapStringToGuitarTuning(tuning: string) {
    const normalized = tuning.trim().toLowerCase();
    for (const key in GUITAR_TUNINGS) {
      if (
        key.toLowerCase() === normalized ||
        GUITAR_TUNINGS[key as keyof typeof GUITAR_TUNINGS].join('-').toLowerCase() === normalized.replace(/\s+/g, '-')
      ) {
        return GUITAR_TUNINGS[key as keyof typeof GUITAR_TUNINGS];
      }
    }
    return GUITAR_TUNINGS.STANDARD;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <FileUploader
        onFileContent={handleFileUpload}
        externalShowMetadata={showMetadata}
        onShowMetadataChange={setShowMetadata}
      />
      {uploadedContent && !showMetadata && (
        <div className="mt-6 animate-fade-in">
          <Card className="mb-4">
            <CardContent className="p-3 sm:p-4">
              <ChordEditToolbar
                onSave={handleSave}
                onReturn={() => {
                  setShowMetadata(true);
                }}
              />
            </CardContent>
          </Card>
          <ChordDisplay
            ref={chordDisplayRef}
            chordSheet={{
              title: uploadedTitle || "Untitled Song",
              artist: uploadedArtist || "Unknown Artist",
              songChords: uploadedContent,
              songKey: uploadedSongKey,
              guitarTuning: mapStringToGuitarTuning(uploadedGuitarTuning),
              guitarCapo: uploadedGuitarCapo
            }}
            content={uploadedContent}
            showControlsBar={false}
          />
        </div>
      )}
    </div>
  );
};

export default UploadTab;
