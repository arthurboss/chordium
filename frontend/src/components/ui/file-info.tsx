import { FileUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoundTrashButton from './RoundTrashButton';

interface FileInfoProps {
  fileName: string;
  onRemoveFile: () => void;
}

const FileInfo = ({ fileName, onRemoveFile }: FileInfoProps) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <FileUp className="h-5 w-5 text-primary shrink-0" />
        <span className="font-medium truncate">{fileName}</span>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onRemoveFile}
        className="h-8 w-8 p-0"
      >
        <RoundTrashButton />
        <span className="sr-only">Remove</span>
      </Button>
    </div>
  );
};

export default FileInfo;
