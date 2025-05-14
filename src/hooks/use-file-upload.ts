import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { isValidFileType } from '@/utils/file-validation';
import { showInvalidFileFormatError, showFileReadError } from '@/utils/file-toast';
import { extractTitleFromFileName } from '@/utils/file-naming';
import { readFileAsText } from '@/utils/file-reading';

interface UseFileUploadProps {
  onFileContent: (content: string, fileName: string) => void;
}

interface UseFileUploadReturn {
  selectedFile: File | null;
  fileContent: string;
  showMetadataForm: boolean;
  title: string;
  artist: string;
  songTuning: string;
  guitarTuning: string;
  processFile: (file: File) => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearFile: () => void;
  handleContinue: () => void;
  setTitle: (title: string) => void;
  setArtist: (artist: string) => void;
  setSongTuning: (tuning: string) => void;
  setGuitarTuning: (tuning: string) => void;
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
  const [songTuning, setSongTuning] = useState("");
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
        
        // Extract title from filename
        const extractedTitle = extractTitleFromFileName(file.name);
        setTitle(extractedTitle);
        
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
    setSongTuning("");
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
  };
};
