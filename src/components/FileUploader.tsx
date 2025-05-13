import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Import UI components
import FileDropZone from '@/components/ui/file-drop-zone';
import FileInfo from '@/components/ui/file-info';
import FileUploadPrompt from '@/components/ui/file-upload-prompt';

// Import utility functions
import { setupPdfJs } from '@/utils/pdfUtils';
import { 
  isPdfFile, 
  isTxtFile, 
  processPdfFile, 
  processTxtFile, 
  type ProcessedFile
} from '@/utils/fileProcessingUtils';

interface FileUploaderProps {
  onFileContent: (content: string, fileName: string) => void;
}

const FileUploader = ({ onFileContent }: FileUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfJsReady, setIsPdfJsReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize PDF.js when component mounts
  useEffect(() => {
    const initializePdfJs = async () => {
      const isReady = await setupPdfJs();
      setIsPdfJsReady(isReady);
    };
    
    initializePdfJs();
  }, []);

  // Process the selected file - define this first to avoid the dependency warning
  const handleFileSelection = useCallback(async (file: File) => {
    console.log('Processing file:', file.name, 'Type:', file.type);
    
    // Validate file type
    if (!isPdfFile(file) && !isTxtFile(file)) {
      console.log('Invalid file format detected:', file.name, file.type);
      toast({
        title: "Invalid file format",
        description: "Please upload a text file (.txt) or a PDF file (.pdf)",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);
    
    try {
      let processedFile: ProcessedFile;
      
      if (isTxtFile(file)) {
        // Process text file
        processedFile = await processTxtFile(file);
      } else {
        // Process PDF file
        processedFile = await processPdfFile(file, isPdfJsReady);
      }
      
      onFileContent(processedFile.content, processedFile.fileName);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isPdfJsReady, onFileContent, toast]);

  // Event handlers with useCallback for better performance
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, [handleFileSelection]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  }, [handleFileSelection]);

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    onFileContent('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFileContent]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <FileDropZone
        isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <FileInfo
            fileName={selectedFile.name}
            onRemoveFile={handleClearFile}
          />
        ) : (
          <FileUploadPrompt
            onBrowseClick={handleBrowseClick}
            isLoading={isLoading}
            isPdfJsReady={isPdfJsReady}
          />
        )}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".txt,.pdf,application/pdf,text/plain"
          onChange={handleFileInputChange}
        />
      </FileDropZone>
    </div>
  );
};

export default FileUploader;
