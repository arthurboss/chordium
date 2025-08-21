import { useDragAndDrop } from '@/hooks/use-drag-and-drop';
import { useFileUpload } from '@/hooks/use-file-upload';
import DropZone from '@/components/DropZone';
import SongMetadataForm from '@/components/SongMetadataForm';

interface FileUploaderProps {
  onFileContent: (content: string, fileName: string, metadata?: {
    title: string;
    artist: string;
    songKey: string;
    guitarTuning: string;
    guitarCapo: number;
  }) => void;
  externalShowMetadata?: boolean;
  onShowMetadataChange?: (show: boolean) => void;
}

const FileUploader = ({ onFileContent, externalShowMetadata, onShowMetadataChange }: FileUploaderProps) => {
  const {
    selectedFile,
    showMetadataForm,
    title,
    artist,
    songKey,
    guitarTuning,
    guitarCapo,
    processFile,
    handleFileInputChange,
    handleClearFile,
    handleContinue,
    setTitle,
    setArtist,
    setSongKey,
    setGuitarTuning,
    setGuitarCapo
  } = useFileUpload({ onFileContent, externalShowMetadata, onShowMetadataChange });
  
  const { 
    isDragOver, 
    handleDragOver, 
    handleDragLeave, 
    handleDrop 
  } = useDragAndDrop({ onFileDrop: processFile });

  return (
    <>
      <DropZone 
        isDragOver={isDragOver}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        selectedFile={selectedFile}
        onFileInputChange={handleFileInputChange}
        onClearFile={handleClearFile}
      />

      {selectedFile && showMetadataForm && (
          <SongMetadataForm
            title={title}
            artist={artist}
            songKey={songKey}
            guitarTuning={guitarTuning}
            guitarCapo={guitarCapo}
            onTitleChange={setTitle}
            onArtistChange={setArtist}
            onSongKeyChange={setSongKey}
            onGuitarTuningChange={setGuitarTuning}
            onGuitarCapoChange={setGuitarCapo}
            onContinue={handleContinue}
          />
      )}
    </>
  );
};

export default FileUploader;
