import { useState, RefObject } from "react";
import { Card, CardContent } from "@/components/ui/card";
import FileUploader from "@/components/FileUploader";
import ChordDisplay from "@/components/ChordDisplay";
import ChordEditToolbar from "@/components/ChordDisplay/ChordEditToolbar";

interface UploadTabProps {
  chordDisplayRef: RefObject<HTMLDivElement>;
  onSaveUploadedSong: (content: string, title: string) => void;
}

const UploadTab = ({ chordDisplayRef, onSaveUploadedSong }: UploadTabProps) => {
  const [uploadedContent, setUploadedContent] = useState("");
  const [uploadedTitle, setUploadedTitle] = useState("");
  const [showMetadata, setShowMetadata] = useState(false);
  
  const handleFileUpload = (content: string, fileName: string) => {
    setUploadedContent(content);
    
    if (fileName) {
      const title = fileName.replace(/\.[^/.]+$/, "");
      setUploadedTitle(title);
    }
    
    // When we receive content from FileUploader, we're now showing content, not metadata form
    setShowMetadata(false);
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
      <FileUploader 
        onFileContent={handleFileUpload}
        forceShowMetadata={showMetadata}
      />
      
      {uploadedContent && !showMetadata && (
        <div className="mt-6 animate-fade-in">
          <Card className="mb-4">
            <CardContent className="p-3 sm:p-4">
              <ChordEditToolbar 
                onSave={handleSave}
                onReturn={() => {
                  // Don't clear the content yet, just show the metadata form
                  setShowMetadata(true);
                }}
              />
            </CardContent>
          </Card>
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
