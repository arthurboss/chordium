import React from 'react';
import { ChordEditProps } from './types';
import { CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import ChordEditToolbar from './ChordEditToolbar';
import StickyBottomContainer from '../StickyBottomContainer';
import { useAtBottom } from '@/hooks/useAtBottom';

const ChordEdit: React.FC<ChordEditProps> = ({ editContent, setEditContent, handleSaveEdits, setIsEditing }) => {
  const isAtBottom = useAtBottom();
  return (
    <div className="w-full mx-auto flex flex-col">
      <Textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className="min-h-[500px] font-mono text-sm resize-none mb-4"
      />
      <StickyBottomContainer isAtBottom={isAtBottom}>
        <CardContent className="p-3 sm:p-4">
          <ChordEditToolbar
            onSave={handleSaveEdits}
            onReturn={() => setIsEditing(false)}
          />
        </CardContent>
      </StickyBottomContainer>
    </div>
  );
};

export default ChordEdit;