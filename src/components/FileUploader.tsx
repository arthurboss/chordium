
import { useState } from 'react';
import { Upload, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { parseChordFile } from '@/utils/chordUtils';

interface FileUploaderProps {
  onFileContent: (content: string) => void;
}

const FileUploader = ({ onFileContent }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        try {
          const content = e.target.result as string;
          onFileContent(content);
          
          toast({
            title: "File uploaded successfully",
            description: `"${file.name}" has been loaded`,
          });
        } catch (error) {
          console.error("Error parsing file:", error);
          toast({
            variant: "destructive",
            title: "Error parsing file",
            description: "The file format could not be recognized",
            icon: <AlertCircle className="h-5 w-5" />
          });
        }
      }
    };
    
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Error reading file",
        description: "Unable to read the file",
        icon: <AlertCircle className="h-5 w-5" />
      });
    };
    
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-border bg-background'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        {fileName ? (
          <>
            <File className="h-12 w-12 text-chord" />
            <div>
              <p className="text-lg font-medium">{fileName}</p>
              <p className="text-sm text-muted-foreground">File uploaded successfully</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFileName(null);
                onFileContent("");
              }}
            >
              Upload a different file
            </Button>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">Drag and drop your chord file</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports .txt, .crd, and .cho files
              </p>
            </div>
            <div className="flex gap-4 mt-2">
              <Button asChild>
                <label>
                  Browse files
                  <input
                    type="file"
                    accept=".txt,.crd,.cho"
                    className="sr-only"
                    onChange={handleFileInput}
                  />
                </label>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
