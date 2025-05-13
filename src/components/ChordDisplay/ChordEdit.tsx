import React from 'react';
import { ChordEditProps } from './types';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import ChordEditToolbar from './ChordEditToolbar';

const ChordEdit: React.FC<ChordEditProps> = ({ editContent, setEditContent, handleSaveEdits, setIsEditing }) => {
  return (
    <div className="w-full mx-auto flex flex-col">
      <Card className="mb-4">
        <CardContent className="p-3 sm:p-4">
          <ChordEditToolbar
            onSave={handleSaveEdits}
            onReturn={() => setIsEditing(false)}
          />
        </CardContent>
      </Card>
      <Textarea 
        value={editContent} 
        onChange={(e) => setEditContent(e.target.value)}
        className="min-h-[500px] font-mono text-sm resize-none"
      />
    </div>
  );
};

export default ChordEdit; 