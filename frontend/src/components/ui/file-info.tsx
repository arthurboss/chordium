import { FileUp } from 'lucide-react';
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
      <RoundTrashButton onClick={onRemoveFile} />
    </div>
  );
};

export default FileInfo;
