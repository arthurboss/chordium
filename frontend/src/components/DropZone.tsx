import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import FileInfo from "@/components/ui/file-info";

interface DropZoneProps {
  isDragOver: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
  selectedFile: File | null;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
}

/**
 * Component that renders a drop zone for file uploads
 */
const DropZone = ({
  isDragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  selectedFile,
  onFileInputChange,
  onClearFile,
}: DropZoneProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg py-5 px-6 text-center ${
        isDragOver ? "border-primary bg-primary/5" : "border-border"
      } transition-colors`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {selectedFile ? (
        <FileInfo fileName={selectedFile.name} onRemoveFile={onClearFile} />
      ) : (
        <>
          <div className="rounded-full border border-primary/50 bg-primary/5 text-primary/80 p-3 inline-block mb-3">
            <FileUp className="h-6 w-6" />
          </div>
          <h3 className="font-medium mb-1">{t("dropZone.title")}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t("dropZone.subtitle")}</p>
          <Button
            variant="ghost"
            onClick={handleBrowseClick}
            className="mx-auto shadow-sm bg-card"
          >
            {t("dropZone.browse")}
          </Button>
        </>
      )}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".txt,.text,.chord"
        onChange={onFileInputChange}
      />
    </div>
  );
};

export default DropZone;
