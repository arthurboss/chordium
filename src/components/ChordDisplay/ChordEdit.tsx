import React from 'react';
import { ChordEditProps } from './types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Save, ArrowLeft } from 'lucide-react';
import { Textarea } from '../ui/textarea';

const ChordEdit: React.FC<ChordEditProps> = ({ 
  editContent, 
  setEditContent, 
  handleSaveEdits, 
  setIsEditing,
  onReturn
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <Card className="mb-4">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Edit Chord Sheet</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onReturn}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm" onClick={handleSaveEdits}>
                <Save className="mr-1 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Textarea 
        value={editContent} 
        onChange={(e) => setEditContent(e.target.value)}
        className="flex-1 font-mono text-sm resize-none"
      />
    </div>
  );
};

export default ChordEdit;