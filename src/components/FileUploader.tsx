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
    songTuning,
    guitarTuning,
    processFile,
    handleFileInputChange,
    handleClearFile,
    handleContinue,
    setTitle,
    setArtist,
    setSongTuning,
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
          songTuning={songTuning}
          guitarTuning={guitarTuning}
          onTitleChange={setTitle}
          onArtistChange={setArtist}
          onSongTuningChange={setSongTuning}
          onGuitarTuningChange={setGuitarTuning}
          onContinue={handleContinue}
        />
      )}
    </>
  );
};

export default FileUploader;
