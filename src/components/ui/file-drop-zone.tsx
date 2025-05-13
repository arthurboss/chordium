import React, { ReactNode } from 'react';

interface FileDropZoneProps {
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  children: ReactNode;
}

const FileDropZone = ({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  children
}: FileDropZoneProps) => {
  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        isDragOver ? 'border-primary bg-primary/5' : 'border-border'
      } transition-colors`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
    </div>
  );
};

export default FileDropZone;
