import React, { useState } from 'react';
import { ChordEditProps } from './types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Save, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';

const ChordEdit: React.FC<ChordEditProps> = ({ 
  editContent, 
  setEditContent, 
  handleSaveEdits, 
  setIsEditing,
  onReturn
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <div className={`w-full mx-auto flex flex-col transition-all duration-200 ${isFullScreen ? 'fixed inset-0 bg-background z-50' : 'max-w-3xl h-[calc(100vh-12rem)]'}`}>
      <Card className={`mb-4 ${isFullScreen ? 'rounded-none' : ''}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Edit Chord Sheet</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onReturn}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
              >
                {isFullScreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
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
        className={`flex-1 font-mono text-sm resize-none ${isFullScreen ? 'rounded-none' : ''}`}
      />
    </div>
  );
};

export default ChordEdit;