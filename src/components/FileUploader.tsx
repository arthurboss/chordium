import { useState, useRef } from 'react';
import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import SongMetadataForm from '@/components/SongMetadataForm';
import FileInfo from '@/components/ui/file-info';

interface FileUploaderProps {
  onFileContent: (content: string, fileName: string) => void;
  forceShowMetadata?: boolean;
}

const FileUploader = ({ onFileContent, forceShowMetadata = false }: FileUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [songTuning, setSongTuning] = useState("");
  const [guitarTuning, setGuitarTuning] = useState("");
  const [fileContent, setFileContent] = useState("");
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
        const content = event.target.result as string;
        setFileContent(content);

        // Try to extract a title from the file name (remove extension)
        const fileName = file.name.replace(/\.(txt|text|chord)$/i, '');
        setTitle(fileName);

        // Show metadata form instead of immediately passing content to parent
        setShowMetadataForm(true);
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
    setShowMetadataForm(false);
    setFileContent("");
    setTitle("");
    setArtist("");
    setSongTuning("");
    setGuitarTuning("");
    onFileContent('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = () => {
    // Pass the content and metadata to the parent component
    onFileContent(fileContent, `${title}${artist ? ' - ' + artist : ''}`);
    setShowMetadataForm(false);
  };

  return (
    <>
      <div
        className={`border-2 border-dashed rounded-lg py-5 px-6 text-center ${isDragOver ? 'border-primary bg-primary/5' : 'border-border'
          } transition-colors`}
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

      {selectedFile && (showMetadataForm || forceShowMetadata) && (
        <div className="mt-6">
          <SongMetadataForm
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
        </div>
      )}
    </>
  );
};

export default FileUploader;
