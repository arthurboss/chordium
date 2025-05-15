import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { isValidFileType } from '@/utils/file-validation';
import { showInvalidFileFormatError, showFileReadError } from '@/utils/file-toast';
import { extractTitleFromFileName } from '@/utils/file-naming';
import { readFileAsText } from '@/utils/file-reading';
import { extractSongMetadata } from '@/utils/metadata-extraction';

interface UseFileUploadProps {
  onFileContent: (content: string, fileName: string) => void;
}

interface UseFileUploadReturn {
  selectedFile: File | null;
  fileContent: string;
  showMetadataForm: boolean;
  title: string;
  artist: string;
  songKey: string;
  guitarTuning: string;
  processFile: (file: File) => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearFile: () => void;
  handleContinue: () => void;
  setTitle: (title: string) => void;
  setArtist: (artist: string) => void;
  setSongKey: (key: string) => void;
  setGuitarTuning: (tuning: string) => void;
  setFileContent: (content: string) => void;
}

/**
 * Custom hook to manage file upload state and functionality
 */
export const useFileUpload = ({ onFileContent }: UseFileUploadProps): UseFileUploadReturn => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [songKey, setSongKey] = useState("");
  const [guitarTuning, setGuitarTuning] = useState("");
  const { toast } = useToast();

  const processFile = (file: File) => {
    if (!isValidFileType(file)) {
      showInvalidFileFormatError(toast);
      return;
    }

    setSelectedFile(file);
    
    readFileAsText(
      file,
      (content) => {
        setFileContent(content);
        
        // Reset metadata fields first to avoid stale data
        setTitle("");
        setArtist("");
        setSongKey("");
        setGuitarTuning("");
        
        // Extract metadata from content and filename
        const metadata = extractSongMetadata(content, file.name);
        
        // Use extracted title or fall back to filename
        const extractedTitle = metadata.title || extractTitleFromFileName(file.name);
        setTitle(extractedTitle);
        
        // Set additional metadata if available
        if (metadata.artist) setArtist(metadata.artist);
        if (metadata.songKey) setSongKey(metadata.songKey);
        if (metadata.guitarTuning) setGuitarTuning(metadata.guitarTuning);
        
        // Show metadata form
        setShowMetadataForm(true);
      },
      () => showFileReadError(toast)
    );
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setShowMetadataForm(false);
    setFileContent("");
    setTitle("");
    setArtist("");
    setSongKey("");
    setGuitarTuning("");
    onFileContent('', '');
  };

  const handleContinue = () => {
    // Pass the content and metadata to the parent component
    const formattedName = `${title}${artist ? ' - ' + artist : ''}`;
    onFileContent(fileContent, formattedName);
    setShowMetadataForm(false);
  };

  return {
    selectedFile,
    fileContent,
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
    setGuitarTuning,
    setFileContent
  };
};
