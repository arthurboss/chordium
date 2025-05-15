import { useDragAndDrop } from '@/hooks/use-drag-and-drop';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useState } from 'react';
import DropZone from '@/components/DropZone';
import MetadataFormSection from '@/components/MetadataFormSection';
import ChordEdit from './ChordDisplay/ChordEdit';

interface FileUploaderProps {
  onFileContent: (content: string, fileName: string) => void;
  forceShowMetadata?: boolean;
}

const FileUploader = ({ onFileContent, forceShowMetadata = false }: FileUploaderProps) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    selectedFile,
    showMetadataForm,
    title,
    artist,
    songKey,
    guitarTuning,
    fileContent,
    processFile,
    handleFileInputChange,
    handleClearFile,
    setTitle,
    setArtist,
    setSongKey,
    setGuitarTuning,
    setFileContent
  } = useFileUpload({ onFileContent });
  
  const { 
    isDragOver, 
    handleDragOver, 
    handleDragLeave, 
    handleDrop 
  } = useDragAndDrop({ onFileDrop: processFile });

  const handleMetadataFormContinue = () => {
    setIsEditMode(true); // Switch to edit mode instead of continuing
  };

  const handleSaveEdits = () => {
    // When editing is done, call onFileContent with the updated content
    onFileContent(fileContent, `${title}${artist ? ' - ' + artist : ''}`);
    setIsEditMode(false);
  };

  return (
    <>
      {!isEditMode && (
        <DropZone 
          isDragOver={isDragOver}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          selectedFile={selectedFile}
          onFileInputChange={handleFileInputChange}
          onClearFile={handleClearFile}
        />
      )}

      {selectedFile && !isEditMode && (showMetadataForm || forceShowMetadata) && (
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
          onContinue={handleMetadataFormContinue}
        />
      )}

      {isEditMode && (
        <ChordEdit 
          editContent={fileContent}
          setEditContent={(content) => setFileContent(content)}
          handleSaveEdits={handleSaveEdits}
          setIsEditing={() => setIsEditMode(false)}
        />
      )}
    </>
  );
};

export default FileUploader;
