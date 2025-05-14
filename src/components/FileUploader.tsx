import { useDragAndDrop } from '@/hooks/use-drag-and-drop';
import { useFileUpload } from '@/hooks/use-file-upload';
import DropZone from '@/components/DropZone';
import MetadataFormSection from '@/components/MetadataFormSection';

interface FileUploaderProps {
  onFileContent: (content: string, fileName: string) => void;
  forceShowMetadata?: boolean;
}

const FileUploader = ({ onFileContent, forceShowMetadata = false }: FileUploaderProps) => {
  const {
    selectedFile,
    showMetadataForm,
    title,
    artist,
    songKey,
    guitarTuning,
    processFile,
    handleFileInputChange,
    handleClearFile,
    handleContinue,
    setTitle,
    setArtist,
    setSongKey,
    setGuitarTuning
  } = useFileUpload({ onFileContent });
  
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

      {selectedFile && (showMetadataForm || forceShowMetadata) && (
        <MetadataFormSection 
          show={true}
          title={title}
          artist={artist}
          songKey={songKey}
          guitarTuning={guitarTuning}
          onTitleChange={setTitle}
          onArtistChange={setArtist}
          onSongKeyChange={setSongKey}
          onGuitarTuningChange={setGuitarTuning}
          onContinue={handleContinue}
        />
      )}
    </>
  );
};

export default FileUploader;
