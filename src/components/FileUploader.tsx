import { useState, useRef } from 'react';
import { FileUp, Trash2 } from 'lucide-react';
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
    if (!file.name.endsWith('.txt')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a text file (.txt)",
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
    <div className="w-full max-w-3xl mx-auto">
      <div 
        className={`border-2 border-dashed rounded-lg ${
          selectedFile ? 'p-3' : 'p-6'
        } text-center ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-border'
        } transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileUp className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium truncate">{selectedFile.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearFile}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove</span>
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
          accept=".txt"
          onChange={handleFileInputChange}
        />
      </div>
    </div>
  );
};

export default FileUploader;
