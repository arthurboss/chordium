import { useState, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import ChordDisplay from "@/components/ChordDisplay";

interface UploadTabProps {
  chordDisplayRef: RefObject<HTMLDivElement>;
  onSaveUploadedSong: (content: string, title: string) => void;
}

const UploadTab = ({ chordDisplayRef, onSaveUploadedSong }: UploadTabProps) => {
  const [uploadedContent, setUploadedContent] = useState("");
  const [uploadedTitle, setUploadedTitle] = useState("");
  
  const handleFileUpload = (content: string, fileName: string) => {
    setUploadedContent(content);
    
    if (fileName) {
      const title = fileName.replace(/\.[^/.]+$/, "");
      setUploadedTitle(title);
    }
  };

  const handleSave = () => {
    if (uploadedContent.trim()) {
      onSaveUploadedSong(uploadedContent, uploadedTitle || "Untitled Song");
      setUploadedContent("");
      setUploadedTitle("");
    }
  };

  return (
    <div className="space-y-4">
      <FileUploader onFileContent={handleFileUpload} />
      
      {uploadedContent && (
        <div className="mt-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Uploaded Chord Sheet</h2>
            <Button 
              onClick={handleSave}
              size="sm"
              className="flex items-center gap-1"
              tabIndex={0}
              aria-label="Save to My Songs"
            >
              <Save className="h-4 w-4" />
              <span>Save to My Songs</span>
            </Button>
          </div>
          <ChordDisplay 
            ref={chordDisplayRef}
            title={uploadedTitle || undefined}
            content={uploadedContent} 
          />
        </div>
      )}
    </div>
  );
};

export default UploadTab;
