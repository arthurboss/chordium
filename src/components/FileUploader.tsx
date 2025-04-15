
import { useState, useRef } from 'react';
import { FileUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onFileContent: (content: string, fileName: string) => void;
}

const FileUploader = ({ onFileContent }: FileUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.text') && !file.name.endsWith('.chord')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a text file (.txt, .text, or .chord)",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        onFileContent(event.target.result as string, file.name);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "There was a problem reading the file content",
        variant: "destructive",
      });
    };
    
    reader.readAsText(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    onFileContent('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-border'
        } transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 text-primary rounded-full p-3 mb-3">
              <FileUp size={24} />
            </div>
            <p className="font-medium mb-1">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground mb-3">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearFile}
              className="gap-1"
            >
              <X size={16} />
              <span>Remove</span>
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-muted rounded-full p-3 inline-block mb-3">
              <FileUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Upload a chord sheet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop a text file here, or click to browse
            </p>
            <Button 
              variant="outline" 
              onClick={handleBrowseClick}
              className="mx-auto"
            >
              Browse Files
            </Button>
          </>
        )}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".txt,.text,.chord"
          onChange={handleFileInputChange}
        />
      </div>
    </div>
  );
};

export default FileUploader;
