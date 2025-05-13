import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadPromptProps {
  onBrowseClick: () => void;
  isLoading: boolean;
  isPdfJsReady: boolean;
}

const FileUploadPrompt = ({ 
  onBrowseClick, 
  isLoading,
  isPdfJsReady
}: FileUploadPromptProps) => {
  return (
    <>
      <div className="bg-muted rounded-full p-3 inline-block mb-3">
        <FileUp className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-1">Upload a chord sheet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Drag and drop a text file or PDF here, or click to browse
      </p>
      <Button 
        variant="outline" 
        onClick={onBrowseClick}
        className="mx-auto"
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Browse Files'}
      </Button>
      {!isPdfJsReady && (
        <p className="text-xs text-amber-500 mt-2">
          PDF support is initializing...
        </p>
      )}
    </>
  );
};

export default FileUploadPrompt;
